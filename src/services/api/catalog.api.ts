import {
  CategoryItem,
  CreateProductInput,
  ProductItem,
  UpdateProductInput,
} from '../../types/domain.types';
import { request } from './client';

export const CatalogApi = {
  syncDelta(
    token: string,
    updatedSince?: string,
  ): Promise<{
    serverTimestamp: string;
    categories: CategoryItem[];
    products: ProductItem[];
  }> {
    const query = updatedSince
      ? `?updatedSince=${encodeURIComponent(updatedSince)}`
      : '';
    return request(`/catalog/sync${query}`, { method: 'GET' }, token);
  },

  findByBarcode(token: string, barcodeOrSku: string): Promise<ProductItem> {
    return request<ProductItem>(
      `/catalog/products/barcode/${encodeURIComponent(barcodeOrSku.trim())}`,
      { method: 'GET' },
      token,
    );
  },

  listProducts(
    token: string,
    params?: {
      categoryId?: string;
      search?: string;
      includeInactive?: boolean;
    },
  ): Promise<ProductItem[]> {
    const qs = new URLSearchParams();
    if (params?.categoryId) qs.set('categoryId', params.categoryId);
    if (params?.search?.trim()) qs.set('search', params.search.trim());
    if (params?.includeInactive) qs.set('includeInactive', 'true');
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return request<ProductItem[]>(
      `/catalog/products${query}`,
      { method: 'GET' },
      token,
    );
  },

  listCategories(token: string): Promise<CategoryItem[]> {
    return request<CategoryItem[]>(
      '/catalog/categories',
      { method: 'GET' },
      token,
    );
  },

  createProduct(
    token: string,
    payload: CreateProductInput,
  ): Promise<ProductItem> {
    return request<ProductItem>(
      '/catalog/products',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  updateProduct(
    token: string,
    id: string,
    payload: UpdateProductInput,
  ): Promise<ProductItem> {
    return request<ProductItem>(
      `/catalog/products/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  deleteProduct(
    token: string,
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(
      `/catalog/products/${id}`,
      { method: 'DELETE' },
      token,
    );
  },
};

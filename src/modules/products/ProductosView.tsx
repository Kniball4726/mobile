import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { JustiFooter } from '../../components/JustiFooter';
import { CatalogApi } from '../../services/api.service';
import {
  CategoryItem,
  CreateProductInput,
  ProductItem,
  UpdateProductInput,
} from '../../types/domain.types';
import { ProductFilterBar } from './components/ProductFilterBar';
import { ProductFormModal } from './components/ProductFormModal';
import { ProductList } from './components/ProductList';
import { ProductQuickPriceModal } from './components/ProductQuickPriceModal';

interface ProductosViewProps {
  token: string;
  onProductUpdated?: () => void;
}

export const ProductosView: React.FC<ProductosViewProps> = ({
  token,
  onProductUpdated,
}) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [includeInactive, setIncludeInactive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal para edición rápida de precio
  const [quickPriceProduct, setQuickPriceProduct] =
    useState<ProductItem | null>(null);
  const [quickPriceValue, setQuickPriceValue] = useState<string>('');
  const [quickCostValue, setQuickCostValue] = useState<string>('');
  const [savingPrice, setSavingPrice] = useState(false);

  // Modal para creación o edición completa
  const [fullModalOpen, setFullModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formBarcode, setFormBarcode] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formStock, setFormStock] = useState('0');
  const [formMinStock, setFormMinStock] = useState('5');
  const [formUnit, setFormUnit] = useState<'UNIT' | 'KG' | 'LITER'>('UNIT');
  const [savingFull, setSavingFull] = useState(false);

  // Cargar categorías y productos
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, prods] = await Promise.all([
        CatalogApi.listCategories(token),
        CatalogApi.listProducts(token, {
          categoryId: selectedCategory === 'ALL' ? undefined : selectedCategory,
          search: search.trim() || undefined,
          includeInactive,
        }),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al consultar productos del catálogo.',
      );
    } finally {
      setLoading(false);
    }
  }, [token, selectedCategory, search, includeInactive]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categoriesMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c._id, c.name));
    return map;
  }, [categories]);

  // Manejo de Edición Rápida de Precio
  const openQuickPriceModal = (product: ProductItem) => {
    setQuickPriceProduct(product);
    const priceInPesos =
      product.priceCents > 0
        ? (product.priceCents / 100).toFixed(2)
        : String(product.price || 0);
    const costInPesos =
      (product.costCents || 0) > 0
        ? ((product.costCents || 0) / 100).toFixed(2)
        : '0.00';
    setQuickPriceValue(priceInPesos);
    setQuickCostValue(costInPesos);
  };

  const handleSaveQuickPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickPriceProduct) return;

    const parsedPrice = parseFloat(quickPriceValue);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError('Por favor ingrese un precio válido.');
      return;
    }

    const priceCents = Math.round(parsedPrice * 100);
    const costCents = Math.round((parseFloat(quickCostValue) || 0) * 100);

    setSavingPrice(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await CatalogApi.updateProduct(token, quickPriceProduct._id, {
        priceCents,
        costCents,
      });

      setSuccessMsg(
        `Precio de "${quickPriceProduct.name}" actualizado a $${parsedPrice.toLocaleString(
          'es-AR',
          { minimumFractionDigits: 2 },
        )} correctamente.`,
      );
      setQuickPriceProduct(null);
      await loadData();
      if (onProductUpdated) onProductUpdated();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al actualizar el precio del producto.',
      );
    } finally {
      setSavingPrice(false);
    }
  };

  // Manejo de Creación / Edición Completa
  const openNewProductModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku('');
    setFormBarcode('');
    setFormCategoryId(categories[0]?._id || '');
    setFormPrice('');
    setFormCost('');
    setFormStock('0');
    setFormMinStock('5');
    setFormUnit('UNIT');
    setFullModalOpen(true);
  };

  const openEditProductModal = (product: ProductItem) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSku(product.sku);
    setFormBarcode(product.barcode || '');
    setFormCategoryId(product.categoryId);
    setFormPrice(
      product.priceCents > 0
        ? (product.priceCents / 100).toFixed(2)
        : String(product.price || 0),
    );
    setFormCost(
      (product.costCents || 0) > 0
        ? ((product.costCents || 0) / 100).toFixed(2)
        : '0.00',
    );
    setFormStock(String(product.stock || 0));
    setFormMinStock(String(product.minStockAlert || 5));
    setFormUnit(product.unit || 'UNIT');
    setFullModalOpen(true);
  };

  const handleSaveFullProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategoryId) {
      setError('Debe seleccionar una categoría para el producto.');
      return;
    }

    const priceNum = parseFloat(formPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('El precio debe ser un número válido mayor o igual a cero.');
      return;
    }

    const priceCents = Math.round(priceNum * 100);
    const costCents = Math.round((parseFloat(formCost) || 0) * 100);
    const stockNum = Math.max(0, parseInt(formStock, 10) || 0);
    const minStockNum = Math.max(0, parseInt(formMinStock, 10) || 5);

    setSavingFull(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (editingProduct) {
        const updatePayload: UpdateProductInput = {
          name: formName.trim(),
          sku: formSku.trim().toUpperCase(),
          barcode: formBarcode.trim() || null,
          categoryId: formCategoryId,
          priceCents,
          costCents,
          stock: stockNum,
          minStockAlert: minStockNum,
        };
        await CatalogApi.updateProduct(token, editingProduct._id, updatePayload);
        setSuccessMsg(`Producto "${formName}" actualizado exitosamente.`);
      } else {
        const createPayload: CreateProductInput = {
          name: formName.trim(),
          sku: formSku.trim().toUpperCase(),
          barcode: formBarcode.trim() || null,
          categoryId: formCategoryId,
          priceCents,
          costCents,
          initialStock: stockNum,
          minStockAlert: minStockNum,
          unit: formUnit,
        };
        await CatalogApi.createProduct(token, createPayload);
        setSuccessMsg(
          `Producto "${formName}" creado y habilitado en catálogo.`,
        );
      }
      setFullModalOpen(false);
      await loadData();
      if (onProductUpdated) onProductUpdated();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al guardar el producto en el catálogo.',
      );
    } finally {
      setSavingFull(false);
    }
  };

  // Toggle de Estado Activo / Inactivo
  const handleToggleActive = async (product: ProductItem) => {
    const nextState = !product.isActive;
    const confirmText = nextState
      ? `¿Desea reactivar el producto "${product.name}"?`
      : `¿Desea desactivar el producto "${product.name}"? No aparecerá en las ventas de POS.`;

    if (!window.confirm(confirmText)) return;

    setError(null);
    setSuccessMsg(null);
    try {
      await CatalogApi.updateProduct(token, product._id, {
        isActive: nextState,
      });
      setSuccessMsg(
        `Producto "${product.name}" ${
          nextState ? 'reactivado' : 'desactivado'
        } correctamente.`,
      );
      await loadData();
      if (onProductUpdated) onProductUpdated();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cambiar el estado del producto.',
      );
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF] pb-16 sm:pb-4">
      <div className="justi-title-strip flex items-center justify-between">
        <span>Gestión de Catálogo y Modificación de Precios</span>
        <span className="text-[11px] font-normal opacity-90 hidden sm:inline">
          Acceso exclusivo Administrador / Master
        </span>
      </div>

      <div className="p-2 sm:p-4 space-y-3 flex-1 max-w-[1440px] w-full mx-auto">
        {error && <div className="justi-alert-error">{error}</div>}
        {successMsg && <div className="justi-alert-success">{successMsg}</div>}

        {/* Barra de Filtros y Acciones */}
        <ProductFilterBar
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          includeInactive={includeInactive}
          setIncludeInactive={setIncludeInactive}
          loading={loading}
          onRefresh={loadData}
          onNewProduct={openNewProductModal}
        />

        {/* Listado de Productos (Móvil y Escritorio) */}
        <ProductList
          products={products}
          categoriesMap={categoriesMap}
          loading={loading}
          onOpenQuickPrice={openQuickPriceModal}
          onOpenEditProduct={openEditProductModal}
          onToggleActive={handleToggleActive}
        />

        <JustiFooter className="mt-8" />
      </div>

      {/* Modal 1: Modificación Rápida de Precio */}
      <ProductQuickPriceModal
        product={quickPriceProduct}
        priceValue={quickPriceValue}
        setPriceValue={setQuickPriceValue}
        costValue={quickCostValue}
        setCostValue={setQuickCostValue}
        saving={savingPrice}
        onSave={handleSaveQuickPrice}
        onClose={() => setQuickPriceProduct(null)}
      />

      {/* Modal 2: Creación / Edición Completa */}
      <ProductFormModal
        isOpen={fullModalOpen}
        editingProduct={editingProduct}
        formName={formName}
        setFormName={setFormName}
        formSku={formSku}
        setFormSku={setFormSku}
        formBarcode={formBarcode}
        setFormBarcode={setFormBarcode}
        formCategoryId={formCategoryId}
        setFormCategoryId={setFormCategoryId}
        formPrice={formPrice}
        setFormPrice={setFormPrice}
        formCost={formCost}
        setFormCost={setFormCost}
        formStock={formStock}
        setFormStock={setFormStock}
        formMinStock={formMinStock}
        setFormMinStock={setFormMinStock}
        formUnit={formUnit}
        setFormUnit={setFormUnit}
        categories={categories}
        saving={savingFull}
        onSave={handleSaveFullProduct}
        onClose={() => setFullModalOpen(false)}
      />
    </div>
  );
};

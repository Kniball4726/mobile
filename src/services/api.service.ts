import {
  ApiKeyRecord,
  AuditLogRecord,
  BranchType,
  CashOperationRecord,
  CashRegisterRecord,
  CategoryItem,
  CreateProductInput,
  CustomerItem,
  GlobalSystemSettings,
  LoginResponse,
  ProductItem,
  SalePreviewResponse,
  SaleRecord,
  UpdateProductInput,
  UserRecord,
  UserRole,
} from '../types/domain.types';

function resolveApiBaseUrl(): string {
  const raw = (
    import.meta.env.VITE_API_URL || 'https://justimobileapi.onrender.com/api/v1'
  )
    .trim()
    .replace(/\/+$/, '');
  return raw.endsWith('/api/v1') ? raw : `${raw}/api/v1`;
}

export const API_BASE_URL = resolveApiBaseUrl();

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errMessage =
      data?.error?.message ||
      data?.message ||
      `Error HTTP ${res.status} al comunicarse con el servidor`;
    throw new Error(errMessage);
  }

  return data as T;
}

export const AuthApi = {
  login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

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

export const CrmApi = {
  searchCustomers(
    token: string,
    query = '',
    onlyWithDiscount = false,
  ): Promise<CustomerItem[]> {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (onlyWithDiscount) params.set('onlyWithDiscount', 'true');
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<CustomerItem[]>(
      `/crm/customers/search${qs}`,
      { method: 'GET' },
      token,
    );
  },

  registerOrUpdateCustomer(
    token: string,
    payload: {
      fullName: string;
      email: string;
      discountPercentage: number;
    },
  ): Promise<CustomerItem> {
    return request<CustomerItem>(
      '/crm/customers',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  assignDiscount(
    token: string,
    customerId: string,
    discountPercentage: number,
  ): Promise<CustomerItem> {
    return request<CustomerItem>(
      `/crm/customers/${customerId}/discount`,
      {
        method: 'PATCH',
        body: JSON.stringify({ discountPercentage }),
      },
      token,
    );
  },
};

export const SalesApi = {
  previewSale(
    token: string,
    payload: {
      items: Array<{ productId: string; quantity: number }>;
      customerId?: string | null;
      applyCustomerDiscount: boolean;
    },
  ): Promise<SalePreviewResponse> {
    return request<SalePreviewResponse>(
      '/sales/preview',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  createSale(
    token: string,
    idempotencyKey: string,
    payload: {
      items: Array<{ productId: string; quantity: number }>;
      customerId?: string | null;
      applyCustomerDiscount: boolean;
      payments: Array<{
        method: 'CASH' | 'CARD' | 'TRANSFER';
        amountCents: number;
        reference?: string | null;
      }>;
    },
  ): Promise<{
    idempotentReplay: boolean;
    sale: {
      _id: string;
      receiptNumber: string;
      subtotalCents: number;
      discountPercentageApplied: number;
      discountCents: number;
      taxCents: number;
      totalCents: number;
      changeDueCents: number;
      createdAt: string;
    };
  }> {
    return request(
      '/sales',
      {
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          ...payload,
          idempotencyKey,
          deviceTimestamp: new Date().toISOString(),
        }),
      },
      token,
    );
  },

  listSales(
    token: string,
    cashierId?: string,
    limit = 100,
  ): Promise<SaleRecord[]> {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (cashierId && cashierId.trim()) {
      params.set('cashierId', cashierId.trim());
    }
    return request<SaleRecord[]>(
      `/sales?${params.toString()}`,
      { method: 'GET' },
      token,
    );
  },
};

export const MasterApi = {
  getSettings(token: string): Promise<GlobalSystemSettings> {
    return request<GlobalSystemSettings>(
      '/master/settings',
      { method: 'GET' },
      token,
    );
  },

  updateSettings(
    token: string,
    payload: Partial<GlobalSystemSettings>,
  ): Promise<GlobalSystemSettings> {
    return request<GlobalSystemSettings>(
      '/master/settings',
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  listApiKeys(token: string): Promise<ApiKeyRecord[]> {
    return request<ApiKeyRecord[]>('/master/api-keys', { method: 'GET' }, token);
  },

  createApiKey(
    token: string,
    payload: { name: string; scopes: string[]; expiresInDays?: number | null },
  ): Promise<ApiKeyRecord & { warning?: string }> {
    return request(
      '/master/api-keys',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  revokeApiKey(token: string, id: string): Promise<ApiKeyRecord> {
    return request<ApiKeyRecord>(
      `/master/api-keys/${id}/revoke`,
      { method: 'PATCH' },
      token,
    );
  },

  revokeAllSessions(
    token: string,
  ): Promise<{ revokedUsersCount: number; executedAt: string }> {
    return request(
      '/master/security/revoke-all-sessions',
      { method: 'POST' },
      token,
    );
  },

  listAuditLogs(token: string): Promise<AuditLogRecord[]> {
    return request<AuditLogRecord[]>(
      '/master/audit-logs?limit=50',
      { method: 'GET' },
      token,
    );
  },
};

export const TreasuryApi = {
  listRegisters(
    token: string,
    branch = 'LOCALES',
  ): Promise<CashRegisterRecord[]> {
    return request<CashRegisterRecord[]>(
      `/treasury/registers?branch=${encodeURIComponent(branch)}`,
      { method: 'GET' },
      token,
    );
  },

  openRegister(
    token: string,
    payload: {
      boxType: 'Ventas Sucursal' | 'Caja Consolidada';
      branch?: string;
      observations?: string;
    },
  ): Promise<CashRegisterRecord> {
    return request<CashRegisterRecord>(
      '/treasury/registers/open',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  closeRegister(token: string, id: string): Promise<CashRegisterRecord> {
    return request<CashRegisterRecord>(
      `/treasury/registers/${encodeURIComponent(id)}/close`,
      { method: 'PATCH' },
      token,
    );
  },

  listOperations(
    token: string,
    branch = 'LOCALES',
  ): Promise<CashOperationRecord[]> {
    return request<CashOperationRecord[]>(
      `/treasury/operations?branch=${encodeURIComponent(branch)}`,
      { method: 'GET' },
      token,
    );
  },

  createOperation(
    token: string,
    payload: {
      type:
        | 'INGRESO_EXTRAORDINARIO'
        | 'EGRESO_EXTRAORDINARIO'
        | 'TRANSFERENCIA_CAJAS'
        | 'GASTO';
      amount: number;
      category?: string;
      detail: string;
      branch?: string;
    },
  ): Promise<CashOperationRecord> {
    return request<CashOperationRecord>(
      '/treasury/operations',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },
};

export const UsersApi = {
  listUsers(token: string): Promise<UserRecord[]> {
    return request<UserRecord[]>('/users', { method: 'GET' }, token);
  },

  createUser(
    token: string,
    payload: {
      fullName: string;
      email: string;
      password: string;
      role: Exclude<UserRole, 'MASTER'>;
      branch: BranchType;
    },
  ): Promise<UserRecord> {
    return request<UserRecord>(
      '/users',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  assignBranch(
    token: string,
    userId: string,
    branch: BranchType,
  ): Promise<UserRecord> {
    return request<UserRecord>(
      `/users/${encodeURIComponent(userId)}/branch`,
      {
        method: 'PATCH',
        body: JSON.stringify({ branch }),
      },
      token,
    );
  },
};

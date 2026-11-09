export type UserRole = 'MASTER' | 'ADMIN' | 'CRM' | 'CASHIER';

export type BranchType = 'LOCALES' | 'CARRERAS';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  branch?: BranchType;
}

export interface UserRecord {
  _id: string;
  email: string;
  fullName: string;
  role: UserRole;
  branch: BranchType;
  isActive: boolean;
  createdAt: string;
}

export interface LoginResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  colorHex: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductItem {
  _id: string;
  externalId: number | null;
  categoryId: string;
  categoryName?: string;
  sku: string;
  barcode: string | null;
  name: string;
  price: number;
  priceCents: number;
  costCents?: number;
  taxRateBasisPoints: number;
  stock: number;
  minStockAlert?: number;
  trackInventory?: boolean;
  unit: 'UNIT' | 'KG' | 'LITER';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductInput {
  name: string;
  categoryId: string;
  sku: string;
  barcode?: string | null;
  priceCents: number;
  costCents?: number;
  initialStock?: number;
  minStockAlert?: number;
  unit?: 'UNIT' | 'KG' | 'LITER';
}

export interface UpdateProductInput {
  name?: string;
  categoryId?: string;
  sku?: string;
  barcode?: string | null;
  priceCents?: number;
  costCents?: number;
  stock?: number;
  minStockAlert?: number;
  isActive?: boolean;
}

export interface CustomerItem {
  _id: string;
  fullName: string;
  email: string;
  branch?: BranchType;
  activeDiscount: {
    isAvailable: boolean;
    percentage: number;
    assignedAt: string;
    consumedAt: string | null;
    consumedInSaleNumber: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
  observations: string;
}

export interface SalePreviewResponse {
  customer: {
    id: string;
    fullName: string;
    email: string;
    discountPercentageAvailable: number;
  } | null;
  items: Array<{
    productId: string;
    sku: string;
    name: string;
    quantity: number;
    unitPriceCents: number;
    lineSubtotalCents: number;
  }>;
  subtotalCents: number;
  discountPercentageApplied: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
}

export interface GlobalSystemSettings {
  key: 'GLOBAL_CONFIG';
  businessName: string;
  receiptFooterText: string | null;
  maxCrmDiscountPercentage: number;
  defaultTaxRateBasisPoints: number;
  maintenanceMode: {
    posPaused: boolean;
    crmPaused: boolean;
    reason: string | null;
  };
}

export interface ApiKeyRecord {
  _id?: string;
  id?: string;
  name: string;
  apiKey?: string;
  keyPrefix: string;
  scopes: string[];
  isActive?: boolean;
  expiresAt: string | null;
  lastUsedAt?: string | null;
  createdAt: string;
}

export interface AuditLogRecord {
  _id: string;
  action: string;
  actorType: 'USER' | 'API_KEY';
  actorIdentifier: string;
  targetCollection: string | null;
  targetId: string | null;
  createdAt: string;
}

export interface SaleRecord {
  _id: string;
  receiptNumber: string;
  cashierId: string;
  cashierSnapshot?: {
    id: string;
    fullName: string;
    email: string;
    branch: BranchType;
    role: UserRole;
  } | null;
  customerId: string | null;
  customerSnapshot: {
    fullName: string;
    email: string;
    discountPercentageApplied: number;
  } | null;
  items: Array<{
    productId: string;
    sku: string;
    name: string;
    quantity: number;
    unitPriceCents: number;
    lineSubtotalCents: number;
  }>;
  subtotalCents: number;
  discountPercentageApplied: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  payments: Array<{
    method: 'CASH' | 'CARD' | 'TRANSFER';
    amountCents: number;
    reference: string | null;
  }>;
  status: 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export type ActiveScreen =
  | 'BIENVENIDO'
  | 'NUEVA_VENTA'
  | 'VENTAS_USUARIOS'
  | 'CLIENTES'
  | 'APERTURA_CAJA'
  | 'PRODUCTOS'
  | 'USUARIOS'
  | 'MASTER_CONTROL';

export type TesoreriaTab =
  | 'CAJAS'
  | 'ABRIR_CAJA'
  | 'OPERACION_CAJA'
  | 'NUEVO_GASTO';

export interface CashRegisterRecord {
  id: string;
  userFullName: string;
  branch: string;
  boxType: 'Ventas Sucursal' | 'Caja Consolidada';
  openedAt: string;
  closedAt: string | null;
  status: 'ABIERTA' | 'CERRADA';
  initialBalance: number;
  currentBalance: number;
  observations: string;
}

export interface CashOperationRecord {
  id: string;
  type:
    | 'INGRESO_EXTRAORDINARIO'
    | 'EGRESO_EXTRAORDINARIO'
    | 'TRANSFERENCIA_CAJAS'
    | 'GASTO';
  amount: number;
  category?: string;
  detail: string;
  createdAt: string;
  branch: string;
  userFullName?: string;
}

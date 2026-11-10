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
  dni?: string;
  taxId?: string;
  ivaCondition?: string;
  creditAccountBalance?: number;
  creditLimit?: number;
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
  observations?: string;
  customPrice?: number;
  discountPercent?: number;
  discountInput?: string;
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

export interface MaskedMercadoPagoSettings {
  isEnabled: boolean;
  isSandbox: boolean;
  publicKey: string | null;
  accessTokenMasked: string | null;
  hasAccessToken: boolean;
  hasWebhookSecret: boolean;
  posId: string | null;
  userId: string | null;
  updatedAt: string | null;
}

export interface TestMpConnectionResult {
  success: boolean;
  status: 'ACTIVE' | 'ERROR';
  collectorId: number;
  nickname: string;
  email: string;
  siteId: string;
  message: string;
}

export interface MaskedAfipSettings {
  isEnabled: boolean;
  isProduction: boolean;
  cuit: string | null;
  puntoVenta: number | null;
  hasCert: boolean;
  certPreview: string | null;
  hasPrivateKey: boolean;
  privateKeyMasked: string | null;
  defaultConcepto: number;
  defaultCbteTipo: number;
  updatedAt: string | null;
}

export interface TestAfipConnectionResult {
  success: boolean;
  message: string;
  environment: 'Homologación (Testing)' | 'Producción';
  cuit: string | null;
  servers?: {
    appServer: string;
    dbServer: string;
    authServer: string;
  };
  diagnostics?: {
    cuitValid: boolean;
    hasCert: boolean;
    hasPrivateKey: boolean;
    latencyMs?: number;
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
  registerId?: string | null;
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

export interface BusinessIntelligenceData {
  timeRange: 'today' | '7d' | '30d' | 'all';
  branch: string;
  generatedAt: string;
  summary: {
    totalRevenuePesos: number;
    totalTransactions: number;
    averageTicketPesos: number;
    totalItemsSold: number;
    totalDiscountsPesos: number;
    cancelledCount: number;
    cancelledRevenuePesos: number;
    totalExpensesPesos: number;
    operatingCashFlowPesos: number;
    digitalPaymentRatio: number;
  };
  dailyTrend: Array<{
    date: string;
    label: string;
    totalPesos: number;
    transactions: number;
    localesPesos: number;
    carrerasPesos: number;
  }>;
  paymentMix: Array<{
    method: string;
    label: string;
    totalPesos: number;
    count: number;
    percentage: number;
  }>;
  topProducts: Array<{
    productId: string;
    sku: string;
    name: string;
    unitsSold: number;
    totalRevenuePesos: number;
    sharePercentage: number;
  }>;
  branchBenchmark: {
    locales: {
      totalPesos: number;
      transactions: number;
      averageTicketPesos: number;
      sharePercentage: number;
    };
    carreras: {
      totalPesos: number;
      transactions: number;
      averageTicketPesos: number;
      sharePercentage: number;
    };
  };
  staffLeaderboard: Array<{
    cashierId: string;
    fullName: string;
    email: string;
    branch: string;
    totalSalesPesos: number;
    transactionsCount: number;
    averageTicketPesos: number;
  }>;
  crmInsights: {
    regularSalesCount: number;
    crmSalesCount: number;
    crmAdoptionRate: number;
    totalCrmDiscountPesos: number;
  };
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

export type MasterTab =
  | 'EMPRESAS'
  | 'INTEGRACIONES'
  | 'SEGURIDAD'
  | 'AUDITORIA';

export interface ClosureSummary {
  registerId: string;
  userFullName: string;
  branch: string;
  boxType: string;
  status: string;
  openedAt: string;
  openedAtIso: string;
  closedAt: string | null;
  closedAtIso: string | null;
  totalSalesCount: number;
  totalSalesCents: number;
  totalSales: number;
  totalsByMethod: {
    cashCents: number;
    cash: number;
    cardCents: number;
    card: number;
    qrMpCents: number;
    qrMp: number;
    qrScCents: number;
    qrSc: number;
    canjesCents: number;
    canjes: number;
    otherCents: number;
    other: number;
  };
  operationsSummary: {
    incomesCents: number;
    incomes: number;
    withdrawalsCents: number;
    withdrawals: number;
    expensesCents: number;
    expenses: number;
  };
  initialBalanceCents: number;
  initialBalance: number;
  expectedCashCents: number;
  expectedCash: number;
  declaredCashCents: number;
  declaredCash: number;
  differenceCents: number;
  difference: number;
}

export interface CashRegisterRecord {
  id: string;
  userId?: string | null;
  userFullName: string;
  branch: string;
  boxType: 'Ventas Sucursal' | 'Caja Consolidada';
  openedAt: string;
  closedAt: string | null;
  status: 'ABIERTA' | 'CERRADA';
  initialBalance: number;
  currentBalance: number;
  observations: string;
  closureSummary?: ClosureSummary | null;
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

export interface CompanyBranding {
  logoUrl?: string | null;
  bannerUrl?: string | null;
  primaryColor?: string | null;
  slogan?: string | null;
  customSvg?: string | null;
}

export interface CompanyRecord {
  _id: string;
  name: string;
  legalName: string;
  cuit: string;
  cuitFormatted: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  address: string | null;
  phone: string | null;
  email: string | null;
  branding: CompanyBranding;
  isDefault: boolean;
  afipEnabled: boolean;
  mercadoPagoEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicBrandingInfo {
  companyId: string;
  companyName: string;
  legalName: string;
  cuit: string;
  slogan: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  customSvg: string | null;
  status: string;
}


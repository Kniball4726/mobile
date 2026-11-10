import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CartItem,
  CategoryItem,
  CustomerItem,
  ProductItem,
  UserProfile,
} from '../../types/domain.types';
import { CatalogApi, CrmApi, SalesApi } from '../../services/api.service';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { CameraBarcodeModal } from '../../components/CameraBarcodeModal';
import {
  Barcode,
  Camera,
  Trash2,
  UserPlus,
  CheckCircle2,
  Sparkles,
  Plus,
  Minus,
} from 'lucide-react';

interface NuevaVentaViewProps {
  token: string;
  user: UserProfile;
  products: ProductItem[];
  categories: CategoryItem[];
  preselectedCustomer: CustomerItem | null;
  consumidorFinalMode: boolean;
  isCajaOpen: boolean;
  onOpenCajaQuick: () => void;
  onGoToClientes: () => void;
  onSaleCompleted: (amountPesos: number) => void;
}

const JUSTI_PAYMENT_METHODS: Array<{
  label: string;
  backendMethod: 'CASH' | 'CARD' | 'TRANSFER';
}> = [
  { label: 'Efectivo', backendMethod: 'CASH' },
  { label: 'Tarjeta debito/credito', backendMethod: 'CARD' },
  { label: 'QR mercado pago', backendMethod: 'TRANSFER' },
  { label: 'QR sport club', backendMethod: 'TRANSFER' },
  { label: 'diferencia vuelto / canjes', backendMethod: 'CASH' },
];

export const JUSTI_CARD_PLANS: string[] = [
  'CUOTA SIMPLE - 3 SIN INTERES (0.00 %)',
  'CREDITO AMEX - Amex - 1 Cuota sin interes (0.00 %)',
  'CREDITO AMEX - Amex - 3 cuotas s/interes (0.00 %)',
  'VISA - MASTER - CREDITO - bancarizada - 1 cuota sin interes (0.00 %)',
  'CREDITO CABAL - Cabal - 1 cuota sin interes (0.00 %)',
  'CREDITO CABAL - Cabal - 3 cuotas s/interes (0.00 %)',
  'VISA - MASTER - DEBITO - DEBITO (0.00 %)',
  'NARANJA - Naranja visa o master - 1 cuota sin interes (0.00 %)',
];

export const NuevaVentaView: React.FC<NuevaVentaViewProps> = ({
  token,
  user,
  products,
  categories,
  preselectedCustomer,
  consumidorFinalMode,
  isCajaOpen,
  onOpenCajaQuick,
  onGoToClientes,
  onSaleCompleted,
}) => {
  const defaultCustomerLabel = `${user.fullName || 'Operador'} (Consumidor Final)`;

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(
    preselectedCustomer,
  );
  const [customerSearch, setCustomerSearch] = useState(
    preselectedCustomer ? preselectedCustomer.fullName : defaultCustomerLabel,
  );
  const [customerResults, setCustomerResults] = useState<CustomerItem[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [applyCrmDiscount, setApplyCrmDiscount] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [codeSearch, setCodeSearch] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const assignedBranch = user.branch || 'LOCALES';
  const isBranchLocked = user.role !== 'ADMIN' && user.role !== 'MASTER';

  const [comprobante, setComprobante] = useState('Nota de Venta');
  const [sucursal, setSucursal] = useState(assignedBranch);
  const [remitoNumber, setRemitoNumber] = useState('');
  const [paymentLabel, setPaymentLabel] = useState('Efectivo');
  const [selectedCardPlan, setSelectedCardPlan] = useState<string>(
    JUSTI_CARD_PLANS[0],
  );
  const [generalObservations, setGeneralObservations] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastReceipt, setLastReceipt] = useState<{
    receiptNumber: string;
    totalPesos: number;
    discountApplied: number;
    cardPlan?: string;
  } | null>(null);

  useEffect(() => {
    if (preselectedCustomer) {
      setSelectedCustomer(preselectedCustomer);
      setCustomerSearch(preselectedCustomer.fullName);
    } else {
      setSelectedCustomer(null);
      setCustomerSearch(defaultCustomerLabel);
    }
  }, [preselectedCustomer, consumidorFinalMode, defaultCustomerLabel]);

  useEffect(() => {
    if (
      !showCustomerDropdown ||
      customerSearch.trim().length === 0 ||
      customerSearch === defaultCustomerLabel ||
      customerSearch === 'CONSUMIDOR FINAL' ||
      customerSearch.includes('(Consumidor Final)')
    ) {
      setCustomerResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await CrmApi.searchCustomers(token, customerSearch.trim());
        setCustomerResults(res);
      } catch {
        setCustomerResults([]);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [customerSearch, showCustomerDropdown, token]);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c._id, c.name));
    return map;
  }, [categories]);

  const addProductToCart = useCallback((product: ProductItem) => {
    setError(null);
    setLastReceipt(null);
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product._id === product._id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + 1,
        };
        return updated;
      }
      return [...prev, { product, quantity: 1, observations: '' }];
    });
    setCodeSearch('');
  }, []);

  const handleBarcodeOrSkuLookup = useCallback(
    async (rawCode: string) => {
      const clean = rawCode.trim();
      if (!clean) return;
      setError(null);

      const localMatch = products.find(
        (p) =>
          p.barcode === clean ||
          p.sku.toLowerCase() === clean.toLowerCase() ||
          String(p.externalId) === clean,
      );

      if (localMatch) {
        addProductToCart(localMatch);
        return;
      }

      try {
        const remoteProduct = await CatalogApi.findByBarcode(token, clean);
        addProductToCart(remoteProduct);
      } catch {
        setError(
          `No se encontró ningún suplemento con Código / EAN-13 "${clean}".`,
        );
      }
    },
    [products, token, addProductToCart],
  );

  useBarcodeScanner({
    onScan: handleBarcodeOrSkuLookup,
    enabled: !isCameraOpen,
  });

  const productSuggestions = useMemo(() => {
    const q = codeSearch.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          (p.barcode && p.barcode.includes(q)),
      )
      .slice(0, 8);
  }, [codeSearch, products]);

  const activeDiscountPercent = useMemo(() => {
    if (
      selectedCustomer &&
      selectedCustomer.activeDiscount?.isAvailable &&
      selectedCustomer.activeDiscount.percentage > 0 &&
      applyCrmDiscount
    ) {
      return selectedCustomer.activeDiscount.percentage;
    }
    return 0;
  }, [selectedCustomer, applyCrmDiscount]);

  const totals = useMemo(() => {
    const grossPesos = cart.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0,
    );
    const discountPesos = Number(
      ((grossPesos * activeDiscountPercent) / 100).toFixed(2),
    );
    const finalTotalPesos = Math.max(
      0,
      Number((grossPesos - discountPesos).toFixed(2)),
    );
    const netWithoutTax = Number((finalTotalPesos / 1.21).toFixed(2));
    const ivaAmount = Number((finalTotalPesos - netWithoutTax).toFixed(2));

    return {
      grossPesos,
      discountPesos,
      netWithoutTax,
      ivaAmount,
      finalTotalPesos,
    };
  }, [cart, activeDiscountPercent]);

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      setCart((prev) => prev.filter((i) => i.product._id !== productId));
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.product._id === productId ? { ...i, quantity: newQty } : i,
      ),
    );
  };

  const selectedPayOption =
    JUSTI_PAYMENT_METHODS.find((m) => m.label === paymentLabel) ||
    JUSTI_PAYMENT_METHODS[0];

  const isCardPayment =
    selectedPayOption.backendMethod === 'CARD' ||
    paymentLabel.toUpperCase().includes('TARJETA');

  const handleCheckout = async () => {
    setError(null);
    setLastReceipt(null);

    if (!isCajaOpen) {
      setError(
        'Debe tener una caja de tipo "Ventas Sucursal" abierta antes de realizar una venta.',
      );
      return;
    }

    if (cart.length === 0) {
      setError('Agregue al menos un artículo vendido antes de guardar.');
      return;
    }

    setSubmitting(true);
    try {
      const idempotencyKey = `justi-pos-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      const preview = await SalesApi.previewSale(token, {
        items: cart.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        customerId: selectedCustomer ? selectedCustomer._id : null,
        applyCustomerDiscount: Boolean(
          selectedCustomer &&
            selectedCustomer.activeDiscount?.isAvailable &&
            applyCrmDiscount,
        ),
      });

      const refParts = [paymentLabel];
      if (isCardPayment) {
        refParts.push(`Plan: ${selectedCardPlan}`);
      }
      if (selectedCustomer) {
        refParts.push(`Cliente: ${selectedCustomer.fullName}`);
      } else {
        refParts.push(customerSearch || defaultCustomerLabel);
      }
      if (remitoNumber) {
        refParts.push(`Remito: ${remitoNumber}`);
      }

      const response = await SalesApi.createSale(token, idempotencyKey, {
        items: cart.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        customerId: selectedCustomer ? selectedCustomer._id : null,
        applyCustomerDiscount: Boolean(
          selectedCustomer &&
            selectedCustomer.activeDiscount?.isAvailable &&
            applyCrmDiscount,
        ),
        payments: [
          {
            method: selectedPayOption.backendMethod,
            amountCents: preview.totalCents,
            reference: refParts.join(' | '),
          },
        ],
      });

      const finalPesos = Number((response.sale.totalCents / 100).toFixed(2));
      setLastReceipt({
        receiptNumber: response.sale.receiptNumber,
        totalPesos: finalPesos,
        discountApplied: response.sale.discountPercentageApplied,
        cardPlan: isCardPayment ? selectedCardPlan : undefined,
      });

      if (selectedCustomer && response.sale.discountPercentageApplied > 0) {
        setSelectedCustomer({
          ...selectedCustomer,
          activeDiscount: {
            ...selectedCustomer.activeDiscount,
            isAvailable: false,
            consumedAt: new Date().toISOString(),
            consumedInSaleNumber: response.sale.receiptNumber,
          },
        });
      }

      setCart([]);
      setGeneralObservations('');
      setSelectedCustomer(null);
      setCustomerSearch(defaultCustomerLabel);
      onSaleCompleted(finalPesos);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al procesar la venta en el servidor.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('es-AR');

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF] pb-16 sm:pb-4">
      <div className="justi-title-strip">Nueva Venta</div>

      <div className="p-2 sm:p-4 space-y-3 flex-1 max-w-[1440px] w-full mx-auto">
        {!isCajaOpen && (
          <div className="justi-alert-error flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <span className="font-semibold">
              Debe tener una caja de tipo &quot;Ventas Sucursal&quot; abierta
              antes de realizar una venta
            </span>
            <button
              type="button"
              onClick={onOpenCajaQuick}
              className="justi-btn-primary w-full sm:w-auto font-bold"
            >
              Abrir Caja Ahora
            </button>
          </div>
        )}

        {error && <div className="justi-alert-error">{error}</div>}

        {lastReceipt && (
          <div className="justi-alert-success flex items-start sm:items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Venta Registrada (ACID):</strong> Comprobante{' '}
              <span className="font-mono font-bold">
                {lastReceipt.receiptNumber}
              </span>{' '}
              por{' '}
              <strong>
                ${lastReceipt.totalPesos.toLocaleString('es-AR')}
              </strong>
              {lastReceipt.discountApplied > 0 &&
                ` (Descuento CRM ${lastReceipt.discountApplied}% consumido automáticamente)`}
              {lastReceipt.cardPlan && (
                <>
                  {' '}• <strong>Plan Tarjeta:</strong> {lastReceipt.cardPlan}
                </>
              )}
              .
            </span>
          </div>
        )}

        {/* Cabecera del Comprobante: 100% Responsive en Móvil y Escritorio */}
        <div className="rounded border border-slate-300 dark:border-slate-700 bg-[#F4F9FE] dark:bg-slate-800/90 p-2.5 sm:p-3 shadow-sm transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            {/* Columna Izquierda: Fecha, Cliente, Vendedor */}
            <div className="lg:col-span-5 space-y-2.5 text-xs">
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                <div>
                  <label className="block sm:inline sm:w-20 font-semibold text-slate-700 dark:text-slate-200 mb-0.5 sm:mb-0">
                    Fecha:
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={todayFormatted}
                    className="justi-input w-full sm:w-28 bg-white dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="sm:hidden flex items-end justify-end">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    X
                  </span>
                </div>
              </div>

              {/* Buscador de Cliente CRM + Botón Agregar Cliente */}
              <div className="space-y-1.5 sm:space-y-0 sm:flex sm:items-center gap-2 relative">
                <label className="block sm:w-20 font-semibold text-slate-700 dark:text-slate-200">
                  Cliente:
                </label>
                <div className="flex flex-col sm:flex-row flex-1 gap-1.5">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customerSearch}
                      onFocus={() => setShowCustomerDropdown(true)}
                      onBlur={() => {
                        if (!customerSearch.trim()) {
                          setCustomerSearch(defaultCustomerLabel);
                        }
                      }}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setSelectedCustomer(null);
                        setShowCustomerDropdown(true);
                      }}
                      placeholder="Buscar cliente por nombre o email..."
                      className="justi-input w-full font-medium"
                    />

                    {showCustomerDropdown && customerResults.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded border border-[#4E8EC2] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-30">
                        {customerResults.map((c) => (
                          <button
                            key={c._id}
                            type="button"
                            onClick={() => {
                              setSelectedCustomer(c);
                              setCustomerSearch(c.fullName);
                              setShowCustomerDropdown(false);
                              setApplyCrmDiscount(true);
                            }}
                            className="flex w-full items-center justify-between border-b border-slate-100 dark:border-slate-700 px-3 py-2.5 text-left text-xs hover:bg-[#E8F2FC] dark:hover:bg-slate-700"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                                {c.fullName}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {c.email}
                              </p>
                            </div>
                            {c.activeDiscount?.isAvailable &&
                            c.activeDiscount.percentage > 0 ? (
                              <span className="shrink-0 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-700 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                                {c.activeDiscount.percentage}% DTO CRM
                              </span>
                            ) : (
                              <span className="shrink-0 text-[10px] text-slate-400 dark:text-slate-500">
                                0% Dto
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={onGoToClientes}
                    className="justi-btn-primary w-full sm:w-auto py-2 sm:py-1"
                  >
                    <UserPlus className="mr-1 h-3.5 w-3.5" />
                    Agregar Cliente
                  </button>
                </div>
              </div>

              {/* Badge de Estado de Descuento CRM de Un Solo Uso */}
              {selectedCustomer && (
                <div className="sm:ml-20 rounded border border-[#9CC2E5] dark:border-slate-700 bg-[#DCEAF7] dark:bg-slate-800/90 px-2.5 py-2 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="truncate">
                    <span className="font-bold text-[#1B5E91] dark:text-sky-300">
                      Cliente CRM: {selectedCustomer.fullName}
                    </span>{' '}
                    <span className="text-slate-600 dark:text-slate-400">
                      ({selectedCustomer.email})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedCustomer.activeDiscount?.isAvailable &&
                    selectedCustomer.activeDiscount.percentage > 0 ? (
                      <label className="inline-flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={applyCrmDiscount}
                          onChange={(e) => setApplyCrmDiscount(e.target.checked)}
                        />
                        <Sparkles className="h-3.5 w-3.5" />
                        Aplicar {selectedCustomer.activeDiscount.percentage}% Dto.
                        Único
                      </label>
                    ) : (
                      <span className="text-amber-800 dark:text-amber-400 font-semibold">
                        Sin descuento activo{' '}
                        {selectedCustomer.activeDiscount?.consumedInSaleNumber
                          ? `(Ya usado en ${selectedCustomer.activeDiscount.consumedInSaleNumber})`
                          : ''}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(null);
                        setCustomerSearch(defaultCustomerLabel);
                      }}
                      className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline ml-1"
                      title="Quitar cliente y volver a Consumidor Final"
                    >
                      (Quitar)
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <label className="sm:w-20 font-semibold text-slate-700 dark:text-slate-200">
                  Vendedor:
                </label>
                <select className="justi-select w-full sm:w-52">
                  <option>{user.fullName}</option>
                  <option>Gregory Rodriguez</option>
                  <option>Daniel Cajero</option>
                </select>
              </div>
            </div>

            {/* Columna Central: Letra "X" en Desktop */}
            <div className="hidden lg:flex lg:col-span-2 items-center justify-center">
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100 select-none">
                X
              </span>
            </div>

            {/* Columna Derecha: Comprobante, Sucursal, Nº Remito */}
            <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-2 text-xs">
              <div className="col-span-2 sm:col-span-1 flex flex-col lg:flex-row lg:items-center lg:justify-end gap-1 lg:gap-2">
                <label className="lg:w-24 font-semibold text-slate-700 dark:text-slate-200">
                  Comprobante:
                </label>
                <select
                  value={comprobante}
                  onChange={(e) => setComprobante(e.target.value)}
                  className="justi-select w-full lg:w-48 text-slate-700 dark:text-slate-200"
                >
                  <option>Nota de Venta</option>
                  <option>Factura B</option>
                  <option>Consumidor Final</option>
                </select>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-1 lg:gap-2">
                <label className="lg:w-24 font-semibold text-slate-700 dark:text-slate-200">
                  Sucursal:
                </label>
                <select
                  value={isBranchLocked ? assignedBranch : sucursal}
                  disabled={isBranchLocked}
                  onChange={(e) => setSucursal(e.target.value as 'LOCALES' | 'CARRERAS')}
                  title={
                    isBranchLocked
                      ? 'Sucursal asignada por el Administrador (bloqueada)'
                      : 'Seleccionar sucursal'
                  }
                  className="justi-select w-full lg:w-48 font-semibold disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-700 dark:disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <option value="LOCALES">LOCALES</option>
                  <option value="CARRERAS">CARRERAS</option>
                </select>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-1 lg:gap-2">
                <label className="lg:w-24 font-semibold text-slate-700 dark:text-slate-200">
                  Nº Remito:
                </label>
                <input
                  type="text"
                  value={remitoNumber}
                  onChange={(e) => setRemitoNumber(e.target.value)}
                  placeholder="Opcional"
                  className="justi-input w-full lg:w-48"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN: ARTÍCULOS VENDIDOS */}
        <div className="border border-[#80AED8] bg-[#E8ECF8] rounded-sm overflow-hidden">
          <div className="justi-section-header flex items-center justify-between gap-2">
            <span>Artículos Vendidos</span>
            <button
              type="button"
              onClick={() => setIsCameraOpen(true)}
              className="inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-[11px] font-bold text-[#1B5E91] shadow-sm hover:bg-slate-50"
            >
              <Camera className="h-3.5 w-3.5 text-emerald-700" />
              <span>Escanear con Cámara</span>
            </button>
          </div>

          {/* Buscador por Código de Barras / SKU / Nombre */}
          <div className="p-2 bg-[#DCEAF7] border-b border-[#9CC2E5] relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (productSuggestions.length === 1) {
                  addProductToCart(productSuggestions[0]);
                } else {
                  handleBarcodeOrSkuLookup(codeSearch);
                }
              }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  data-barcode-input="true"
                  value={codeSearch}
                  onChange={(e) => setCodeSearch(e.target.value)}
                  placeholder="Código EAN-13, SKU o nombre del suplemento..."
                  className="justi-input w-full pl-8 py-2 sm:py-1.5 font-medium"
                />
                <Barcode className="absolute left-2.5 top-2.5 sm:top-2 h-4 w-4 text-[#1B5E91]" />
              </div>
              <div className="grid grid-cols-2 sm:flex gap-1.5">
                <button
                  type="submit"
                  className="justi-btn-primary py-2 sm:py-1.5 font-bold"
                >
                  Agregar Artículo
                </button>
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="sm:hidden justi-btn-primary py-2 font-bold"
                >
                  <Camera className="mr-1 h-4 w-4 text-emerald-700" />
                  Usar Cámara
                </button>
              </div>
            </form>

            {productSuggestions.length > 0 && (
              <div className="absolute left-2 right-2 mt-1 max-h-64 overflow-y-auto rounded border border-[#4E8EC2] bg-white shadow-2xl z-30">
                {productSuggestions.map((prod) => (
                  <button
                    key={prod._id}
                    type="button"
                    onClick={() => addProductToCart(prod)}
                    className="flex w-full items-center justify-between border-b border-slate-100 px-3 py-2.5 text-left text-xs hover:bg-[#E8F2FC]"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-mono font-bold text-[#1B5E91] mr-1.5">
                        [{prod.sku}]
                      </span>
                      <span className="font-semibold text-slate-900">
                        {prod.name}
                      </span>
                      {prod.barcode && (
                        <span className="block sm:inline sm:ml-2 font-mono text-[10px] text-slate-500">
                          EAN: {prod.barcode}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 font-bold text-emerald-800">
                      ${prod.price.toLocaleString('es-AR')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vista Mobile (< lg): Tarjetas táctiles de artículos */}
          <div className="lg:hidden p-2 space-y-2">
            {cart.length === 0 ? (
              <div className="rounded bg-white/80 p-4 text-center text-xs text-slate-500">
                Toque &quot;Usar Cámara&quot; o escriba el nombre/código del
                suplemento Ultra Tech para agregarlo.
              </div>
            ) : (
              cart.map((item) => {
                const unitPrice = item.product.price;
                const priceWithDesc = Number(
                  (unitPrice * (1 - activeDiscountPercent / 100)).toFixed(2),
                );
                const lineTotal = Number(
                  (priceWithDesc * item.quantity).toFixed(2),
                );
                return (
                  <div
                    key={item.product._id}
                    className="rounded border border-[#9CC2E5] bg-white p-2.5 text-xs shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-mono text-[11px] font-bold text-[#1B5E91]">
                          Cód: {item.product.sku}{' '}
                          {item.product.barcode
                            ? `• EAN: ${item.product.barcode}`
                            : ''}
                        </span>
                        <p className="font-bold text-slate-900 leading-snug">
                          {item.product.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product._id, 0)}
                        className="shrink-0 rounded border border-red-300 bg-red-50 p-1.5 text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity - 1)
                          }
                          className="justi-btn-primary h-8 w-8 p-0"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.product._id, item.quantity + 1)
                          }
                          className="justi-btn-primary h-8 w-8 p-0"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-slate-500">
                          Unit: ${unitPrice.toLocaleString('es-AR')}
                          {activeDiscountPercent > 0 && (
                            <span className="ml-1 font-bold text-emerald-700">
                              (-{activeDiscountPercent}%)
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-extrabold text-[#1B5E91]">
                          ${lineTotal.toLocaleString('es-AR')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Vista Tabla Clásica Desktop (>= lg) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-[#DCEAF7] text-[#1B5E91] border-b border-[#9CC2E5]">
                  <th className="py-1.5 px-2 text-left">Código</th>
                  <th className="py-1.5 px-2 text-left">
                    Rubro -&gt; Subrubro
                  </th>
                  <th className="py-1.5 px-2 text-left">Marca</th>
                  <th className="py-1.5 px-2 text-left">Artículo</th>
                  <th className="py-1.5 px-2 text-left">Observaciones</th>
                  <th className="py-1.5 px-2 text-center">Cantidad</th>
                  <th className="py-1.5 px-2 text-right">
                    Precio (Con Impuestos)
                  </th>
                  <th className="py-1.5 px-2 text-right">Desc/Rec (%)</th>
                  <th className="py-1.5 px-2 text-right">
                    Precio Con Desc/Rec
                  </th>
                  <th className="py-1.5 px-2 text-right">
                    Subtotal (Sin Impuestos)
                  </th>
                  <th className="py-1.5 px-2 text-center">IVA (%)</th>
                  <th className="py-1.5 px-2 text-center">Imp. Int. (%)</th>
                  <th className="py-1.5 px-2 text-right">
                    Subtotal (Con Impuestos)
                  </th>
                  <th className="py-1.5 px-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 ? (
                  <tr className="bg-[#E5E5F7]">
                    <td
                      colSpan={14}
                      className="py-3 px-3 text-center text-slate-500"
                    >
                      Sin artículos cargados. Use el lector de código de barras
                      o el buscador superior.
                    </td>
                  </tr>
                ) : (
                  cart.map((item) => {
                    const unitPrice = item.product.price;
                    const descPercent = activeDiscountPercent;
                    const priceWithDesc = Number(
                      (unitPrice * (1 - descPercent / 100)).toFixed(2),
                    );
                    const subConImp = Number(
                      (priceWithDesc * item.quantity).toFixed(2),
                    );
                    const subSinImp = Number((subConImp / 1.21).toFixed(2));
                    const rubroName =
                      categoryNameMap.get(item.product.categoryId) ||
                      'Suplementos';

                    return (
                      <tr
                        key={item.product._id}
                        className="border-b border-slate-300 bg-[#E5E5F7]"
                      >
                        <td className="p-1.5 font-mono font-bold">
                          {item.product.sku}
                        </td>
                        <td className="p-1.5">
                          <span className="block rounded bg-slate-200 px-2 py-0.5 text-slate-700">
                            {rubroName}
                          </span>
                        </td>
                        <td className="p-1.5">
                          <span className="block rounded bg-slate-200 px-2 py-0.5 text-slate-700">
                            ULTRA TECH
                          </span>
                        </td>
                        <td className="p-1.5 font-semibold text-slate-900">
                          {item.product.name}
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={item.observations}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCart((prev) =>
                                prev.map((c) =>
                                  c.product._id === item.product._id
                                    ? { ...c, observations: val }
                                    : c,
                                ),
                              );
                            }}
                            className="justi-input w-28"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(
                                item.product._id,
                                Number(e.target.value) || 1,
                              )
                            }
                            className="justi-input w-16 text-right font-bold"
                          />
                        </td>
                        <td className="p-1.5 text-right font-mono bg-white/80">
                          {unitPrice.toFixed(2)}
                        </td>
                        <td className="p-1.5 text-right font-mono font-bold text-emerald-800 bg-white/80">
                          {descPercent > 0
                            ? `-${descPercent.toFixed(2)}`
                            : '0.00'}
                        </td>
                        <td className="p-1.5 text-right font-mono bg-slate-200">
                          {priceWithDesc.toFixed(2)}
                        </td>
                        <td className="p-1.5 text-right font-mono bg-slate-200">
                          {subSinImp.toFixed(2)}
                        </td>
                        <td className="p-1.5 text-center font-mono bg-slate-200">
                          21.00
                        </td>
                        <td className="p-1.5 text-center font-mono bg-slate-200">
                          0.00
                        </td>
                        <td className="p-1.5 text-right font-mono font-bold bg-slate-200">
                          {subConImp.toFixed(2)}
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.product._id, 0)}
                            className="rounded border border-[#80AED8] bg-[#DCEAF7] p-1 text-[#1B5E91] hover:bg-red-100 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Franja Azul de Totales (#80AED8) */}
          <div className="justi-totals-strip p-2.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
            <div>
              <div className="font-bold text-slate-900 mb-0.5 text-[11px]">
                Total Neto
              </div>
              <div className="rounded bg-slate-200 px-2 py-1 text-right font-mono font-bold">
                {totals.netWithoutTax.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-900 mb-0.5 text-[11px]">
                Total Exento
              </div>
              <div className="rounded bg-slate-200 px-2 py-1 text-right font-mono font-bold">
                0.00
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-900 mb-0.5 text-[11px]">
                Total I.V.A.
              </div>
              <div className="rounded bg-slate-200 px-2 py-1 text-right font-mono font-bold">
                {totals.ivaAmount.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-900 mb-0.5 text-[11px]">
                Imp. Internos
              </div>
              <div className="rounded bg-slate-200 px-2 py-1 text-right font-mono font-bold">
                0.00
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-900 mb-0.5 text-[11px]">
                Descuentos / Rec.
              </div>
              <div className="rounded bg-white px-2 py-1 text-right font-mono font-bold text-emerald-800">
                {totals.discountPesos > 0
                  ? `-${totals.discountPesos.toFixed(2)}`
                  : '0.00'}
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-900 mb-0.5 text-[11px]">
                T O T A L
              </div>
              <div className="rounded bg-white border border-[#1B5E91] px-2 py-1 text-right font-mono font-extrabold text-[#1B5E91]">
                ${totals.finalTotalPesos.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN: FORMAS DE PAGO (Vista Tarjeta en Móvil + Tabla en Desktop) */}
        <div className="border border-[#80AED8] bg-[#E8ECF8] rounded-sm overflow-hidden">
          <div className="justi-section-header">Formas de Pago</div>

          {/* Vista Móvil (< md): Apilada sin scroll horizontal */}
          <div className="md:hidden p-2.5 space-y-2.5 text-xs">
            <div>
              <label className="block font-bold text-[#1B5E91] dark:text-sky-300 mb-1">
                Forma de Pago (#1):
              </label>
              <select
                value={paymentLabel}
                onChange={(e) => setPaymentLabel(e.target.value)}
                className="justi-select w-full font-bold"
              >
                {JUSTI_PAYMENT_METHODS.map((m) => (
                  <option key={m.label} value={m.label}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {isCardPayment && (
              <div className="rounded border border-[#9CC2E5] dark:border-slate-700 bg-[#F4F9FE] dark:bg-slate-800/90 p-2 space-y-1">
                <label className="block text-[11px] font-bold text-[#1B5E91] dark:text-sky-300">
                  Plan:
                </label>
                <select
                  value={selectedCardPlan}
                  onChange={(e) => setSelectedCardPlan(e.target.value)}
                  className="justi-select w-full text-xs font-semibold"
                >
                  {JUSTI_CARD_PLANS.map((plan) => (
                    <option key={plan} value={plan}>
                      {plan}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                  Sin Desc/Rec
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$${totals.grossPesos.toFixed(2)}`}
                  className="justi-input w-full text-right font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                  % Desc CRM
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${activeDiscountPercent.toFixed(1)}%`}
                  className="justi-input w-full text-right font-mono text-xs font-bold text-emerald-800 dark:text-emerald-400"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#1B5E91] dark:text-sky-300 mb-0.5">
                  A Cobrar
                </label>
                <input
                  type="text"
                  readOnly
                  value={`$${totals.finalTotalPesos.toFixed(2)}`}
                  className="justi-input w-full text-right font-mono text-xs font-extrabold text-[#1B5E91] dark:text-sky-300"
                />
              </div>
            </div>
          </div>

          {/* Vista Desktop (>= md): Tabla original de 6 columnas */}
          <div className="hidden md:block p-2.5 overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="text-[#1B5E91] dark:text-sky-300 border-b border-[#9CC2E5] dark:border-slate-700">
                  <th className="py-1 px-2 text-left w-8">#</th>
                  <th className="py-1 px-2 text-left">Forma de Pago</th>
                  <th className="py-1 px-2 text-right">Importe sin Desc/Rec</th>
                  <th className="py-1 px-2 text-left">Detalles</th>
                  <th className="py-1 px-2 text-right">% Desc/Rec</th>
                  <th className="py-1 px-2 text-right">Importe con Desc/Rec</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#E5E5F7] dark:bg-slate-800/60 border-b border-slate-300 dark:border-slate-700">
                  <td className="p-1.5 font-bold">1</td>
                  <td className="p-1.5">
                    <select
                      value={paymentLabel}
                      onChange={(e) => setPaymentLabel(e.target.value)}
                      className="justi-select w-64 font-semibold"
                    >
                      {JUSTI_PAYMENT_METHODS.map((m) => (
                        <option key={m.label} value={m.label}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1.5 text-right font-mono">
                    <input
                      type="text"
                      readOnly
                      value={totals.grossPesos.toFixed(2)}
                      className="justi-input w-28 text-right font-bold"
                    />
                  </td>
                  <td className="p-1.5 text-xs">
                    {isCardPayment ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap text-xs">
                          Plan:
                        </span>
                        <select
                          value={selectedCardPlan}
                          onChange={(e) => setSelectedCardPlan(e.target.value)}
                          className="justi-select text-xs font-semibold w-full max-w-sm"
                        >
                          {JUSTI_CARD_PLANS.map((plan) => (
                            <option key={plan} value={plan}>
                              {plan}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                        {selectedCustomer
                          ? `Cliente: ${selectedCustomer.fullName}`
                          : customerSearch || defaultCustomerLabel}
                      </span>
                    )}
                  </td>
                  <td className="p-1.5 text-right font-mono">
                    <input
                      type="text"
                      readOnly
                      value={activeDiscountPercent.toFixed(2)}
                      className="justi-input w-16 text-right"
                    />
                  </td>
                  <td className="p-1.5 text-right font-mono">
                    <input
                      type="text"
                      readOnly
                      value={totals.finalTotalPesos.toFixed(2)}
                      className="justi-input w-28 text-right font-extrabold text-[#1B5E91] dark:text-sky-300"
                    />
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-[#DCEAF7] font-bold text-[#1B5E91]">
                  <td colSpan={2} className="p-2">
                    TOTALES
                  </td>
                  <td className="p-2 text-right">
                    ${totals.grossPesos.toFixed(2)}
                  </td>
                  <td colSpan={2} className="p-2 text-right">
                    Descuentos/Recargos aplicados: $
                    {totals.discountPesos.toFixed(2)}
                  </td>
                  <td className="p-2 text-right">
                    ${totals.finalTotalPesos.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Observaciones Generales */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Observaciones:
          </label>
          <textarea
            rows={2}
            value={generalObservations}
            onChange={(e) => setGeneralObservations(e.target.value)}
            className="justi-input w-full"
          />
        </div>

        {/* Caja Azul Inferior de Botones Guardar / Cancelar */}
        <div className="flex justify-center py-2">
          <div className="justi-bottom-action-box w-full sm:w-auto grid grid-cols-2 sm:inline-flex items-center gap-2 sm:px-6">
            <button
              type="button"
              disabled={submitting}
              onClick={handleCheckout}
              className="justi-btn-primary py-2.5 sm:py-1.5 px-5 font-bold text-sm sm:text-xs"
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setCart([]);
                setError(null);
              }}
              className="justi-btn-primary py-2.5 sm:py-1.5 px-5 text-sm sm:text-xs"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <CameraBarcodeModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onDetected={handleBarcodeOrSkuLookup}
      />
    </div>
  );
};

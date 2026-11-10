import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CameraBarcodeModal } from '../../components/CameraBarcodeModal';
import { useBarcodeScanner } from '../../hooks/useBarcodeScanner';
import { CatalogApi, CrmApi, SalesApi } from '../../services/api.service';
import {
  CartItem,
  CategoryItem,
  CustomerItem,
  ProductItem,
  UserProfile,
} from '../../types/domain.types';
import { PosCartTable } from './components/PosCartTable';
import { PosCustomerHeader } from './components/PosCustomerHeader';
import { PosPaymentSection } from './components/PosPaymentSection';
import { PosReceiptAlert } from './components/PosReceiptAlert';

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
  onCancel?: () => void;
}

export const JUSTI_PAYMENT_METHODS: Array<{
  label: string;
  backendMethod: 'CASH' | 'CARD' | 'TRANSFER';
}> = [
  { label: 'Efectivo', backendMethod: 'CASH' },
  { label: 'TARJETA DE CREDITO/DEB', backendMethod: 'CARD' },
  { label: 'Tarjeta debito/credito', backendMethod: 'CARD' },
  { label: 'TARJETA DE CRÉDITO/DÉBITO', backendMethod: 'CARD' },
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
  onCancel,
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
  const [sucursal, setSucursal] = useState<'LOCALES' | 'CARRERAS'>(assignedBranch);
  const [remitoNumber, setRemitoNumber] = useState('');
  const [paymentLabel, setPaymentLabel] = useState('Efectivo');
  const [selectedCardPlan, setSelectedCardPlan] = useState<string>(
    JUSTI_CARD_PLANS[0],
  );
  const [generalObservations, setGeneralObservations] = useState('');
  const [generalDiscountPercent, setGeneralDiscountPercent] = useState<number>(0);
  const [generalDiscountInput, setGeneralDiscountInput] = useState<string>('');

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
      selectedCustomer &&
      selectedCustomer.activeDiscount?.isAvailable &&
      selectedCustomer.activeDiscount.percentage > 0 &&
      applyCrmDiscount
    ) {
      const crmPct = selectedCustomer.activeDiscount.percentage;
      setGeneralDiscountPercent(crmPct);
      setGeneralDiscountInput(`-${crmPct}`);
      setCart((prev) =>
        prev.map((item) => ({
          ...item,
          discountPercent:
            item.discountPercent !== undefined ? item.discountPercent : crmPct,
        })),
      );
    }
  }, [selectedCustomer, applyCrmDiscount]);

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
  }, [customerSearch, showCustomerDropdown, token, defaultCustomerLabel]);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c._id, c.name));
    return map;
  }, [categories]);

  const addProductToCart = useCallback(
    (product: ProductItem) => {
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
        return [
          ...prev,
          {
            product,
            quantity: 1,
            customPrice: product.price,
            discountPercent: generalDiscountPercent,
          },
        ];
      });
      setCodeSearch('');
    },
    [generalDiscountPercent],
  );

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
    return generalDiscountPercent;
  }, [generalDiscountPercent]);

  const parseDiscountInput = (val: string): number => {
    const clean = val.trim();
    if (!clean || clean === '-' || clean === '+') return 0;
    if (clean.startsWith('+')) {
      const num = parseFloat(clean.slice(1));
      return isNaN(num) ? 0 : -num; // recargo como descuento negativo
    }
    if (clean.startsWith('-')) {
      const num = parseFloat(clean.slice(1));
      return isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
    }
    const num = parseFloat(clean);
    if (isNaN(num)) return 0;
    return Math.min(100, Math.max(0, num));
  };

  const updateItemDiscount = (productId: string, discount: number) => {
    const valid = Math.min(100, Math.max(-100, discount));
    setCart((prev) =>
      prev.map((i) =>
        i.product._id === productId
          ? { ...i, discountPercent: valid, discountInput: undefined }
          : i,
      ),
    );
  };

  const updateItemDiscountRaw = (productId: string, raw: string) => {
    const parsed = parseDiscountInput(raw);
    setCart((prev) =>
      prev.map((i) =>
        i.product._id === productId
          ? { ...i, discountPercent: parsed, discountInput: raw }
          : i,
      ),
    );
  };

  const finalizeItemDiscount = (productId: string) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.product._id !== productId) return i;
        const parsed =
          i.discountInput !== undefined
            ? parseDiscountInput(i.discountInput)
            : i.discountPercent ?? generalDiscountPercent;
        return {
          ...i,
          discountPercent: parsed,
          discountInput: undefined,
        };
      }),
    );
  };

  const applyGeneralDiscount = (pct: number) => {
    const valid = Math.min(100, Math.max(-100, pct));
    setGeneralDiscountPercent(valid);
    setGeneralDiscountInput(
      valid !== 0 ? (valid > 0 ? `-${valid}` : `+${Math.abs(valid)}`) : '',
    );
    setCart((prev) =>
      prev.map((item) => ({
        ...item,
        discountPercent: valid,
        discountInput: undefined,
      })),
    );
  };

  const handleGeneralDiscountInputChange = (val: string) => {
    setGeneralDiscountInput(val);
    const parsed = parseDiscountInput(val);
    setGeneralDiscountPercent(parsed);
    setCart((prev) =>
      prev.map((item) => ({
        ...item,
        discountPercent: parsed,
        discountInput: undefined,
      })),
    );
  };

  const totals = useMemo(() => {
    let grossPesos = 0;
    let discountPesos = 0;
    let finalTotalPesos = 0;

    cart.forEach((item) => {
      const basePrice =
        typeof item.customPrice === 'number'
          ? item.customPrice
          : item.product.price;
      const descPercent =
        typeof item.discountPercent === 'number'
          ? item.discountPercent
          : generalDiscountPercent;
      const priceWithDesc = Number(
        (basePrice * (1 - descPercent / 100)).toFixed(2),
      );
      const lineTotal = Number((priceWithDesc * item.quantity).toFixed(2));

      grossPesos += basePrice * item.quantity;
      discountPesos += (basePrice - priceWithDesc) * item.quantity;
      finalTotalPesos += lineTotal;
    });

    grossPesos = Number(grossPesos.toFixed(2));
    discountPesos = Number(discountPesos.toFixed(2));
    finalTotalPesos = Math.max(0, Number(finalTotalPesos.toFixed(2)));

    const netWithoutTax = Number((finalTotalPesos / 1.21).toFixed(2));
    const ivaAmount = Number((finalTotalPesos - netWithoutTax).toFixed(2));

    return {
      grossPesos,
      discountPesos,
      netWithoutTax,
      ivaAmount,
      finalTotalPesos,
    };
  }, [cart, generalDiscountPercent]);

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

  const updatePrice = (productId: string, newPrice: number) => {
    const validPrice =
      isNaN(newPrice) || newPrice < 0 ? 0 : Number(newPrice.toFixed(2));
    setCart((prev) =>
      prev.map((i) =>
        i.product._id === productId ? { ...i, customPrice: validPrice } : i,
      ),
    );
  };

  const selectedPayOption =
    JUSTI_PAYMENT_METHODS.find((m) => m.label === paymentLabel) ||
    JUSTI_PAYMENT_METHODS[0];

  const isCardPayment =
    selectedPayOption.backendMethod === 'CARD' ||
    paymentLabel.toUpperCase().includes('TARJETA') ||
    paymentLabel.toUpperCase().includes('CREDITO') ||
    paymentLabel.toUpperCase().includes('CRÉDITO') ||
    paymentLabel.toUpperCase().includes('DEBITO') ||
    paymentLabel.toUpperCase().includes('DÉBITO');

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
        items: cart.map((item) => {
          const basePrice =
            typeof item.customPrice === 'number'
              ? item.customPrice
              : item.product.price;
          const descPercent =
            typeof item.discountPercent === 'number'
              ? item.discountPercent
              : generalDiscountPercent;
          return {
            productId: item.product._id,
            quantity: item.quantity,
            customPriceCents: Math.round(basePrice * 100),
            discountPercentage: descPercent > 0 ? descPercent : undefined,
          };
        }),
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
        items: cart.map((item) => {
          const basePrice =
            typeof item.customPrice === 'number'
              ? item.customPrice
              : item.product.price;
          const descPercent =
            typeof item.discountPercent === 'number'
              ? item.discountPercent
              : generalDiscountPercent;
          return {
            productId: item.product._id,
            quantity: item.quantity,
            customPriceCents: Math.round(basePrice * 100),
            discountPercentage: descPercent > 0 ? descPercent : undefined,
          };
        }),
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

  const handleCancelSale = () => {
    setCart([]);
    setError(null);
    setSelectedCustomer(null);
    setCustomerSearch(defaultCustomerLabel);
    if (onCancel) {
      onCancel();
    }
  };

  const todayFormatted = new Date().toLocaleDateString('es-AR');

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF] pb-16 sm:pb-4">
      <div className="justi-title-strip flex items-center justify-between px-3 sm:px-4">
        <span>Nueva Venta</span>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold text-[#1B5E91] dark:text-sky-300 hover:underline flex items-center gap-1"
          >
            ← Cancelar y Volver
          </button>
        )}
      </div>

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

        <PosReceiptAlert lastReceipt={lastReceipt} />

        {/* Cabecera del Comprobante */}
        <PosCustomerHeader
          user={user}
          todayFormatted={todayFormatted}
          comprobante={comprobante}
          setComprobante={setComprobante}
          sucursal={sucursal}
          setSucursal={setSucursal}
          assignedBranch={assignedBranch}
          isBranchLocked={isBranchLocked}
          remitoNumber={remitoNumber}
          setRemitoNumber={setRemitoNumber}
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
          showCustomerDropdown={showCustomerDropdown}
          setShowCustomerDropdown={setShowCustomerDropdown}
          customerResults={customerResults}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          applyCrmDiscount={applyCrmDiscount}
          setApplyCrmDiscount={setApplyCrmDiscount}
          defaultCustomerLabel={defaultCustomerLabel}
          onGoToClientes={onGoToClientes}
        />

        {/* Sección: Artículos Vendidos */}
        <PosCartTable
          cart={cart}
          codeSearch={codeSearch}
          setCodeSearch={setCodeSearch}
          productSuggestions={productSuggestions}
          categoryNameMap={categoryNameMap}
          generalDiscountPercent={generalDiscountPercent}
          generalDiscountInput={generalDiscountInput}
          totals={totals}
          onOpenScanner={() => setIsCameraOpen(true)}
          onAddProduct={addProductToCart}
          onBarcodeOrSkuLookup={handleBarcodeOrSkuLookup}
          onUpdateQuantity={updateQuantity}
          onUpdatePrice={updatePrice}
          onUpdateItemDiscountRaw={updateItemDiscountRaw}
          onUpdateItemDiscount={updateItemDiscount}
          onFinalizeItemDiscount={finalizeItemDiscount}
          onApplyGeneralDiscount={applyGeneralDiscount}
          onGeneralDiscountInputChange={handleGeneralDiscountInputChange}
        />

        {/* Sección: Formas de Pago y Observaciones */}
        <PosPaymentSection
          paymentLabel={paymentLabel}
          setPaymentLabel={setPaymentLabel}
          selectedCardPlan={selectedCardPlan}
          setSelectedCardPlan={setSelectedCardPlan}
          isCardPayment={isCardPayment}
          paymentMethods={JUSTI_PAYMENT_METHODS}
          cardPlans={JUSTI_CARD_PLANS}
          totals={totals}
          activeDiscountPercent={activeDiscountPercent}
          selectedCustomer={selectedCustomer}
          customerSearch={customerSearch}
          defaultCustomerLabel={defaultCustomerLabel}
          generalObservations={generalObservations}
          setGeneralObservations={setGeneralObservations}
          submitting={submitting}
          onCheckout={handleCheckout}
          onCancel={handleCancelSale}
        />
      </div>

      <CameraBarcodeModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onDetected={handleBarcodeOrSkuLookup}
      />
    </div>
  );
};

import React from 'react';
import { Barcode, Camera, Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem, ProductItem } from '../../../types/domain.types';
import { useBranding } from '../../../context/BrandingContext';

interface PosCartTableProps {
  cart: CartItem[];
  codeSearch: string;
  setCodeSearch: (val: string) => void;
  productSuggestions: ProductItem[];
  categoryNameMap: Map<string, string>;
  generalDiscountPercent: number;
  generalDiscountInput: string;
  totals: {
    grossPesos: number;
    discountPesos: number;
    netWithoutTax: number;
    ivaAmount: number;
    finalTotalPesos: number;
  };
  onOpenScanner: () => void;
  onAddProduct: (prod: ProductItem) => void;
  onBarcodeOrSkuLookup: (code: string) => void;
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onUpdatePrice: (productId: string, newPrice: number) => void;
  onUpdateItemDiscountRaw: (productId: string, raw: string) => void;
  onUpdateItemDiscount: (productId: string, discount: number) => void;
  onFinalizeItemDiscount: (productId: string) => void;
  onApplyGeneralDiscount: (pct: number) => void;
  onGeneralDiscountInputChange: (val: string) => void;
}

export const PosCartTable: React.FC<PosCartTableProps> = ({
  cart,
  codeSearch,
  setCodeSearch,
  productSuggestions,
  categoryNameMap,
  generalDiscountPercent,
  generalDiscountInput,
  totals,
  onOpenScanner,
  onAddProduct,
  onBarcodeOrSkuLookup,
  onUpdateQuantity,
  onUpdatePrice,
  onUpdateItemDiscountRaw,
  onUpdateItemDiscount,
  onFinalizeItemDiscount,
  onApplyGeneralDiscount,
  onGeneralDiscountInputChange,
}) => {
  const { branding } = useBranding();
  return (
    <div className="border border-[#80AED8] dark:border-slate-700 bg-[#E8ECF8] dark:bg-slate-900 rounded-sm overflow-hidden">
      <div className="justi-section-header dark:bg-slate-800 flex items-center justify-between gap-2">
        <span>Artículos Vendidos</span>
        <button
          type="button"
          onClick={onOpenScanner}
          className="inline-flex items-center gap-1 rounded bg-white dark:bg-slate-800 border dark:border-slate-600 px-2.5 py-1 text-[11px] font-bold text-[#1B5E91] dark:text-sky-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700"
        >
          <Camera className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
          <span>Escanear con Cámara</span>
        </button>
      </div>

      {/* Buscador por Código de Barras / SKU / Nombre */}
      <div className="p-2 bg-[#DCEAF7] dark:bg-slate-800/90 border-b border-[#9CC2E5] dark:border-slate-700 relative">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (productSuggestions.length === 1) {
              onAddProduct(productSuggestions[0]);
            } else {
              onBarcodeOrSkuLookup(codeSearch);
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
              className="justi-input w-full pl-9 py-2.5 sm:py-2 text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:border-slate-700"
            />
            <Barcode className="absolute left-2.5 top-3 sm:top-2.5 h-4 w-4 text-[#1B5E91] dark:text-sky-400" />
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
              onClick={onOpenScanner}
              className="sm:hidden justi-btn-primary py-2 font-bold"
            >
              <Camera className="mr-1 h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              Usar Cámara
            </button>
          </div>
        </form>

        {productSuggestions.length > 0 && (
          <div className="absolute left-2 right-2 mt-1 max-h-64 overflow-y-auto rounded border border-[#4E8EC2] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl z-30">
            {productSuggestions.map((prod) => (
              <button
                key={prod._id}
                type="button"
                onClick={() => onAddProduct(prod)}
                className="flex w-full items-center justify-between border-b border-slate-100 dark:border-slate-700 px-3 py-2.5 text-left text-xs hover:bg-[#E8F2FC] dark:hover:bg-slate-700"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-mono font-bold text-[#1B5E91] dark:text-sky-400 mr-1.5">
                    [{prod.sku}]
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {prod.name}
                  </span>
                  {prod.barcode && (
                    <span className="block sm:inline sm:ml-2 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      EAN: {prod.barcode}
                    </span>
                  )}
                </div>
                <span className="shrink-0 font-bold text-emerald-800 dark:text-emerald-300">
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
            artículo para agregarlo.
          </div>
        ) : (
          cart.map((item) => {
            const unitPrice =
              typeof item.customPrice === 'number'
                ? item.customPrice
                : item.product.price;
            const descPercent =
              typeof item.discountPercent === 'number'
                ? item.discountPercent
                : generalDiscountPercent;
            const priceWithDesc = Number(
              (unitPrice * (1 - descPercent / 100)).toFixed(2),
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
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-[11px] font-bold text-[#1B5E91]">
                      Cód: {item.product.sku}{' '}
                      {item.product.barcode
                        ? `• EAN: ${item.product.barcode}`
                        : ''}
                    </span>
                    <p className="font-bold text-sm text-slate-900 leading-snug">
                      {item.product.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.product._id, 0)}
                    className="shrink-0 rounded border border-red-300 bg-red-50 p-1.5 text-red-700 hover:bg-red-100"
                    title="Eliminar artículo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-600 mr-1">Cant:</span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateQuantity(item.product._id, item.quantity - 1)
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
                        onUpdateQuantity(item.product._id, item.quantity + 1)
                      }
                      className="justi-btn-primary h-8 w-8 p-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-700">Precio c/imp: $</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={unitPrice}
                      onChange={(e) => {
                        const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        onUpdatePrice(item.product._id, isNaN(val) ? 0 : val);
                      }}
                      className="justi-input w-24 text-right font-mono font-bold py-1 px-1.5 text-xs text-slate-900 focus:bg-amber-50"
                    />
                  </div>
                </div>

                {/* Modificación de Descuento por Ítem Móvil */}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2 rounded border border-slate-200">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-[#1B5E91]">
                      Desc/Rec:
                    </span>
                    <input
                      type="text"
                      value={
                        item.discountInput !== undefined
                          ? item.discountInput
                          : descPercent !== 0
                          ? descPercent > 0
                            ? `-${descPercent}`
                            : `+${Math.abs(descPercent)}`
                          : ''
                      }
                      onChange={(e) =>
                        onUpdateItemDiscountRaw(
                          item.product._id,
                          e.target.value,
                        )
                      }
                      onBlur={() => onFinalizeItemDiscount(item.product._id)}
                      placeholder="-0%"
                      className="justi-input w-20 text-right font-mono font-bold py-1 px-1.5 text-xs text-emerald-800 focus:bg-emerald-50"
                    />
                    <span className="text-[10px] font-bold text-emerald-800">
                      %
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[0, 5, 10, 15].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() =>
                          onUpdateItemDiscount(item.product._id, pct)
                        }
                        className={`px-1.5 py-0.5 text-[10px] rounded font-bold transition-colors ${
                          descPercent === pct
                            ? 'bg-emerald-700 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-emerald-50'
                        }`}
                      >
                        {pct === 0 ? '0%' : `-${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-1 flex items-center justify-between text-xs border-t border-slate-100 pt-1.5">
                  <div className="text-[11px] text-slate-500 font-mono">
                    Neto: ${priceWithDesc.toFixed(2)} c/u
                  </div>
                  <div className="text-sm font-extrabold text-[#1B5E91]">
                    Subtotal: ${lineTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
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
            <tr className="bg-[#DCEAF7] dark:bg-slate-900 text-[#1B5E91] dark:text-sky-300 border-b border-[#9CC2E5] dark:border-slate-700">
              <th className="py-2 px-2 text-left">Código</th>
              <th className="py-2 px-2 text-left">
                Rubro -&gt; Subrubro
              </th>
              <th className="py-2 px-2 text-left">Marca</th>
              <th className="py-2 px-3 text-left min-w-[280px] w-1/3 text-xs font-bold">
                Artículo / Producto
              </th>
              <th className="py-2 px-2 text-center">Cantidad</th>
              <th className="py-2 px-2 text-right min-w-[130px]">
                Precio (Con Impuestos)
              </th>
              <th className="py-2 px-2 text-right min-w-[140px]">Desc/Rec (%)</th>
              <th className="py-2 px-2 text-right">
                Precio Con Desc/Rec
              </th>
              <th className="py-2 px-2 text-right">
                Subtotal (Sin Impuestos)
              </th>
              <th className="py-2 px-2 text-center">IVA (%)</th>
              <th className="py-2 px-2 text-center">Imp. Int. (%)</th>
              <th className="py-2 px-2 text-right">
                Subtotal (Con Impuestos)
              </th>
              <th className="py-2 px-2 text-center w-10"></th>
            </tr>
          </thead>
          <tbody>
            {cart.length === 0 ? (
              <tr className="bg-[#E5E5F7] dark:bg-slate-800/60">
                <td
                  colSpan={13}
                  className="py-3 px-3 text-center text-slate-500 dark:text-slate-400"
                >
                  Sin artículos cargados. Use el lector de código de barras
                  o el buscador superior.
                </td>
              </tr>
            ) : (
              cart.map((item) => {
                const unitPrice =
                  typeof item.customPrice === 'number'
                    ? item.customPrice
                    : item.product.price;
                const descPercent =
                  typeof item.discountPercent === 'number'
                    ? item.discountPercent
                    : generalDiscountPercent;
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
                    className="border-b border-slate-300 dark:border-slate-700 bg-[#E5E5F7] dark:bg-slate-800/90 text-slate-900 dark:text-slate-100"
                  >
                    <td className="p-1.5 font-mono font-bold text-slate-800 dark:text-slate-100">
                      {item.product.sku}
                    </td>
                    <td className="p-1.5">
                      <span className="block rounded bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-slate-700 dark:text-slate-200">
                        {rubroName}
                      </span>
                    </td>
                    <td className="p-1.5">
                      <span className="block rounded bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-slate-700 dark:text-slate-200">
                        {branding.companyName || 'Marca Propia'}
                      </span>
                    </td>
                    <td className="p-2 font-bold text-slate-900 dark:text-slate-100 text-xs">
                      {item.product.name}
                    </td>
                    <td className="p-1.5 text-center">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          onUpdateQuantity(
                            item.product._id,
                            Number(e.target.value) || 1,
                          )
                        }
                        className="justi-input w-16 text-right font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:border-slate-700"
                      />
                    </td>
                    <td className="p-1.5 text-right font-mono bg-white/80 dark:bg-slate-900/80">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-slate-500 dark:text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={unitPrice}
                          onChange={(e) => {
                            const val =
                              e.target.value === ''
                                ? 0
                                : parseFloat(e.target.value);
                            onUpdatePrice(item.product._id, isNaN(val) ? 0 : val);
                          }}
                          className="justi-input w-28 text-right font-mono font-bold py-1 px-1.5 text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 dark:border-slate-700 focus:bg-amber-50 dark:focus:bg-slate-800"
                          title="Precio unitario con impuestos modificable por el vendedor"
                        />
                      </div>
                    </td>
                    <td className="p-1.5 text-right font-mono bg-white/80 dark:bg-slate-900/80">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="text"
                            value={
                              item.discountInput !== undefined
                                ? item.discountInput
                                : descPercent !== 0
                                ? descPercent > 0
                                ? `-${descPercent}`
                                : `+${Math.abs(descPercent)}`
                                : ''
                            }
                            onChange={(e) =>
                              onUpdateItemDiscountRaw(
                                item.product._id,
                                e.target.value,
                              )
                            }
                            onBlur={() =>
                              onFinalizeItemDiscount(item.product._id)
                            }
                            placeholder="-0%"
                            className="justi-input w-20 text-right font-mono font-bold py-1 px-1.5 text-xs text-emerald-800 dark:text-emerald-400 bg-white dark:bg-slate-900 dark:border-slate-700 focus:bg-emerald-50 dark:focus:bg-slate-800"
                            title="Descuento (ej. -15 o 15) o recargo (+10)"
                          />
                          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                            %
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[0, 5, 10, 15].map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() =>
                                onUpdateItemDiscount(item.product._id, pct)
                              }
                              className={`px-1 py-0.5 text-[9px] rounded font-bold transition-colors ${
                                descPercent === pct
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-emerald-100 dark:hover:bg-slate-600'
                              }`}
                            >
                              {pct === 0 ? '0%' : `-${pct}%`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="p-1.5 text-right font-mono font-semibold text-slate-900 dark:text-slate-100 bg-slate-200 dark:bg-slate-700/80">
                      {priceWithDesc.toFixed(2)}
                    </td>
                    <td className="p-1.5 text-right font-mono text-slate-900 dark:text-slate-100 bg-slate-200 dark:bg-slate-700/80">
                      {subSinImp.toFixed(2)}
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-900 dark:text-slate-100 bg-slate-200 dark:bg-slate-700/80">
                      21.00
                    </td>
                    <td className="p-1.5 text-center font-mono text-slate-900 dark:text-slate-100 bg-slate-200 dark:bg-slate-700/80">
                      0.00
                    </td>
                    <td className="p-1.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-200 dark:bg-slate-700/80">
                      {subConImp.toFixed(2)}
                    </td>
                    <td className="p-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product._id, 0)}
                        className="rounded border border-[#80AED8] dark:border-slate-600 bg-[#DCEAF7] dark:bg-slate-700 p-1 text-[#1B5E91] dark:text-sky-300 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-400"
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

      {/* Barra de Descuento General de la Venta */}
      <div className="p-2.5 bg-gradient-to-r from-[#DCEAF7] via-[#E8F2FC] to-[#DCEAF7] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-y border-[#9CC2E5] dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1B5E91] dark:text-sky-300 text-xs uppercase tracking-wide">
            Descuento General Venta:
          </span>
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={generalDiscountInput}
              onChange={(e) =>
                onGeneralDiscountInputChange(e.target.value)
              }
              placeholder="-0%"
              className="justi-input w-24 text-right font-mono font-bold py-1 px-2 text-xs text-emerald-800 dark:text-emerald-400 bg-white dark:bg-slate-900 dark:border-slate-700 focus:bg-emerald-50 dark:focus:bg-slate-800"
              title="Ej: -15 o 15 para 15% de descuento, +10 para 10% de recargo"
            />
            <span className="font-bold text-emerald-800 dark:text-emerald-400 text-xs">%</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mr-1">
            Accesos rápidos:
          </span>
          {[
            { label: 'Sin desc.', val: 0 },
            { label: '-5%', val: 5 },
            { label: '-10%', val: 10 },
            { label: '-15%', val: 15 },
            { label: '-20%', val: 20 },
          ].map((btn) => (
            <button
              key={btn.val}
              type="button"
              onClick={() => onApplyGeneralDiscount(btn.val)}
              className={`px-2.5 py-1 text-xs rounded font-bold transition-all ${
                generalDiscountPercent === btn.val
                  ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-800'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-800 dark:hover:text-emerald-300'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Franja Azul de Totales (#80AED8) */}
      <div className="justi-totals-strip dark:bg-slate-900 p-2.5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-200 mb-0.5 text-[11px]">
            Total Neto
          </div>
          <div className="rounded bg-slate-200 dark:bg-slate-800 dark:text-slate-100 px-2 py-1 text-right font-mono font-bold">
            {totals.netWithoutTax.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-200 mb-0.5 text-[11px]">
            Total Exento
          </div>
          <div className="rounded bg-slate-200 dark:bg-slate-800 dark:text-slate-100 px-2 py-1 text-right font-mono font-bold">
            0.00
          </div>
        </div>
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-200 mb-0.5 text-[11px]">
            Total I.V.A.
          </div>
          <div className="rounded bg-slate-200 dark:bg-slate-800 dark:text-slate-100 px-2 py-1 text-right font-mono font-bold">
            {totals.ivaAmount.toFixed(2)}
          </div>
        </div>
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-200 mb-0.5 text-[11px]">
            Imp. Internos
          </div>
          <div className="rounded bg-slate-200 dark:bg-slate-800 dark:text-slate-100 px-2 py-1 text-right font-mono font-bold">
            0.00
          </div>
        </div>
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-200 mb-0.5 text-[11px]">
            Descuentos / Rec.
          </div>
          <div className="rounded bg-white dark:bg-slate-800 border dark:border-slate-700 px-2 py-1 text-right font-mono font-bold text-emerald-800 dark:text-emerald-400">
            {totals.discountPesos > 0
              ? `-${totals.discountPesos.toFixed(2)}`
              : '0.00'}
          </div>
        </div>
        <div>
          <div className="font-bold text-slate-900 dark:text-slate-200 mb-0.5 text-[11px]">
            T O T A L
          </div>
          <div className="rounded bg-white dark:bg-slate-800 border border-[#1B5E91] dark:border-sky-500 px-2 py-1 text-right font-mono font-extrabold text-[#1B5E91] dark:text-sky-300">
            ${totals.finalTotalPesos.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

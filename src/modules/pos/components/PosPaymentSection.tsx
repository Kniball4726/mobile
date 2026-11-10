import React from 'react';
import { CustomerItem } from '../../../types/domain.types';

interface PosPaymentSectionProps {
  paymentLabel: string;
  setPaymentLabel: (val: string) => void;
  selectedCardPlan: string;
  setSelectedCardPlan: (val: string) => void;
  isCardPayment: boolean;
  paymentMethods: Array<{
    label: string;
    backendMethod: 'CASH' | 'CARD' | 'TRANSFER';
  }>;
  cardPlans: string[];
  totals: {
    grossPesos: number;
    discountPesos: number;
    finalTotalPesos: number;
  };
  activeDiscountPercent: number;
  selectedCustomer: CustomerItem | null;
  customerSearch: string;
  defaultCustomerLabel: string;
  generalObservations: string;
  setGeneralObservations: (val: string) => void;
  submitting: boolean;
  onCheckout: () => void;
  onCancel: () => void;
}

export const PosPaymentSection: React.FC<PosPaymentSectionProps> = ({
  paymentLabel,
  setPaymentLabel,
  selectedCardPlan,
  setSelectedCardPlan,
  isCardPayment,
  paymentMethods,
  cardPlans,
  totals,
  activeDiscountPercent,
  selectedCustomer,
  customerSearch,
  defaultCustomerLabel,
  generalObservations,
  setGeneralObservations,
  submitting,
  onCheckout,
  onCancel,
}) => {
  return (
    <>
      {/* SECCIÓN: FORMAS DE PAGO */}
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
              {paymentMethods.map((m) => (
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
                className="justi-select w-full text-xs font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:border-slate-700"
              >
                {cardPlans.map((plan) => (
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
                className="justi-input w-full text-right font-mono text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:border-slate-700"
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
                className="justi-input w-full text-right font-mono text-xs font-bold text-emerald-800 dark:text-emerald-400 bg-white dark:bg-slate-900 dark:border-slate-700"
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
                className="justi-input w-full text-right font-mono text-xs font-extrabold text-[#1B5E91] dark:text-sky-300 bg-white dark:bg-slate-900 dark:border-slate-700"
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
              <tr className="bg-[#E5E5F7] dark:bg-slate-800/90 border-b border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100">
                <td className="p-1.5 font-bold">1</td>
                <td className="p-1.5">
                  <select
                    value={paymentLabel}
                    onChange={(e) => setPaymentLabel(e.target.value)}
                    className="justi-select w-64 font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:border-slate-700"
                  >
                    {paymentMethods.map((m) => (
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
                    className="justi-input w-28 text-right font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:border-slate-700"
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
                        className="justi-select text-xs font-semibold w-full max-w-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:border-slate-700"
                      >
                        {cardPlans.map((plan) => (
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
                    className="justi-input w-16 text-right bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 dark:border-slate-700"
                  />
                </td>
                <td className="p-1.5 text-right font-mono">
                  <input
                    type="text"
                    readOnly
                    value={totals.finalTotalPesos.toFixed(2)}
                    className="justi-input w-28 text-right font-extrabold text-[#1B5E91] dark:text-sky-300 bg-white dark:bg-slate-900 dark:border-slate-700"
                  />
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr className="bg-[#DCEAF7] dark:bg-slate-900 font-bold text-[#1B5E91] dark:text-sky-300">
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
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
          Observaciones:
        </label>
        <textarea
          rows={2}
          value={generalObservations}
          onChange={(e) => setGeneralObservations(e.target.value)}
          className="justi-input w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 dark:border-slate-700"
        />
      </div>

      {/* Botones Guardar / Cancelar */}
      <div className="flex justify-center py-2">
        <div className="justi-bottom-action-box w-full sm:w-auto grid grid-cols-2 sm:inline-flex items-center gap-2 sm:px-6">
          <button
            type="button"
            disabled={submitting}
            onClick={onCheckout}
            className="justi-btn-primary py-2.5 sm:py-1.5 px-5 font-bold text-sm sm:text-xs"
          >
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="justi-btn-primary py-2.5 sm:py-1.5 px-5 text-sm sm:text-xs font-bold"
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
  );
};

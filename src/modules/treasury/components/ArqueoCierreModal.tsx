import React from 'react';
import { CashRegisterRecord, ClosureSummary } from '../../../types/domain.types';

interface ArqueoCierreModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegister: CashRegisterRecord | null;
  isReadOnlyView: boolean;
  loadingSummary: boolean;
  summaryError: string | null;
  currentSummary: ClosureSummary | null;
  declaredCashInput: string;
  setDeclaredCashInput: (val: string) => void;
  closeObservationsInput: string;
  setCloseObservationsInput: (val: string) => void;
  onConfirmClose: () => void;
  isSubmittingClose: boolean;
}

export const ArqueoCierreModal: React.FC<ArqueoCierreModalProps> = ({
  isOpen,
  onClose,
  selectedRegister,
  isReadOnlyView,
  loadingSummary,
  summaryError,
  currentSummary,
  declaredCashInput,
  setDeclaredCashInput,
  closeObservationsInput,
  setCloseObservationsInput,
  onConfirmClose,
  isSubmittingClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto transition-colors">
        {/* Cabecera */}
        <div className="bg-[#1B5E91] dark:bg-slate-800 text-white px-4 py-3 flex items-center justify-between border-b border-transparent dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-base sm:text-lg font-bold">
              {isReadOnlyView ? 'Resumen de Cierre de Caja (Arqueo)' : 'Arqueo y Cierre de Caja'}
            </span>
            <span
              className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                selectedRegister?.status === 'ABIERTA'
                  ? 'bg-emerald-400 dark:bg-emerald-500/20 text-slate-900 dark:text-emerald-300 dark:border dark:border-emerald-500/40'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
              }`}
            >
              {selectedRegister?.status}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:text-slate-200 dark:text-slate-300 dark:hover:text-white text-lg font-bold px-2 py-0.5 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Info de la caja */}
        <div className="bg-[#DCEAF7] dark:bg-slate-800/90 border-b border-[#9CC2E5] dark:border-slate-700 px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <span className="block text-slate-500 dark:text-slate-400 text-[10px]">Operador</span>
            <span className="font-bold text-[#1B5E91] dark:text-sky-300">{selectedRegister?.userFullName}</span>
          </div>
          <div>
            <span className="block text-slate-500 dark:text-slate-400 text-[10px]">Tipo de Caja</span>
            <span className="font-bold text-slate-800 dark:text-slate-100">{selectedRegister?.boxType}</span>
          </div>
          <div>
            <span className="block text-slate-500 dark:text-slate-400 text-[10px]">Sucursal</span>
            <span className="font-bold text-slate-800 dark:text-slate-100">{selectedRegister?.branch}</span>
          </div>
          <div>
            <span className="block text-slate-500 dark:text-slate-400 text-[10px]">Apertura</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedRegister?.openedAt}</span>
          </div>
        </div>

        {/* Cuerpo del modal con scroll */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs text-slate-800 dark:text-slate-200 flex-1 bg-white dark:bg-slate-900">
          {loadingSummary && (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-[#1B5E91] dark:border-sky-400 border-t-transparent rounded-full mb-2"></div>
              <p className="font-semibold">Calculando arqueo y totales por forma de pago...</p>
            </div>
          )}

          {summaryError && (
            <div className="p-3 bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-200 rounded border border-red-300 dark:border-red-800">
              {summaryError}
            </div>
          )}

          {!loadingSummary && currentSummary && (
            <>
              {/* SECCIÓN 1: Desglose de Ventas por Forma de Pago */}
              <div className="border border-[#80AED8] dark:border-slate-700 rounded bg-white dark:bg-slate-850 overflow-hidden shadow-sm">
                <div className="bg-[#4E8EC2] dark:bg-slate-800 text-white px-3 py-1.5 flex items-center justify-between font-bold text-xs border-b border-transparent dark:border-slate-700">
                  <span>Totales Vendidos por Forma de Pago</span>
                  <span className="font-mono text-white dark:text-sky-300">Total Facturado: ${currentSummary.totalSales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white dark:bg-slate-900/60">
                  <div className="flex items-center justify-between p-2.5 rounded bg-[#F4F8FC] dark:bg-slate-800/80 border border-[#DCEAF7] dark:border-slate-700">
                    <span className="font-medium text-slate-700 dark:text-slate-300">💵 Efectivo:</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      ${currentSummary.totalsByMethod.cash.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded bg-[#F4F8FC] dark:bg-slate-800/80 border border-[#DCEAF7] dark:border-slate-700">
                    <span className="font-medium text-slate-700 dark:text-slate-300">💳 Tarjeta Débito / Crédito:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                      ${currentSummary.totalsByMethod.card.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded bg-[#F4F8FC] dark:bg-slate-800/80 border border-[#DCEAF7] dark:border-slate-700">
                    <span className="font-medium text-slate-700 dark:text-slate-300">📱 QR Mercado Pago:</span>
                    <span className="font-mono font-bold text-sky-700 dark:text-sky-400 text-sm">
                      ${currentSummary.totalsByMethod.qrMp.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded bg-[#F4F8FC] dark:bg-slate-800/80 border border-[#DCEAF7] dark:border-slate-700">
                    <span className="font-medium text-slate-700 dark:text-slate-300">🏃 QR Sport Club:</span>
                    <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 text-sm">
                      ${currentSummary.totalsByMethod.qrSc.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded bg-[#F4F8FC] dark:bg-slate-800/80 border border-[#DCEAF7] dark:border-slate-700">
                    <span className="font-medium text-slate-700 dark:text-slate-300">🔄 Canjes / Diferencia Vuelto:</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm">
                      ${currentSummary.totalsByMethod.canjes.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {currentSummary.totalsByMethod.other > 0 && (
                    <div className="flex items-center justify-between p-2.5 rounded bg-[#F4F8FC] dark:bg-slate-800/80 border border-[#DCEAF7] dark:border-slate-700">
                      <span className="font-medium text-slate-700 dark:text-slate-300">🌐 Otros / Transferencias:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                        ${currentSummary.totalsByMethod.other.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-[#E5EFF8] dark:bg-slate-800/90 px-3 py-1.5 border-t border-[#80AED8] dark:border-slate-700 flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                  <span>Cantidad de comprobantes en turno: <strong className="text-slate-800 dark:text-slate-200">{currentSummary.totalSalesCount}</strong></span>
                  <span>Total cobrado: <strong className="text-slate-800 dark:text-slate-200">${currentSummary.totalSales.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</strong></span>
                </div>
              </div>

              {/* SECCIÓN 2: Arqueo Teórico de Caja (Efectivo) */}
              <div className="border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800/60 p-3 space-y-2">
                <h4 className="font-bold text-[#1B5E91] dark:text-sky-400 text-xs uppercase tracking-wide border-b border-slate-200 dark:border-slate-700 pb-1">
                  Conciliación de Efectivo en Cajón
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Saldo Inicial en Efectivo:</span>
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">${currentSummary.initialBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">(+) Ventas cobradas en Efectivo:</span>
                    <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">+${currentSummary.totalsByMethod.cash.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {currentSummary.operationsSummary.incomes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">(+) Ingresos Extraordinarios:</span>
                      <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">+${currentSummary.operationsSummary.incomes.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {currentSummary.operationsSummary.withdrawals > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">(-) Egresos Extraordinarios / Retiros:</span>
                      <span className="font-mono font-semibold text-rose-700 dark:text-rose-400">-${currentSummary.operationsSummary.withdrawals.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {currentSummary.operationsSummary.expenses > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">(-) Gastos de Sucursal:</span>
                      <span className="font-mono font-semibold text-rose-700 dark:text-rose-400">-${currentSummary.operationsSummary.expenses.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-300 dark:border-slate-700 pt-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                    <span>Efectivo Teórico Esperado en Cajón:</span>
                    <span className="font-mono text-[#1B5E91] dark:text-sky-300 font-extrabold text-base">${currentSummary.expectedCash.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: Declaración física y diferencia */}
              <div className="border border-slate-300 dark:border-slate-700 rounded bg-[#F8FAFC] dark:bg-slate-800/80 p-3 space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wide">
                  {isReadOnlyView ? 'Resultado del Cierre' : 'Declaración Física del Vendedor'}
                </h4>

                {isReadOnlyView ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Efectivo Físico Declarado:</span>
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100">
                        ${currentSummary.declaredCash.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Diferencia de Arqueo:</span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          currentSummary.difference === 0
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : currentSummary.difference > 0
                            ? 'text-sky-700 dark:text-sky-400'
                            : 'text-rose-700 dark:text-rose-400'
                        }`}
                      >
                        {currentSummary.difference === 0
                          ? '$0.00 (Caja Cuadrada)'
                          : currentSummary.difference > 0
                          ? `+$${currentSummary.difference.toLocaleString('es-AR', { minimumFractionDigits: 2 })} (Sobrante)`
                          : `-$${Math.abs(currentSummary.difference).toLocaleString('es-AR', { minimumFractionDigits: 2 })} (Faltante)`}
                      </span>
                    </div>
                    {selectedRegister?.observations && (
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-0.5">Observaciones Registradas:</span>
                        <p className="text-slate-800 dark:text-slate-200 italic">{selectedRegister.observations}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Efectivo Físico Contado en Cajón ($):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={declaredCashInput}
                        onChange={(e) => setDeclaredCashInput(e.target.value)}
                        placeholder="0.00"
                        className="w-full text-base font-mono font-bold px-3 py-1.5 border border-slate-400 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B5E91] dark:focus:ring-sky-500"
                      />
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Ingresa el monto de billetes y monedas que hay en el cajón de la caja.
                      </p>
                    </div>

                    {/* Cálculo en vivo de la diferencia */}
                    {(() => {
                      const declared = Number(declaredCashInput) || 0;
                      const diff = declared - currentSummary.expectedCash;
                      return (
                        <div
                          className={`p-2.5 rounded border text-xs font-bold flex items-center justify-between ${
                            Math.abs(diff) < 0.01
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                              : diff > 0
                              ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-700'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                          }`}
                        >
                          <span>Diferencia vs Efectivo Esperado:</span>
                          <span className="font-mono text-sm">
                            {Math.abs(diff) < 0.01
                              ? '✓ $0.00 (Caja Cuadrada Exacta)'
                              : diff > 0
                              ? `▲ Sobrante: +$${diff.toFixed(2)}`
                              : `▼ Faltante: -$${Math.abs(diff).toFixed(2)}`}
                          </span>
                        </div>
                      );
                    })()}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Observaciones de Cierre (Opcional):
                      </label>
                      <textarea
                        rows={2}
                        value={closeObservationsInput}
                        onChange={(e) => setCloseObservationsInput(e.target.value)}
                        placeholder="Notas del turno, entrega de valores, motivo de diferencias..."
                        className="w-full text-xs p-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B5E91] dark:focus:ring-sky-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Pie con botones */}
        <div className="bg-[#DCEAF7] dark:bg-slate-800 border-t border-[#9CC2E5] dark:border-slate-700 px-4 py-3 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="justi-btn-primary py-1.5 px-4"
          >
            {isReadOnlyView ? 'Cerrar Ventana' : 'Cancelar'}
          </button>
          {!isReadOnlyView && (
            <button
              type="button"
              disabled={isSubmittingClose || loadingSummary}
              onClick={onConfirmClose}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold py-1.5 px-5 rounded text-xs shadow disabled:opacity-50 transition-colors"
            >
              {isSubmittingClose ? 'Procesando Cierre...' : 'Confirmar Cierre de Caja'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

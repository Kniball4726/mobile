import React from 'react';

interface OperacionCajaTabProps {
  opType: 'INGRESO_EXTRAORDINARIO' | 'EGRESO_EXTRAORDINARIO' | 'TRANSFERENCIA_CAJAS';
  setOpType: (type: 'INGRESO_EXTRAORDINARIO' | 'EGRESO_EXTRAORDINARIO' | 'TRANSFERENCIA_CAJAS') => void;
  opAmount: string;
  setOpAmount: (val: string) => void;
  opDetail: string;
  setOpDetail: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  feedback?: string | null;
}

export const OperacionCajaTab: React.FC<OperacionCajaTabProps> = ({
  opType,
  setOpType,
  opAmount,
  setOpAmount,
  opDetail,
  setOpDetail,
  onSubmit,
  onCancel,
  feedback,
}) => {
  return (
    <>
      <div className="justi-title-strip">Registrar Operación de Caja</div>
      <form
        onSubmit={onSubmit}
        className="p-3 sm:p-4 flex-1 flex flex-col items-center space-y-4"
      >
        {feedback && (
          <div className="w-full max-w-xl justi-alert-success">
            {feedback}
          </div>
        )}

        <div className="w-full max-w-md rounded border border-[#B8D4EC] dark:border-slate-700 bg-[#F5FAFF] dark:bg-slate-800/90 p-3.5 sm:p-4 space-y-3 text-xs shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Seleccione el Tipo de Operación:
            </span>
            <div className="space-y-2 text-slate-800 dark:text-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="opType"
                  checked={opType === 'INGRESO_EXTRAORDINARIO'}
                  onChange={() => setOpType('INGRESO_EXTRAORDINARIO')}
                />
                <span>Ingreso Extraordinario de Caja</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="opType"
                  checked={opType === 'EGRESO_EXTRAORDINARIO'}
                  onChange={() => setOpType('EGRESO_EXTRAORDINARIO')}
                />
                <span>Egreso Extraordinario de Caja</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="opType"
                  checked={opType === 'TRANSFERENCIA_CAJAS'}
                  onChange={() => setOpType('TRANSFERENCIA_CAJAS')}
                />
                <span>Transferencia entre Cajas</span>
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Importe $: *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={opAmount}
                onChange={(e) => setOpAmount(e.target.value)}
                placeholder="0.00"
                className="justi-input w-full sm:w-44 text-right font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Detalle / Observación:
              </label>
              <input
                type="text"
                required
                value={opDetail}
                onChange={(e) => setOpDetail(e.target.value)}
                placeholder="Motivo de la operación..."
                className="justi-input w-full"
              />
            </div>
          </div>
        </div>

        <div className="justi-bottom-action-box w-full sm:w-auto grid grid-cols-2 sm:inline-flex items-center gap-2 sm:px-6">
          <button
            type="submit"
            className="justi-btn-primary py-2 sm:py-1.5 px-5 font-bold"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="justi-btn-primary py-2 sm:py-1.5 px-5"
          >
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
};

import React from 'react';
import { BranchType, CashRegisterRecord } from '../../../types/domain.types';

interface NuevoGastoTabProps {
  effectiveBranch: BranchType;
  selectedBranch: BranchType;
  setSelectedBranch: (branch: BranchType) => void;
  isBranchLocked: boolean;
  openRegisters: CashRegisterRecord[];
  expenseAmount: string;
  setExpenseAmount: (val: string) => void;
  expenseCategory: string;
  setExpenseCategory: (val: string) => void;
  expenseDetail: string;
  setExpenseDetail: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  feedback?: string | null;
}

export const NuevoGastoTab: React.FC<NuevoGastoTabProps> = ({
  effectiveBranch,
  setSelectedBranch,
  isBranchLocked,
  openRegisters,
  expenseAmount,
  setExpenseAmount,
  expenseCategory,
  setExpenseCategory,
  expenseDetail,
  setExpenseDetail,
  onSubmit,
  onCancel,
  feedback,
}) => {
  return (
    <>
      <div className="justi-title-strip">Nuevo Gasto</div>
      <form
        onSubmit={onSubmit}
        className="p-3 sm:p-4 flex-1 flex flex-col items-center space-y-4"
      >
        {feedback && (
          <div className="w-full max-w-xl justi-alert-success">
            {feedback}
          </div>
        )}

        <div className="w-full max-w-lg rounded border border-[#B8D4EC] bg-[#F5FAFF] p-3.5 sm:p-4 space-y-2.5 text-xs shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Fecha:
              </label>
              <input
                type="text"
                readOnly
                value={new Date().toLocaleDateString('es-AR')}
                className="justi-input w-full"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sucursal:
              </label>
              <select
                value={effectiveBranch}
                disabled={isBranchLocked}
                onChange={(e) =>
                  setSelectedBranch(e.target.value as BranchType)
                }
                className="justi-select w-full font-semibold disabled:bg-slate-200 disabled:text-slate-700 disabled:cursor-not-allowed"
              >
                <option value="LOCALES">LOCALES</option>
                <option value="CARRERAS">CARRERAS</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="sm:w-28 font-semibold text-slate-700">
              Caja *:
            </label>
            <select className="justi-select w-full sm:w-56">
              {openRegisters.length > 0 ? (
                openRegisters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.boxType} ({r.branch})
                  </option>
                ))
              ) : (
                <option value="">Ventas Sucursal (PASTEUR)</option>
              )}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="sm:w-28 font-semibold text-slate-700">
              Importe $: *
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              className="justi-input w-full sm:w-36 text-right font-bold"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="sm:w-28 font-semibold text-slate-700">
              Categoría Gasto:
            </label>
            <select
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="justi-select w-full sm:w-56"
            >
              <option>Gastos Varios Sucursal</option>
              <option>Insumos y Limpieza</option>
              <option>Logística / Cadetería</option>
              <option>Servicios</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
            <label className="sm:w-28 font-semibold text-slate-700 pt-1">
              Detalle: *
            </label>
            <textarea
              rows={3}
              required
              value={expenseDetail}
              onChange={(e) => setExpenseDetail(e.target.value)}
              className="justi-input w-full flex-1"
            />
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

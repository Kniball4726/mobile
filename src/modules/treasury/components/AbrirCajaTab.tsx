import React from 'react';
import { BranchType, UserProfile } from '../../../types/domain.types';

interface AbrirCajaTabProps {
  user: UserProfile;
  effectiveBranch: BranchType;
  selectedBranch: BranchType;
  setSelectedBranch: (branch: BranchType) => void;
  isBranchLocked: boolean;
  boxType: 'Ventas Sucursal' | 'Caja Consolidada';
  setBoxType: (val: 'Ventas Sucursal' | 'Caja Consolidada') => void;
  openObservations: string;
  setOpenObservations: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const AbrirCajaTab: React.FC<AbrirCajaTabProps> = ({
  user,
  effectiveBranch,
  setSelectedBranch,
  isBranchLocked,
  boxType,
  setBoxType,
  openObservations,
  setOpenObservations,
  onSubmit,
  onCancel,
}) => {
  return (
    <>
      <div className="justi-title-strip">Apertura de Caja</div>
      <form
        onSubmit={onSubmit}
        className="p-3 sm:p-4 flex-1 flex flex-col items-center space-y-4"
      >
        <div className="w-full max-w-xl rounded border border-[#B8D4EC] bg-[#F5FAFF] p-3.5 sm:p-4 space-y-3 text-xs shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="sm:w-28 font-semibold text-slate-700">
              Usuario:
            </label>
            <select className="justi-select w-full sm:w-56" defaultValue={user.fullName}>
              <option>{user.fullName}</option>
              <option>Gregory Rodriguez</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="sm:w-28 font-semibold text-slate-700">
              Sucursal:
            </label>
            <select
              value={effectiveBranch}
              disabled={isBranchLocked}
              onChange={(e) =>
                setSelectedBranch(e.target.value as BranchType)
              }
              className="justi-select w-full sm:w-36 font-semibold disabled:bg-slate-200 disabled:text-slate-700 disabled:cursor-not-allowed"
            >
              <option value="LOCALES">LOCALES</option>
              <option value="CARRERAS">CARRERAS</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="sm:w-28 font-semibold text-slate-700">
              Tipo de Caja*:
            </label>
            <select
              value={boxType}
              onChange={(e) =>
                setBoxType(
                  e.target.value as 'Ventas Sucursal' | 'Caja Consolidada',
                )
              }
              className="justi-select w-full sm:w-56 font-bold text-[#1B5E91]"
            >
              <option value="Ventas Sucursal">Ventas Sucursal</option>
              <option value="Caja Consolidada">Caja Consolidada</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
            <label className="sm:w-28 font-semibold text-slate-700 pt-1">
              Observaciones:
            </label>
            <textarea
              rows={3}
              value={openObservations}
              onChange={(e) => setOpenObservations(e.target.value)}
              className="justi-input w-full flex-1"
            />
          </div>
        </div>

        <div className="w-full max-w-5xl rounded bg-[#5492C6] px-3.5 py-2.5 text-center text-xs font-bold text-white shadow-sm leading-relaxed">
          Atención: Al abrir una caja consolidada no pueden haber cajas
          abiertas de ningún tipo para la sucursal. Además, luego de abrir
          una caja de este tipo se incluirán como saldos iniciales los
          acumulados de las últimas cajas cerradas de la sucursal de todos
          los usuarios activos.
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

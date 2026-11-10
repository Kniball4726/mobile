import React from 'react';
import { FileSpreadsheet, FileText, UserPlus } from 'lucide-react';
import { BranchType } from '../../../types/domain.types';

interface CustomerFilterBarProps {
  userBranch: BranchType;
  selectedBranch: BranchType;
  setSelectedBranch: (branch: BranchType) => void;
  isBranchLocked: boolean;
  onlyWithDiscount: boolean;
  setOnlyWithDiscount: (val: boolean) => void;
  onOpenReport: () => void;
  onNewCustomer: () => void;
  onExportCsv: () => void;
}

export const CustomerFilterBar: React.FC<CustomerFilterBarProps> = ({
  userBranch,
  selectedBranch,
  setSelectedBranch,
  isBranchLocked,
  onlyWithDiscount,
  setOnlyWithDiscount,
  onOpenReport,
  onNewCustomer,
  onExportCsv,
}) => {
  return (
    <div className="justi-filter-bar flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-sm">
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 text-[11px]">
        <label className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
          <span>Tipo de Cliente:</span>
          <select className="rounded border border-slate-400 bg-white px-1.5 py-1 sm:py-0.5 text-xs sm:text-[11px] text-slate-800">
            <option>(todos)</option>
            <option>Consumidor Final</option>
            <option>Canje / Fidelizado</option>
          </select>
        </label>

        <label className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
          <span>Por Estado:</span>
          <select className="rounded border border-slate-400 bg-white px-1.5 py-1 sm:py-0.5 text-xs sm:text-[11px] text-slate-800">
            <option>Activos</option>
            <option>Todos</option>
          </select>
        </label>

        <label className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
          <span>Sucursal:</span>
          <select
            value={isBranchLocked ? userBranch : selectedBranch}
            disabled={isBranchLocked}
            onChange={(e) => setSelectedBranch(e.target.value as BranchType)}
            title={
              isBranchLocked
                ? 'Sucursal asignada por el Administrador (bloqueada)'
                : 'Filtrar sucursal'
            }
            className="rounded border border-slate-400 bg-white px-1.5 py-1 sm:py-0.5 text-xs sm:text-[11px] font-bold text-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed"
          >
            <option value="LOCALES">LOCALES</option>
            <option value="CARRERAS">CARRERAS</option>
          </select>
        </label>

        <label className="col-span-2 sm:col-span-1 flex items-center gap-1.5 cursor-pointer bg-white/20 px-2.5 py-1.5 sm:py-0.5 rounded">
          <input
            type="checkbox"
            checked={onlyWithDiscount}
            onChange={(e) => setOnlyWithDiscount(e.target.checked)}
            className="rounded"
          />
          <span className="font-semibold">Solo con Descuento Activo</span>
        </label>
      </div>

      <div className="grid grid-cols-2 sm:flex items-center gap-1.5">
        <button
          type="button"
          onClick={onOpenReport}
          className="col-span-2 sm:col-span-1 justi-btn-primary py-2 sm:py-1 font-bold"
        >
          <FileText className="mr-1 h-3.5 w-3.5" />
          Generar Informe
        </button>
        <button
          type="button"
          onClick={onNewCustomer}
          className="justi-btn-primary py-2 sm:py-1 font-bold"
        >
          <UserPlus className="mr-1 h-3.5 w-3.5" />
          Agregar Cliente
        </button>
        <button
          type="button"
          onClick={onExportCsv}
          className="justi-btn-primary py-2 sm:py-1"
        >
          <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
          Exportar Excel
        </button>
      </div>
    </div>
  );
};

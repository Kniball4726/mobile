import React, { useMemo, useState } from 'react';
import { BranchType, CashRegisterRecord } from '../../../types/domain.types';

interface CajasListTabProps {
  registers: CashRegisterRecord[];
  effectiveBranch: BranchType;
  selectedBranch: BranchType;
  setSelectedBranch: (branch: BranchType) => void;
  isBranchLocked: boolean;
  canOperateCash: boolean;
  canCloseRegisters: boolean;
  onNavigateOpenCaja: () => void;
  onOpenCloseModal: (reg: CashRegisterRecord) => void;
  onViewSummaryModal: (reg: CashRegisterRecord) => void;
  feedback?: string | null;
}

export const CajasListTab: React.FC<CajasListTabProps> = ({
  registers,
  effectiveBranch,
  setSelectedBranch,
  isBranchLocked,
  canOperateCash,
  canCloseRegisters,
  onNavigateOpenCaja,
  onOpenCloseModal,
  onViewSummaryModal,
  feedback,
}) => {
  const [filterUser, setFilterUser] = useState<string>('(todos)');
  const [filterBoxType, setFilterBoxType] = useState<string>('(todos)');
  const [filterStatus, setFilterStatus] = useState<string>('(todos)');

  const availableUsers = useMemo(() => {
    const set = new Set(registers.map((r) => r.userFullName).filter(Boolean));
    return Array.from(set);
  }, [registers]);

  const filteredRegisters = useMemo(() => {
    return registers.filter((r) => {
      if (effectiveBranch && r.branch !== effectiveBranch) {
        return false;
      }
      if (filterUser !== '(todos)' && r.userFullName !== filterUser) {
        return false;
      }
      if (filterBoxType !== '(todos)' && r.boxType !== filterBoxType) {
        return false;
      }
      if (filterStatus === 'Abierta' && r.status !== 'ABIERTA') {
        return false;
      }
      if (filterStatus === 'Cerrada' && r.status !== 'CERRADA') {
        return false;
      }
      return true;
    });
  }, [registers, effectiveBranch, filterUser, filterBoxType, filterStatus]);

  return (
    <>
      <div className="justi-title-strip">
        {canOperateCash ? 'Cajas' : 'Auditoría de Cajas (Solo Lectura)'}
      </div>
      <div className="p-2.5 sm:p-4 space-y-3 flex-1 max-w-[1440px] w-full mx-auto">
        {feedback && <div className="justi-alert-success">{feedback}</div>}

        <div className="justi-filter-bar flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-sm">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 text-[11px]">
            <label className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
              <span>Usuario:</span>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="rounded border border-slate-400 bg-white px-1.5 py-1 sm:py-0.5 text-xs sm:text-[11px] text-slate-800"
              >
                <option value="(todos)">(todos)</option>
                {availableUsers.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
              <span>Sucursal:</span>
              <select
                value={effectiveBranch}
                disabled={isBranchLocked}
                onChange={(e) =>
                  setSelectedBranch(e.target.value as BranchType)
                }
                className="rounded border border-slate-400 bg-white px-1.5 py-1 sm:py-0.5 text-xs sm:text-[11px] font-bold text-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed"
              >
                <option value="LOCALES">LOCALES</option>
                <option value="CARRERAS">CARRERAS</option>
              </select>
            </label>
            <label className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
              <span>Tipo Caja:</span>
              <select
                value={filterBoxType}
                onChange={(e) => setFilterBoxType(e.target.value)}
                className="rounded border border-slate-400 bg-white px-1.5 py-1 sm:py-0.5 text-xs sm:text-[11px] text-slate-800"
              >
                <option value="(todos)">(todos)</option>
                <option value="Ventas Sucursal">Ventas Sucursal</option>
                <option value="Caja Consolidada">Caja Consolidada</option>
              </select>
            </label>
            <label className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
              <span>Estado:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded border border-slate-400 bg-white px-1.5 py-1 sm:py-0.5 text-xs sm:text-[11px] text-slate-800"
              >
                <option value="(todos)">(todos)</option>
                <option value="Abierta">Abierta</option>
                <option value="Cerrada">Cerrada</option>
              </select>
            </label>
          </div>

          {canOperateCash && (
            <button
              type="button"
              onClick={onNavigateOpenCaja}
              className="justi-btn-primary w-full sm:w-auto py-2 sm:py-1 font-bold"
            >
              Abrir Nueva Caja
            </button>
          )}
        </div>

        {/* Vista Móvil (< md): Tarjetas de Cajas */}
        <div className="md:hidden space-y-2">
          {filteredRegisters.length === 0 ? (
            <div className="rounded border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center text-xs text-slate-500">
              No hay cajas que coincidan con los filtros seleccionados.
            </div>
          ) : (
            filteredRegisters.map((reg, i) => (
              <div
                key={reg.id}
                className={`rounded border border-[#80AED8] p-3 text-xs shadow-sm ${
                  i % 2 === 0 ? 'bg-[#E5E5F7]' : 'bg-[#F4F4FB]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500">
                      Sucursal {reg.branch}
                    </span>
                    <h3 className="text-sm font-bold text-[#1B5E91]">
                      {reg.boxType}
                    </h3>
                    <p className="text-xs text-slate-700">
                      Usuario: {reg.userFullName}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                      reg.status === 'ABIERTA'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {reg.status}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-slate-300/80 pt-2">
                  <div>
                    <span className="block text-[10px] text-slate-500">
                      Abierta: {reg.openedAt}
                    </span>
                    <span className="text-sm font-extrabold text-slate-900">
                      Saldo: ${reg.currentBalance.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {canCloseRegisters && reg.status === 'ABIERTA' && (
                      <button
                        type="button"
                        onClick={() => onOpenCloseModal(reg)}
                        className="justi-btn-primary py-1 px-2.5 font-bold text-xs"
                      >
                        Arqueo / Cerrar
                      </button>
                    )}
                    {reg.status === 'CERRADA' && (
                      <button
                        type="button"
                        onClick={() => onViewSummaryModal(reg)}
                        className="rounded border border-[#80AED8] bg-white text-[#1B5E91] hover:bg-[#DCEAF7] py-1 px-2.5 font-bold text-xs"
                      >
                        Ver Arqueo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Vista Desktop (>= md): Tabla */}
        <div className="hidden md:block border border-[#80AED8] bg-white overflow-x-auto">
          <div className="bg-[#4E8EC2] px-3 py-1.5 text-white flex items-center justify-between text-xs">
            <span>{filteredRegisters.length} registro(s) encontrado(s)</span>
            <span>Sucursal {effectiveBranch}</span>
          </div>
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="bg-[#DCEAF7] text-[#1B5E91] border-b border-[#80AED8]">
                <th className="py-2 px-2">Usuario</th>
                <th className="py-2 px-2">Sucursal</th>
                <th className="py-2 px-2">Tipo Caja</th>
                <th className="py-2 px-2">Abierta</th>
                <th className="py-2 px-2">Cerrada</th>
                <th className="py-2 px-2">Estado</th>
                <th className="py-2 px-2 text-right">Saldo Actual</th>
                <th className="py-2 px-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegisters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">
                    No hay cajas registradas para los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredRegisters.map((reg, i) => (
                  <tr
                    key={reg.id}
                    className={`border-b border-slate-200 ${
                      i % 2 === 0
                        ? 'justi-table-row-even'
                        : 'justi-table-row-odd'
                    }`}
                  >
                    <td className="py-2 px-2 font-semibold">
                      {reg.userFullName}
                    </td>
                    <td className="py-2 px-2">{reg.branch}</td>
                    <td className="py-2 px-2 font-bold text-[#1B5E91]">
                      {reg.boxType}
                    </td>
                    <td className="py-2 px-2">{reg.openedAt}</td>
                    <td className="py-2 px-2">{reg.closedAt || '-'}</td>
                    <td className="py-2 px-2">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          reg.status === 'ABIERTA'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-400'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {reg.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-bold">
                      ${reg.currentBalance.toLocaleString('es-AR')}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {canCloseRegisters && reg.status === 'ABIERTA' && (
                          <button
                            type="button"
                            onClick={() => onOpenCloseModal(reg)}
                            className="justi-btn-primary text-[11px] py-0.5 px-2 font-bold"
                          >
                            Arqueo / Cerrar
                          </button>
                        )}
                        {reg.status === 'CERRADA' && (
                          <button
                            type="button"
                            onClick={() => onViewSummaryModal(reg)}
                            className="rounded border border-[#80AED8] bg-white text-[#1B5E91] hover:bg-[#DCEAF7] text-[11px] py-0.5 px-2 font-semibold"
                          >
                            Ver Arqueo
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

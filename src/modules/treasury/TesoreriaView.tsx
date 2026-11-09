import React, { useState } from 'react';
import {
  BranchType,
  CashOperationRecord,
  CashRegisterRecord,
  TesoreriaTab,
  UserProfile,
} from '../../types/domain.types';

interface TesoreriaViewProps {
  user: UserProfile;
  activeTab: TesoreriaTab;
  onChangeTab: (tab: TesoreriaTab) => void;
  registers: CashRegisterRecord[];
  operations: CashOperationRecord[];
  onOpenRegister: (
    boxType: 'Ventas Sucursal' | 'Caja Consolidada',
    observations: string,
  ) => void;
  onCloseRegister: (id: string) => void;
  onRegisterOperation: (
    op: Omit<CashOperationRecord, 'id' | 'createdAt'>,
  ) => void;
}

export const TesoreriaView: React.FC<TesoreriaViewProps> = ({
  user,
  activeTab,
  onChangeTab,
  registers,
  operations,
  onOpenRegister,
  onCloseRegister,
  onRegisterOperation,
}) => {
  const assignedBranch: BranchType = user.branch || 'LOCALES';
  const isBranchLocked = user.role !== 'ADMIN' && user.role !== 'MASTER';
  const canOperateCash = user.role === 'CASHIER' || user.role === 'MASTER';
  const [selectedBranch, setSelectedBranch] =
    useState<BranchType>(assignedBranch);
  const effectiveBranch: BranchType = isBranchLocked
    ? assignedBranch
    : selectedBranch;

  const [boxType, setBoxType] = useState<'Ventas Sucursal' | 'Caja Consolidada'>(
    'Ventas Sucursal',
  );
  const [openObservations, setOpenObservations] = useState('');

  const [opType, setOpType] = useState<
    | 'INGRESO_EXTRAORDINARIO'
    | 'EGRESO_EXTRAORDINARIO'
    | 'TRANSFERENCIA_CAJAS'
  >('INGRESO_EXTRAORDINARIO');
  const [opAmount, setOpAmount] = useState('');
  const [opDetail, setOpDetail] = useState('');

  const [expenseAmount, setExpenseAmount] = useState('0.00');
  const [expenseCategory, setExpenseCategory] = useState(
    'Gastos Varios Sucursal',
  );
  const [expenseDetail, setExpenseDetail] = useState('');

  const [feedback, setFeedback] = useState<string | null>(null);

  const openRegisters = registers.filter((r) => r.status === 'ABIERTA');

  const handleSaveOpenCaja = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenRegister(boxType, openObservations);
    setOpenObservations('');
    setFeedback(
      `Caja "${boxType}" abierta correctamente para la sucursal ${effectiveBranch}.`,
    );
    onChangeTab('CAJAS');
  };

  const handleSaveOperation = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(opAmount) || 0;
    if (amountNum <= 0) return;
    onRegisterOperation({
      type: opType,
      amount: amountNum,
      detail: opDetail || 'Operación de Tesorería',
      branch: effectiveBranch,
    });
    setOpAmount('');
    setOpDetail('');
    setFeedback('Operación de caja registrada exitosamente.');
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(expenseAmount) || 0;
    if (amountNum <= 0 || !expenseDetail.trim()) return;
    onRegisterOperation({
      type: 'GASTO',
      amount: amountNum,
      category: expenseCategory,
      detail: expenseDetail.trim(),
      branch: effectiveBranch,
    });
    setExpenseAmount('0.00');
    setExpenseDetail('');
    setFeedback(
      `Gasto registrado y descontado del saldo de Caja ${effectiveBranch}.`,
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF] pb-16 sm:pb-4">
      {/* Sub-navegación: si es ADMIN, solo ve Auditoría de Cajas */}
      {canOperateCash ? (
        <div className="bg-[#DCEAF7] border-b border-[#9CC2E5] p-2 sm:px-3 sm:py-1.5 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              onChangeTab('CAJAS');
            }}
            className={`justi-btn-primary py-2 sm:py-1 ${
              activeTab === 'CAJAS' ? 'ring-2 ring-[#1B5E91] font-bold' : ''
            }`}
          >
            Cajas (Consulta)
          </button>
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              onChangeTab('ABRIR_CAJA');
            }}
            className={`justi-btn-primary py-2 sm:py-1 ${
              activeTab === 'ABRIR_CAJA' ? 'ring-2 ring-[#1B5E91] font-bold' : ''
            }`}
          >
            Abrir Nueva Caja
          </button>
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              onChangeTab('OPERACION_CAJA');
            }}
            className={`justi-btn-primary py-2 sm:py-1 ${
              activeTab === 'OPERACION_CAJA'
                ? 'ring-2 ring-[#1B5E91] font-bold'
                : ''
            }`}
          >
            Operación de Caja
          </button>
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              onChangeTab('NUEVO_GASTO');
            }}
            className={`justi-btn-primary py-2 sm:py-1 ${
              activeTab === 'NUEVO_GASTO' ? 'ring-2 ring-[#1B5E91] font-bold' : ''
            }`}
          >
            Nuevo Gasto
          </button>
        </div>
      ) : (
        <div className="bg-[#DCEAF7] border-b border-[#9CC2E5] px-4 py-2 text-xs font-semibold text-[#1B5E91]">
          Modo Supervisión y Auditoría Contable (Solo Lectura) — Las operaciones de caja son exclusivas de los cajeros.
        </div>
      )}

      {/* PANTALLA 1: CAJAS */}
      {(activeTab === 'CAJAS' || !canOperateCash) && (
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
                  <select className="rounded border border-slate-400 bg-white px-1.5 py-1 sm:py-0.5 text-xs sm:text-[11px] text-slate-800">
                    <option>{user.fullName}</option>
                    <option>(todos)</option>
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
                  <select className="rounded border border-slate-400 bg-white px-1.5 py-1 sm:py-0.5 text-xs sm:text-[11px] text-slate-800">
                    <option>(todos)</option>
                    <option>Ventas Sucursal</option>
                    <option>Caja Consolidada</option>
                  </select>
                </label>
                <label className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
                  <span>Estado:</span>
                  <select className="rounded border border-slate-400 bg-white px-1.5 py-1 sm:py-0.5 text-xs sm:text-[11px] text-slate-800">
                    <option>(todos)</option>
                    <option>Abierta</option>
                    <option>Cerrada</option>
                  </select>
                </label>
              </div>

              {canOperateCash && (
                <button
                  type="button"
                  onClick={() => onChangeTab('ABRIR_CAJA')}
                  className="justi-btn-primary w-full sm:w-auto py-2 sm:py-1 font-bold"
                >
                  Abrir Nueva Caja
                </button>
              )}
            </div>

            {/* Vista Móvil (< md): Tarjetas de Cajas */}
            <div className="md:hidden space-y-2">
              {registers.map((reg, i) => (
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
                    {canOperateCash && reg.status === 'ABIERTA' && (
                      <button
                        type="button"
                        onClick={() => onCloseRegister(reg.id)}
                        className="justi-btn-primary py-1.5 px-3 font-bold"
                      >
                        Cerrar Caja
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Vista Desktop (>= md): Tabla */}
            <div className="hidden md:block border border-[#80AED8] bg-white overflow-x-auto">
              <div className="bg-[#4E8EC2] px-3 py-1.5 text-white flex items-center justify-between text-xs">
                <span>Ver 10 registros por página</span>
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
                  {registers.map((reg, i) => (
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
                        {canOperateCash && reg.status === 'ABIERTA' ? (
                          <button
                            type="button"
                            onClick={() => onCloseRegister(reg.id)}
                            className="justi-btn-primary text-[11px] py-0.5 px-2"
                          >
                            Cerrar Caja
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* PANTALLA 2: APERTURA DE CAJA */}
      {activeTab === 'ABRIR_CAJA' && (
        <>
          <div className="justi-title-strip">Apertura de Caja</div>
          <form
            onSubmit={handleSaveOpenCaja}
            className="p-3 sm:p-4 flex-1 flex flex-col items-center space-y-4"
          >
            <div className="w-full max-w-xl rounded border border-[#B8D4EC] bg-[#F5FAFF] p-3.5 sm:p-4 space-y-3 text-xs shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <label className="sm:w-28 font-semibold text-slate-700">
                  Usuario:
                </label>
                <select className="justi-select w-full sm:w-56">
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
                onClick={() => onChangeTab('CAJAS')}
                className="justi-btn-primary py-2 sm:py-1.5 px-5"
              >
                Cancelar
              </button>
            </div>
          </form>
        </>
      )}

      {/* PANTALLA 3: REGISTRAR OPERACIÓN DE CAJA */}
      {activeTab === 'OPERACION_CAJA' && (
        <>
          <div className="justi-title-strip">Registrar Operación de Caja</div>
          <form
            onSubmit={handleSaveOperation}
            className="p-3 sm:p-4 flex-1 flex flex-col items-center space-y-4"
          >
            {feedback && (
              <div className="w-full max-w-xl justi-alert-success">
                {feedback}
              </div>
            )}

            <div className="w-full max-w-md rounded border border-[#B8D4EC] bg-[#F5FAFF] p-3.5 sm:p-4 space-y-3 text-xs shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <span className="font-semibold text-slate-700">
                  Seleccione el Tipo de Operación:
                </span>
                <div className="space-y-2">
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

              <div className="pt-2 border-t border-slate-200 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <label className="font-semibold text-slate-700">
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
                  <label className="block font-semibold text-slate-700 mb-1">
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
                onClick={() => onChangeTab('CAJAS')}
                className="justi-btn-primary py-2 sm:py-1.5 px-5"
              >
                Cancelar
              </button>
            </div>
          </form>
        </>
      )}

      {/* PANTALLA 4: NUEVO GASTO */}
      {activeTab === 'NUEVO_GASTO' && (
        <>
          <div className="justi-title-strip">Nuevo Gasto</div>
          <form
            onSubmit={handleSaveExpense}
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
                onClick={() => onChangeTab('CAJAS')}
                className="justi-btn-primary py-2 sm:py-1.5 px-5"
              >
                Cancelar
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

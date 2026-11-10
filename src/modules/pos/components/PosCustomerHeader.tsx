import React from 'react';
import { UserPlus, Sparkles } from 'lucide-react';
import { CustomerItem, UserProfile } from '../../../types/domain.types';

interface PosCustomerHeaderProps {
  user: UserProfile;
  todayFormatted: string;
  comprobante: string;
  setComprobante: (val: string) => void;
  sucursal: 'LOCALES' | 'CARRERAS';
  setSucursal: (val: 'LOCALES' | 'CARRERAS') => void;
  assignedBranch: 'LOCALES' | 'CARRERAS';
  isBranchLocked: boolean;
  remitoNumber: string;
  setRemitoNumber: (val: string) => void;
  customerSearch: string;
  setCustomerSearch: (val: string) => void;
  showCustomerDropdown: boolean;
  setShowCustomerDropdown: (val: boolean) => void;
  customerResults: CustomerItem[];
  selectedCustomer: CustomerItem | null;
  setSelectedCustomer: (cust: CustomerItem | null) => void;
  applyCrmDiscount: boolean;
  setApplyCrmDiscount: (val: boolean) => void;
  defaultCustomerLabel: string;
  onGoToClientes: () => void;
}

export const PosCustomerHeader: React.FC<PosCustomerHeaderProps> = ({
  user,
  todayFormatted,
  comprobante,
  setComprobante,
  sucursal,
  setSucursal,
  assignedBranch,
  isBranchLocked,
  remitoNumber,
  setRemitoNumber,
  customerSearch,
  setCustomerSearch,
  showCustomerDropdown,
  setShowCustomerDropdown,
  customerResults,
  selectedCustomer,
  setSelectedCustomer,
  applyCrmDiscount,
  setApplyCrmDiscount,
  defaultCustomerLabel,
  onGoToClientes,
}) => {
  return (
    <div className="rounded border border-slate-300 dark:border-slate-700 bg-[#F4F9FE] dark:bg-slate-900 p-2.5 sm:p-3 shadow-sm transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Columna Izquierda: Fecha, Cliente, Vendedor */}
        <div className="lg:col-span-5 space-y-2.5 text-xs">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <div>
              <label className="block sm:inline sm:w-20 font-semibold text-slate-700 dark:text-slate-200 mb-0.5 sm:mb-0">
                Fecha:
              </label>
              <input
                type="text"
                readOnly
                value={todayFormatted}
                className="justi-input w-full sm:w-28 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 dark:border-slate-700"
              />
            </div>
            <div className="sm:hidden flex items-end justify-end">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-black text-slate-900 dark:text-slate-100 shadow-sm">
                {comprobante.includes('Factura B') ? 'B' : 'A'}
              </span>
            </div>
          </div>

          {/* Buscador de Cliente CRM + Botón Agregar Cliente */}
          <div className="space-y-1.5 sm:space-y-0 sm:flex sm:items-center gap-2 relative">
            <label className="block sm:w-20 font-semibold text-slate-700 dark:text-slate-200">
              Cliente:
            </label>
            <div className="flex flex-col sm:flex-row flex-1 gap-1.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customerSearch}
                  onFocus={() => setShowCustomerDropdown(true)}
                  onBlur={() => {
                    if (!customerSearch.trim()) {
                      setCustomerSearch(defaultCustomerLabel);
                    }
                  }}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setSelectedCustomer(null);
                    setShowCustomerDropdown(true);
                  }}
                  placeholder="Buscar cliente por nombre o email..."
                  className="justi-input w-full font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 dark:border-slate-700"
                />

                {showCustomerDropdown && customerResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded border border-[#4E8EC2] dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl z-30">
                    {customerResults.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        onClick={() => {
                          setSelectedCustomer(c);
                          setCustomerSearch(c.fullName);
                          setShowCustomerDropdown(false);
                          setApplyCrmDiscount(true);
                        }}
                        className="flex w-full items-center justify-between border-b border-slate-100 dark:border-slate-700 px-3 py-2.5 text-left text-xs hover:bg-[#E8F2FC] dark:hover:bg-slate-700"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                            {c.fullName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {c.email}
                          </p>
                        </div>
                        {c.activeDiscount?.isAvailable &&
                        c.activeDiscount.percentage > 0 ? (
                          <span className="shrink-0 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-700 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                            {c.activeDiscount.percentage}% DTO CRM
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] text-slate-400 dark:text-slate-500">
                            0% Dto
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onGoToClientes}
                className="justi-btn-primary w-full sm:w-auto py-2 sm:py-1"
              >
                <UserPlus className="mr-1 h-3.5 w-3.5" />
                Agregar Cliente
              </button>
            </div>
          </div>

          {/* Badge de Estado de Descuento CRM de Un Solo Uso */}
          {selectedCustomer && (
            <div className="sm:ml-20 rounded border border-[#9CC2E5] dark:border-slate-700 bg-[#DCEAF7] dark:bg-slate-800/90 px-2.5 py-2 text-[11px] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="truncate">
                <span className="font-bold text-[#1B5E91] dark:text-sky-300">
                  Cliente CRM: {selectedCustomer.fullName}
                </span>{' '}
                <span className="text-slate-600 dark:text-slate-400">
                  ({selectedCustomer.email})
                </span>
              </div>
              <div className="flex items-center gap-2">
                {selectedCustomer.activeDiscount?.isAvailable &&
                selectedCustomer.activeDiscount.percentage > 0 ? (
                  <label className="inline-flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyCrmDiscount}
                      onChange={(e) => setApplyCrmDiscount(e.target.checked)}
                    />
                    <Sparkles className="h-3.5 w-3.5" />
                    Aplicar {selectedCustomer.activeDiscount.percentage}% Dto.
                    Único
                  </label>
                ) : (
                  <span className="text-amber-800 dark:text-amber-400 font-semibold">
                    Sin descuento activo{' '}
                    {selectedCustomer.activeDiscount?.consumedInSaleNumber
                      ? `(Ya usado en ${selectedCustomer.activeDiscount.consumedInSaleNumber})`
                      : ''}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomer(null);
                    setCustomerSearch(defaultCustomerLabel);
                  }}
                  className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline ml-1"
                  title="Quitar cliente y volver a Consumidor Final"
                >
                  (Quitar)
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="sm:w-20 font-semibold text-slate-700 dark:text-slate-200">
              Vendedor:
            </label>
            <select className="justi-select w-full sm:w-52 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 dark:border-slate-700">
              <option>{user.fullName}</option>
              <option>Gregory Rodriguez</option>
              <option>Daniel Cajero</option>
            </select>
          </div>
        </div>

        {/* Columna Central: Letra "A" y Datos Fiscales / Cuenta Corriente */}
        <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center text-center px-1">
          <span className="text-3xl font-black text-slate-800 dark:text-slate-100 select-none leading-none mb-1">
            {comprobante.includes('Factura B') ? 'B' : 'A'}
          </span>
          <div className="text-[10px] leading-tight space-y-0.5 text-slate-600 dark:text-slate-300 font-medium">
            <div>Saldo Cta Cte: <span className="font-bold font-mono">0.00</span></div>
            <div>Saldo Cuotas: <span className="font-bold font-mono">0.00</span></div>
            <div>Límite Max. Crédito: <span className="font-bold">Ilimitado</span></div>
            <div>Coeficiente: <span className="font-bold font-mono">1.00</span></div>
            <div>Condición de IVA: <span className="font-bold uppercase">{selectedCustomer?.ivaCondition || 'CONSUMIDOR FINAL'}</span></div>
            <div>
              DNI: <span className={`font-bold ${selectedCustomer?.dni || selectedCustomer?.taxId ? 'font-mono text-slate-800 dark:text-slate-100' : 'text-red-600 dark:text-red-400'}`}>
                {selectedCustomer?.dni || selectedCustomer?.taxId || 'No Registrado'}
              </span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Comprobante, Sucursal, Nº Remito */}
        <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-2 text-xs">
          <div className="col-span-2 sm:col-span-1 flex flex-col lg:flex-row lg:items-center lg:justify-end gap-1 lg:gap-2">
            <label className="lg:w-24 font-semibold text-slate-700 dark:text-slate-200">
              Comprobante:
            </label>
            <select
              value={comprobante}
              onChange={(e) => setComprobante(e.target.value)}
              className="justi-select w-full lg:w-48 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 dark:border-slate-700"
            >
              <option>Nota de Venta</option>
              <option>Factura B</option>
              <option>Consumidor Final</option>
            </select>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-1 lg:gap-2">
            <label className="lg:w-24 font-semibold text-slate-700 dark:text-slate-200">
              Sucursal:
            </label>
            <select
              value={isBranchLocked ? assignedBranch : sucursal}
              disabled={isBranchLocked}
              onChange={(e) => setSucursal(e.target.value as 'LOCALES' | 'CARRERAS')}
              title={
                isBranchLocked
                  ? 'Sucursal asignada por el Administrador (bloqueada)'
                  : 'Seleccionar sucursal'
              }
              className="justi-select w-full lg:w-48 font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 dark:border-slate-700 disabled:bg-slate-200 dark:disabled:bg-slate-800/60 disabled:text-slate-700 dark:disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <option value="LOCALES">LOCALES</option>
              <option value="CARRERAS">CARRERAS</option>
            </select>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-end gap-1 lg:gap-2">
            <label className="lg:w-24 font-semibold text-slate-700 dark:text-slate-200">
              Nº Remito:
            </label>
            <input
              type="text"
              value={remitoNumber}
              onChange={(e) => setRemitoNumber(e.target.value)}
              placeholder="Opcional"
              className="justi-input w-full lg:w-48 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 dark:border-slate-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

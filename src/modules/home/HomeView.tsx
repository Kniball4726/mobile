import React from 'react';
import {
  ActiveScreen,
  CashRegisterRecord,
  TesoreriaTab,
  UserProfile,
} from '../../types/domain.types';
import { Users, ShieldAlert, DoorOpen, Lock } from 'lucide-react';

interface HomeViewProps {
  user: UserProfile;
  onNavigate: (
    screen: ActiveScreen,
    tesoreriaTab?: TesoreriaTab,
    consumidorFinal?: boolean,
  ) => void;
  isCajaOpen?: boolean;
  activeRegister?: CashRegisterRecord | null;
  onOpenCaja?: () => void;
  onCloseCaja?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  onNavigate,
  isCajaOpen = false,
  activeRegister = null,
  onOpenCaja,
  onCloseCaja,
}) => {
  const isMaster = user.role === 'MASTER';
  const isCrmOnly = user.role === 'CRM';
  const canSell = user.role === 'CASHIER';
  const isAdmin = user.role === 'ADMIN';

  const isLockedForCashier = canSell && !isCajaOpen;

  const tileClass =
    'h-28 sm:h-32 sm:w-36 rounded border border-[#9CC2E5] dark:border-slate-700 bg-gradient-to-b from-[#DCECFB] to-[#C7E0F8] dark:from-slate-800 dark:to-slate-900 p-3 flex flex-col items-center justify-center text-center shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] dark:hover:from-slate-700 dark:hover:to-slate-800 active:scale-[0.98] transition cursor-pointer relative';

  const lockedTileClass =
    'h-28 sm:h-32 sm:w-36 rounded border border-slate-300 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-800/50 p-3 flex flex-col items-center justify-center text-center shadow-xs opacity-50 cursor-not-allowed select-none relative';

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF] dark:bg-slate-900 pb-16 sm:pb-0 transition-colors">
      <div className="justi-title-strip">
        {isMaster ? 'Panel Master de Control' : 'Bienvenido'}
      </div>

      <div className="flex-1 p-3.5 sm:p-6">
        {isMaster ? (
          <div className="max-w-2xl mx-auto py-6">
            <div className="text-center mb-6">
              <h2 className="text-base sm:text-lg font-bold text-[#1B5E91] dark:text-sky-300">
                Bienvenido, {user.fullName}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Acceso exclusivo de administración de sistema y gobernanza de cuentas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => onNavigate('USUARIOS')}
                className="h-36 rounded-lg border-2 border-[#9CC2E5] dark:border-slate-700 bg-gradient-to-b from-[#DCECFB] to-[#C7E0F8] dark:from-slate-800 dark:to-slate-900 p-4 flex flex-col items-center justify-center text-center shadow-md hover:from-[#CBE3FA] hover:to-[#B4D6F5] dark:hover:from-slate-700 dark:hover:to-slate-800 active:scale-[0.98] transition group"
              >
                <div className="p-2.5 rounded-full bg-[#1B5E91] text-white mb-2 shadow group-hover:scale-105 transition">
                  <Users className="h-6 w-6" />
                </div>
                <span className="text-sm sm:text-base font-bold text-[#1B5E91] dark:text-sky-300 leading-snug">
                  Gestión de Usuarios
                </span>
                <span className="text-[11px] text-[#2D6DA3] dark:text-sky-400/80 mt-1">
                  Crear Administradores, Cajeros, CRM y asignar Sucursales
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('MASTER_CONTROL')}
                className="h-36 rounded-lg border-2 border-red-300 dark:border-red-900 bg-gradient-to-b from-red-50 to-orange-100 dark:from-slate-800 dark:to-slate-900 p-4 flex flex-col items-center justify-center text-center shadow-md hover:from-red-100 hover:to-orange-200 dark:hover:from-slate-700 dark:hover:to-slate-800 active:scale-[0.98] transition group"
              >
                <div className="p-2.5 rounded-full bg-red-600 text-white mb-2 shadow group-hover:scale-105 transition">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <span className="text-sm sm:text-base font-bold text-red-900 dark:text-red-300 leading-snug">
                  Control Master
                </span>
                <span className="text-[11px] text-red-700 dark:text-red-400 mt-1">
                  Kill-Switch de Emergencia, Revocar Sesiones, API Keys & Webhooks
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {canSell && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-white dark:bg-slate-800/80 border border-[#9CC2E5] dark:border-slate-700 shadow-xs">
                <div>
                  <h2 className="text-xs sm:text-sm font-extrabold text-[#1B5E91] dark:text-sky-300 flex items-center gap-1.5">
                    <span>Hola, {user.fullName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#DCEAF7] dark:bg-slate-700 text-[#1B5E91] dark:text-sky-200">
                      Sucursal {user.branch || 'LOCALES'}
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {isCajaOpen
                      ? `Turno de venta activo. Saldo en cajón: $${activeRegister ? activeRegister.currentBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '0.00'}`
                      : 'Tu turno aún no ha sido iniciado. Por favor, abre caja con la tarjeta principal para habilitar las funciones de venta.'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      isCajaOpen
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isCajaOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    {isCajaOpen ? 'Caja en Operación' : 'Caja Cerrada (Operaciones Bloqueadas)'}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4">
              {/* TARJETA DINÁMICA DE CONTROL DE CAJA (VENDEDOR) */}
              {canSell && (
                !isCajaOpen ? (
                  /* ESTADO 1: CAJA CERRADA -> COLOR LLAMATIVO ESMERALDA CON HALO Y AVISO */
                  <button
                    type="button"
                    onClick={onOpenCaja ? onOpenCaja : () => onNavigate('APERTURA_CAJA', 'ABRIR_CAJA')}
                    className="col-span-2 sm:col-span-1 h-28 sm:h-32 sm:w-44 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-md bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.97] transition-all duration-200 border-2 border-emerald-300 dark:border-emerald-400 ring-4 ring-emerald-500/25 text-white group relative overflow-hidden"
                    title="Abrir turno de caja para comenzar a vender"
                  >
                    <div className="absolute top-1.5 right-1.5">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
                      </span>
                    </div>
                    <div className="p-2 rounded-full bg-white/20 mb-1 shadow-inner group-hover:scale-110 transition-transform">
                      <DoorOpen className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-black tracking-wide uppercase leading-tight drop-shadow-xs">
                      Abrir Caja
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-100 mt-0.5 leading-none">
                      Habilitar turno de venta
                    </span>
                    <span className="mt-1 text-[9px] font-bold bg-amber-400/90 text-slate-900 px-2 py-0.5 rounded-full shadow-xs">
                      Turno Cerrado
                    </span>
                  </button>
                ) : (
                  /* ESTADO 2: CAJA YA ABIERTA -> COLOR LLAMATIVO ROJO/CORAL INTENSO PARA CERRAR CAJA */
                  <button
                    type="button"
                    onClick={onCloseCaja ? onCloseCaja : () => onNavigate('APERTURA_CAJA', 'CAJAS')}
                    className="col-span-2 sm:col-span-1 h-28 sm:h-32 sm:w-44 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-md bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 active:scale-[0.97] transition-all duration-200 border-2 border-rose-300 dark:border-rose-400 ring-4 ring-rose-500/25 text-white group relative overflow-hidden"
                    title="Realizar arqueo y cerrar turno de caja"
                  >
                    <div className="absolute top-1.5 right-1.5">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                      </span>
                    </div>
                    <div className="p-2 rounded-full bg-white/20 mb-1 shadow-inner group-hover:scale-110 transition-transform">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-black tracking-wide uppercase leading-tight drop-shadow-xs">
                      Cerrar Caja
                    </span>
                    <span className="text-[10px] font-semibold text-rose-100 mt-0.5 leading-none">
                      Arqueo y fin de turno
                    </span>
                    <span className="mt-1 text-[9px] font-bold bg-white/25 px-2 py-0.5 rounded-full text-white shadow-xs">
                      {activeRegister
                        ? `Saldo: $${activeRegister.currentBalance.toLocaleString('es-AR')}`
                        : '🟢 Caja Abierta'}
                    </span>
                  </button>
                )
              )}

              {canSell && (
                <>
                  <button
                    type="button"
                    disabled={isLockedForCashier}
                    onClick={() => {
                      if (!isLockedForCashier) {
                        onNavigate('NUEVA_VENTA', undefined, true);
                      }
                    }}
                    className={isLockedForCashier ? lockedTileClass : tileClass}
                    title={
                      isLockedForCashier
                        ? 'Debes abrir caja para comenzar a registrar ventas'
                        : 'Nueva Venta rápida a Consumidor Final'
                    }
                  >
                    {isLockedForCashier && (
                      <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-200/90 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                        <Lock className="h-3 w-3" />
                      </div>
                    )}
                    <span
                      className={`text-xs sm:text-[13px] font-bold leading-snug ${
                        isLockedForCashier
                          ? 'text-slate-500 dark:text-slate-400'
                          : 'text-[#1B5E91] dark:text-sky-300'
                      }`}
                    >
                      Nueva Venta
                      <br />
                      (Consumidor Final)
                    </span>
                    {isLockedForCashier && (
                      <span className="mt-1 text-[9px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                        <Lock className="h-2.5 w-2.5" /> Requiere Caja
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isLockedForCashier}
                    onClick={() => {
                      if (!isLockedForCashier) {
                        onNavigate('NUEVA_VENTA', undefined, false);
                      }
                    }}
                    className={isLockedForCashier ? lockedTileClass : tileClass}
                    title={
                      isLockedForCashier
                        ? 'Debes abrir caja para comenzar a registrar ventas'
                        : 'Nueva Venta con selección de cliente y factura'
                    }
                  >
                    {isLockedForCashier && (
                      <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-200/90 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                        <Lock className="h-3 w-3" />
                      </div>
                    )}
                    <span
                      className={`text-xs sm:text-[13px] font-bold leading-snug ${
                        isLockedForCashier
                          ? 'text-slate-500 dark:text-slate-400'
                          : 'text-[#1B5E91] dark:text-sky-300'
                      }`}
                    >
                      Nueva Venta
                    </span>
                    {isLockedForCashier && (
                      <span className="mt-1 text-[9px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                        <Lock className="h-2.5 w-2.5" /> Requiere Caja
                      </span>
                    )}
                  </button>
                </>
              )}

            {!isCrmOnly && (
              <button
                type="button"
                disabled={isLockedForCashier}
                onClick={() => {
                  if (!isLockedForCashier) {
                    onNavigate('VENTAS_USUARIOS');
                  }
                }}
                className={isLockedForCashier ? lockedTileClass : tileClass}
                title={
                  isLockedForCashier
                    ? 'Debes abrir caja para acceder a las ventas del turno'
                    : 'Consultar historial de ventas POS'
                }
              >
                {isLockedForCashier && (
                  <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-200/90 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                    <Lock className="h-3 w-3" />
                  </div>
                )}
                <span
                  className={`text-xs sm:text-[13px] font-bold leading-snug ${
                    isLockedForCashier
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-[#1B5E91] dark:text-sky-300'
                  }`}
                >
                  {user.role === 'CASHIER' ? 'Mis Ventas' : 'Ventas por Usuario'}
                  <br />
                  <span
                    className={`text-[11px] font-normal ${
                      isLockedForCashier
                        ? 'text-slate-400 dark:text-slate-500'
                        : 'text-[#2D6DA3] dark:text-sky-400/80'
                    }`}
                  >
                    (Historial POS)
                  </span>
                </span>
                {isLockedForCashier && (
                  <span className="mt-1 text-[9px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                    <Lock className="h-2.5 w-2.5" /> Requiere Caja
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              disabled={isLockedForCashier}
              onClick={() => {
                if (!isLockedForCashier) {
                  onNavigate('CLIENTES');
                }
              }}
              className={isLockedForCashier ? lockedTileClass : tileClass}
              title={
                isLockedForCashier
                  ? 'Debes abrir caja para consultar y facturar a clientes'
                  : 'Gestión de clientes y descuentos CRM'
              }
            >
              {isLockedForCashier && (
                <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-200/90 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                  <Lock className="h-3 w-3" />
                </div>
              )}
              <span
                className={`text-xs sm:text-[13px] font-bold leading-snug ${
                  isLockedForCashier
                    ? 'text-slate-500 dark:text-slate-400'
                    : 'text-[#1B5E91] dark:text-sky-300'
                }`}
              >
                Clientes
                <br />
                <span
                  className={`text-[11px] font-normal ${
                    isLockedForCashier
                      ? 'text-slate-400 dark:text-slate-500'
                      : 'text-[#2D6DA3] dark:text-sky-400/80'
                  }`}
                >
                  (CRM Descuentos)
                </span>
              </span>
              {isLockedForCashier && (
                <span className="mt-1 text-[9px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                  <Lock className="h-2.5 w-2.5" /> Requiere Caja
                </span>
              )}
            </button>

            {!isCrmOnly && (
              <button
                type="button"
                disabled={isLockedForCashier}
                onClick={() => {
                  if (!isLockedForCashier) {
                    onNavigate('APERTURA_CAJA', 'CAJAS');
                  }
                }}
                className={isLockedForCashier ? lockedTileClass : tileClass}
                title={
                  isLockedForCashier
                    ? 'Usa la tarjeta principal "Abrir Caja" para iniciar tu turno'
                    : 'Control de cajas y registro de gastos'
                }
              >
                {isLockedForCashier && (
                  <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-200/90 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                    <Lock className="h-3 w-3" />
                  </div>
                )}
                <span
                  className={`text-xs sm:text-[13px] font-bold leading-snug ${
                    isLockedForCashier
                      ? 'text-slate-500 dark:text-slate-400'
                      : 'text-[#1B5E91] dark:text-sky-300'
                  }`}
                >
                  Tesorería
                  <br />
                  <span
                    className={`text-[11px] font-normal ${
                      isLockedForCashier
                        ? 'text-slate-400 dark:text-slate-500'
                        : 'text-[#2D6DA3] dark:text-sky-400/80'
                    }`}
                  >
                    (Cajas / Gastos)
                  </span>
                </span>
                {isLockedForCashier && (
                  <span className="mt-1 text-[9px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                    <Lock className="h-2.5 w-2.5" /> Requiere Caja
                  </span>
                )}
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('PRODUCTOS')}
                  className={tileClass}
                >
                  <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] dark:text-sky-300 leading-snug">
                    Productos
                    <br />
                    <span className="text-[11px] font-normal text-[#2D6DA3] dark:text-sky-400/80">
                      (Precios y Catálogo)
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('USUARIOS')}
                  className={tileClass}
                >
                  <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] dark:text-sky-300 leading-snug">
                    Operadores
                    <br />
                    <span className="text-[11px] font-normal text-[#2D6DA3] dark:text-sky-400/80">
                      (Asignar Sucursal)
                    </span>
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
      </div>

      <footer className="py-2 text-center text-[10px] font-medium text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        Copyright ©2026 JustiMobile™ - Todos y cada uno de los derechos reservados
      </footer>
    </div>
  );
};

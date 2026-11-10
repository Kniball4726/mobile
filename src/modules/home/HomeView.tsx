import React from 'react';
import {
  ActiveScreen,
  TesoreriaTab,
  UserProfile,
} from '../../types/domain.types';
import { Users, ShieldAlert } from 'lucide-react';

interface HomeViewProps {
  user: UserProfile;
  onNavigate: (
    screen: ActiveScreen,
    tesoreriaTab?: TesoreriaTab,
    consumidorFinal?: boolean,
  ) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ user, onNavigate }) => {
  const isMaster = user.role === 'MASTER';
  const isCrmOnly = user.role === 'CRM';
  const canSell = user.role === 'CASHIER';
  const isAdmin = user.role === 'ADMIN';

  const tileClass =
    'h-28 sm:h-32 sm:w-36 rounded border border-[#9CC2E5] dark:border-slate-700 bg-gradient-to-b from-[#DCECFB] to-[#C7E0F8] dark:from-slate-800 dark:to-slate-900 p-3 flex flex-col items-center justify-center text-center shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] dark:hover:from-slate-700 dark:hover:to-slate-800 active:scale-[0.98] transition';

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
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4">
            {canSell && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('NUEVA_VENTA', undefined, true)}
                  className={tileClass}
                >
                  <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] dark:text-sky-300 leading-snug">
                    Nueva Venta
                    <br />
                    (Consumidor Final)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('NUEVA_VENTA', undefined, false)}
                  className={tileClass}
                >
                  <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] dark:text-sky-300 leading-snug">
                    Nueva Venta
                  </span>
                </button>
              </>
            )}

            {!isCrmOnly && (
              <button
                type="button"
                onClick={() => onNavigate('VENTAS_USUARIOS')}
                className={tileClass}
              >
                <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] dark:text-sky-300 leading-snug">
                  {user.role === 'CASHIER' ? 'Mis Ventas' : 'Ventas por Usuario'}
                  <br />
                  <span className="text-[11px] font-normal text-[#2D6DA3] dark:text-sky-400/80">
                    (Historial POS)
                  </span>
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate('CLIENTES')}
              className={tileClass}
            >
              <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] dark:text-sky-300 leading-snug">
                Clientes
                <br />
                <span className="text-[11px] font-normal text-[#2D6DA3] dark:text-sky-400/80">
                  (CRM Descuentos)
                </span>
              </span>
            </button>

            {!isCrmOnly && (
              <button
                type="button"
                onClick={() => onNavigate('APERTURA_CAJA', 'CAJAS')}
                className={tileClass}
              >
                <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] dark:text-sky-300 leading-snug">
                  Tesorería
                  <br />
                  <span className="text-[11px] font-normal text-[#2D6DA3] dark:text-sky-400/80">
                    (Cajas / Gastos)
                  </span>
                </span>
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
        )}
      </div>

      <footer className="py-2 text-center text-[10px] font-medium text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        Copyright ©2026 JustiMobile™ - Todos y cada uno de los derechos reservados
      </footer>
    </div>
  );
};

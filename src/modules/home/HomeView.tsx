import React from 'react';
import {
  ActiveScreen,
  TesoreriaTab,
  UserProfile,
} from '../../types/domain.types';

interface HomeViewProps {
  user: UserProfile;
  onNavigate: (
    screen: ActiveScreen,
    tesoreriaTab?: TesoreriaTab,
    consumidorFinal?: boolean,
  ) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ user, onNavigate }) => {
  const isCrmOnly = user.role === 'CRM';
  const canSell = user.role === 'CASHIER' || user.role === 'MASTER';

  const tileClass =
    'h-28 sm:h-32 sm:w-36 rounded border border-[#9CC2E5] dark:border-slate-700 bg-gradient-to-b from-[#DCECFB] to-[#C7E0F8] dark:from-slate-800 dark:to-slate-900 p-3 flex flex-col items-center justify-center text-center shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] dark:hover:from-slate-700 dark:hover:to-slate-800 active:scale-[0.98] transition';

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF] dark:bg-slate-900 pb-16 sm:pb-0 transition-colors">
      <div className="justi-title-strip">Bienvenido</div>

      <div className="flex-1 p-3.5 sm:p-6">
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

          {(user.role === 'ADMIN' || user.role === 'MASTER') && (
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

          {user.role === 'MASTER' && (
            <button
              type="button"
              onClick={() => onNavigate('MASTER_CONTROL')}
              className={`col-span-2 sm:col-span-1 h-24 sm:h-32 sm:w-36 ${tileClass}`}
            >
              <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] dark:text-sky-300 leading-snug">
                Control Master
                <br />
                <span className="text-[11px] font-normal text-[#2D6DA3] dark:text-sky-400/80">
                  (API Keys &amp; Auditoría)
                </span>
              </span>
            </button>
          )}
        </div>
      </div>

      <footer className="py-2 text-center text-[10px] font-medium text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        Copyright ©2026 JustiMobile™ - Todos y cada uno de los derechos reservados
      </footer>
    </div>
  );
};

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

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF] pb-16 sm:pb-0">
      <div className="justi-title-strip">Bienvenido</div>

      <div className="flex-1 p-3.5 sm:p-6">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-4">
          {canSell && (
            <>
              <button
                type="button"
                onClick={() => onNavigate('NUEVA_VENTA', undefined, true)}
                className="h-28 sm:h-32 sm:w-36 rounded border border-[#9CC2E5] bg-gradient-to-b from-[#DCECFB] to-[#C7E0F8] p-3 flex flex-col items-center justify-center text-center shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] active:scale-[0.98] transition"
              >
                <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] leading-snug">
                  Nueva Venta
                  <br />
                  (Consumidor Final)
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('NUEVA_VENTA', undefined, false)}
                className="h-28 sm:h-32 sm:w-36 rounded border border-[#9CC2E5] bg-gradient-to-b from-[#DCECFB] to-[#C7E0F8] p-3 flex flex-col items-center justify-center text-center shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] active:scale-[0.98] transition"
              >
                <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] leading-snug">
                  Nueva Venta
                </span>
              </button>
            </>
          )}

          {!isCrmOnly && (
            <button
              type="button"
              onClick={() => onNavigate('VENTAS_USUARIOS')}
              className="h-28 sm:h-32 sm:w-36 rounded border border-[#9CC2E5] bg-gradient-to-b from-[#DCECFB] to-[#C7E0F8] p-3 flex flex-col items-center justify-center text-center shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] active:scale-[0.98] transition"
            >
              <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] leading-snug">
                {user.role === 'CASHIER' ? 'Mis Ventas' : 'Ventas por Usuario'}
                <br />
                <span className="text-[11px] font-normal text-[#2D6DA3]">
                  (Historial POS)
                </span>
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('CLIENTES')}
            className="h-28 sm:h-32 sm:w-36 rounded border border-[#9CC2E5] bg-gradient-to-b from-[#DCECFB] to-[#C7E0F8] p-3 flex flex-col items-center justify-center text-center shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] active:scale-[0.98] transition"
          >
            <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] leading-snug">
              Clientes
              <br />
              <span className="text-[11px] font-normal text-[#2D6DA3]">
                (CRM Descuentos)
              </span>
            </span>
          </button>

          {!isCrmOnly && (
            <button
              type="button"
              onClick={() => onNavigate('APERTURA_CAJA', 'CAJAS')}
              className="h-28 sm:h-32 sm:w-36 rounded border border-[#9CC2E5] bg-gradient-to-b from-[#DCECFB] to-[#C7E0F8] p-3 flex flex-col items-center justify-center text-center shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] active:scale-[0.98] transition"
            >
              <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] leading-snug">
                Tesorería
                <br />
                <span className="text-[11px] font-normal text-[#2D6DA3]">
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
                className="h-28 sm:h-32 sm:w-36 rounded border border-[#9CC2E5] bg-gradient-to-b from-[#DCECFB] to-[#C7E0F8] p-3 flex flex-col items-center justify-center text-center shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] active:scale-[0.98] transition"
              >
                <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] leading-snug">
                  Productos
                  <br />
                  <span className="text-[11px] font-normal text-[#2D6DA3]">
                    (Precios y Catálogo)
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('USUARIOS')}
                className="h-28 sm:h-32 sm:w-36 rounded border border-[#9CC2E5] bg-gradient-to-b from-[#DCECFB] to-[#C7E0F8] p-3 flex flex-col items-center justify-center text-center shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] active:scale-[0.98] transition"
              >
                <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] leading-snug">
                  Operadores
                  <br />
                  <span className="text-[11px] font-normal text-[#2D6DA3]">
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
              className="col-span-2 sm:col-span-1 h-24 sm:h-32 sm:w-36 rounded border border-[#9CC2E5] bg-gradient-to-b from-[#DCECFB] to-[#C7E0F8] p-3 flex flex-col items-center justify-center text-center shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] active:scale-[0.98] transition"
            >
              <span className="text-xs sm:text-[13px] font-bold text-[#1B5E91] leading-snug">
                Control Master
                <br />
                <span className="text-[11px] font-normal text-[#2D6DA3]">
                  (API Keys &amp; Auditoría)
                </span>
              </span>
            </button>
          )}
        </div>
      </div>

      <footer className="py-2 text-center text-[10px] text-slate-700 border-t border-slate-200 bg-white">
        Copyright © 2013 / 2026 Justi® - Todos los derechos reservados
      </footer>
    </div>
  );
};

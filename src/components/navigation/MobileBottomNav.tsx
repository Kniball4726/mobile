import React from 'react';
import { ActiveScreen, TesoreriaTab, UserProfile } from '../../types/domain.types';
import {
  Home,
  ShoppingCart,
  Users,
  Wallet,
  Tag,
  ShieldAlert,
} from 'lucide-react';

interface MobileBottomNavProps {
  user: UserProfile;
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen, tab?: TesoreriaTab) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  user,
  activeScreen,
  onNavigate,
}) => {
  const isMaster = user.role === 'MASTER';
  const isCrmOnly = user.role === 'CRM';
  const canSell = user.role === 'CASHIER';
  const canOperateCash = user.role === 'CASHIER';
  const isAdmin = user.role === 'ADMIN';

  if (isMaster) {
    return (
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#4B88BC] dark:bg-slate-900 border-t border-[#3A72A3] dark:border-slate-800 px-1 py-1 shadow-[0_-2px_8px_rgba(0,0,0,0.15)]">
        <div className="grid grid-flow-col auto-cols-fr gap-1">
          <button
            type="button"
            onClick={() => onNavigate('BIENVENIDO')}
            className={`flex flex-col items-center justify-center rounded py-1 text-[10px] font-bold ${
              activeScreen === 'BIENVENIDO'
                ? 'bg-white dark:bg-slate-800 text-[#E66000] dark:text-amber-400'
                : 'text-white/95'
            }`}
          >
            <Home className="h-4 w-4 mb-0.5" />
            <span>Inicio</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('USUARIOS')}
            className={`flex flex-col items-center justify-center rounded py-1 text-[10px] font-bold ${
              activeScreen === 'USUARIOS'
                ? 'bg-white dark:bg-slate-800 text-[#E66000] dark:text-amber-400'
                : 'text-white/95'
            }`}
          >
            <Users className="h-4 w-4 mb-0.5" />
            <span>Usuarios</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('MASTER_CONTROL')}
            className={`flex flex-col items-center justify-center rounded py-1 text-[10px] font-bold ${
              activeScreen === 'MASTER_CONTROL'
                ? 'bg-white dark:bg-slate-800 text-[#E66000] dark:text-amber-400'
                : 'text-white/95'
            }`}
          >
            <ShieldAlert className="h-4 w-4 mb-0.5" />
            <span>Control Master</span>
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#4B88BC] dark:bg-slate-900 border-t border-[#3A72A3] dark:border-slate-800 px-1 py-1 shadow-[0_-2px_8px_rgba(0,0,0,0.15)]">
      <div className="grid grid-flow-col auto-cols-fr gap-1">
        <button
          type="button"
          onClick={() => onNavigate('BIENVENIDO')}
          className={`flex flex-col items-center justify-center rounded py-1 text-[10px] font-bold ${
            activeScreen === 'BIENVENIDO'
              ? 'bg-white dark:bg-slate-800 text-[#E66000] dark:text-amber-400'
              : 'text-white/95'
          }`}
        >
          <Home className="h-4 w-4 mb-0.5" />
          <span>Inicio</span>
        </button>

        {!isCrmOnly && (
          <button
            type="button"
            onClick={() =>
              onNavigate(canSell ? 'NUEVA_VENTA' : 'VENTAS_USUARIOS')
            }
            className={`flex flex-col items-center justify-center rounded py-1 text-[10px] font-bold ${
              activeScreen === 'NUEVA_VENTA' ||
              activeScreen === 'VENTAS_USUARIOS'
                ? 'bg-white dark:bg-slate-800 text-[#E66000] dark:text-amber-400'
                : 'text-white/95'
            }`}
          >
            <ShoppingCart className="h-4 w-4 mb-0.5" />
            <span>{canSell ? 'Nueva Venta' : 'Ventas'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onNavigate('CLIENTES')}
          className={`flex flex-col items-center justify-center rounded py-1 text-[10px] font-bold ${
            activeScreen === 'CLIENTES'
              ? 'bg-white dark:bg-slate-800 text-[#E66000] dark:text-amber-400'
              : 'text-white/95'
          }`}
        >
          <Users className="h-4 w-4 mb-0.5" />
          <span>Clientes</span>
        </button>

        {!isCrmOnly && (
          <button
            type="button"
            onClick={() => onNavigate('APERTURA_CAJA', 'CAJAS')}
            className={`flex flex-col items-center justify-center rounded py-1 text-[10px] font-bold ${
              activeScreen === 'APERTURA_CAJA'
                ? 'bg-white dark:bg-slate-800 text-[#E66000] dark:text-amber-400'
                : 'text-white/95'
            }`}
          >
            <Wallet className="h-4 w-4 mb-0.5" />
            <span>{canOperateCash ? 'Tesorería' : 'Auditoría'}</span>
          </button>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={() => onNavigate('PRODUCTOS')}
            className={`flex flex-col items-center justify-center rounded py-1 text-[10px] font-bold ${
              activeScreen === 'PRODUCTOS'
                ? 'bg-white dark:bg-slate-800 text-[#E66000] dark:text-amber-400'
                : 'text-white/95'
            }`}
          >
            <Tag className="h-4 w-4 mb-0.5" />
            <span>Precios</span>
          </button>
        )}
      </div>
    </nav>
  );
};

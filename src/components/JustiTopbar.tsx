import React, { useState, useRef, useEffect } from 'react';
import {
  ActiveScreen,
  TesoreriaTab,
  UserProfile,
} from '../types/domain.types';
import {
  ChevronDown,
  LogOut,
  ShieldAlert,
  Wifi,
  WifiOff,
  Home,
  ShoppingCart,
  Tag,
  Users,
  Wallet,
} from 'lucide-react';

interface JustiTopbarProps {
  user: UserProfile;
  activeScreen: ActiveScreen;
  tesoreriaTab: TesoreriaTab;
  isCajaOpen: boolean;
  onNavigate: (screen: ActiveScreen, tesoreriaTab?: TesoreriaTab) => void;
  onLogout: () => void;
}

export const JustiTopbar: React.FC<JustiTopbarProps> = ({
  user,
  activeScreen,
  onNavigate,
  onLogout,
}) => {
  const [openMenu, setOpenMenu] = useState<
    'VENTAS' | 'TESORERIA' | 'USER' | null
  >(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstName = user.fullName.split(' ')[0] || user.email;
  const isCrmOnly = user.role === 'CRM';
  const canSell = user.role === 'CASHIER' || user.role === 'MASTER';
  const canOperateCash = user.role === 'CASHIER' || user.role === 'MASTER';

  return (
    <>
      <header
        ref={navRef}
        className="justi-topbar sticky top-0 z-40 px-2 py-1.5 select-none"
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-1.5">
          {/* Izquierda: Logo Pirámide Justi + Menú Principal */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                onNavigate('BIENVENIDO');
              }}
              className="flex items-center gap-1.5 rounded px-1.5 py-0.5 hover:bg-white/10 transition-colors"
              title="Ir a Inicio - JustiMobile"
            >
              <img
                src="/justi-logo.svg"
                alt="Justi Logo"
                className="h-7 w-8 sm:w-9 object-contain drop-shadow-sm"
              />
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white drop-shadow-sm flex items-center">
                Justi<span className="text-[#C5E1FF]">Mobile</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                onNavigate('BIENVENIDO');
              }}
              className={`justi-nav-pill text-[11px] sm:text-xs px-2 sm:px-2.5 ${
                activeScreen === 'BIENVENIDO' ? 'justi-nav-pill-active' : ''
              }`}
            >
              Inicio
            </button>

            {/* Si es rol CRM únicamente ve acceso directo a Clientes; otros roles ven Ventas-Cobros y Tesorería */}
            {isCrmOnly ? (
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  onNavigate('CLIENTES');
                }}
                className={`justi-nav-pill text-[11px] sm:text-xs px-2 sm:px-2.5 ${
                  activeScreen === 'CLIENTES' ? 'justi-nav-pill-active' : ''
                }`}
              >
                <span>Clientes (CRM)</span>
              </button>
            ) : (
              <>
                {/* Menú Desplegable: Ventas-Cobros ▾ */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenu(openMenu === 'VENTAS' ? null : 'VENTAS')
                    }
                    className={`justi-nav-pill text-[11px] sm:text-xs px-2 sm:px-2.5 ${
                      openMenu === 'VENTAS' ||
                      activeScreen === 'NUEVA_VENTA' ||
                      activeScreen === 'VENTAS_USUARIOS' ||
                      activeScreen === 'CLIENTES'
                        ? 'justi-nav-pill-active'
                        : ''
                    }`}
                  >
                    <span>Ventas-Cobros</span>
                    <ChevronDown className="ml-1 h-3.5 w-3.5" />
                  </button>

                  {openMenu === 'VENTAS' && (
                    <div className="absolute left-0 mt-1 w-52 rounded border border-[#9CC2E5] bg-[#F5FAFF] py-1 shadow-xl z-50">
                      {canSell && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenu(null);
                              onNavigate('NUEVA_VENTA');
                            }}
                            className="block w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-[#D9ECFB] hover:text-[#1B5E91]"
                          >
                            Agregar Nueva Venta
                          </button>
                          <div className="my-0.5 border-t border-slate-300 mx-2" />
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onNavigate('VENTAS_USUARIOS');
                        }}
                        className="block w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-[#D9ECFB] hover:text-[#1B5E91]"
                      >
                        {user.role === 'CASHIER'
                          ? 'Mis Ventas Registradas'
                          : 'Ventas por Usuario'}
                      </button>
                      <div className="my-0.5 border-t border-slate-300 mx-2" />
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onNavigate('CLIENTES');
                        }}
                        className="block w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-[#D9ECFB] hover:text-[#1B5E91]"
                      >
                        Clientes
                      </button>
                    </div>
                  )}
                </div>

                {/* Menú Desplegable: Tesorería ▾ */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenu(openMenu === 'TESORERIA' ? null : 'TESORERIA')
                    }
                    className={`justi-nav-pill text-[11px] sm:text-xs px-2 sm:px-2.5 ${
                      openMenu === 'TESORERIA' ||
                      activeScreen === 'APERTURA_CAJA'
                        ? 'justi-nav-pill-active'
                        : ''
                    }`}
                  >
                    <span>{canOperateCash ? 'Tesorería' : 'Auditoría'}</span>
                    <ChevronDown className="ml-1 h-3.5 w-3.5" />
                  </button>

                  {openMenu === 'TESORERIA' && (
                    <div className="absolute left-0 sm:left-0 mt-1 w-52 rounded border border-[#9CC2E5] bg-[#F5FAFF] py-1 shadow-xl z-50">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onNavigate('APERTURA_CAJA', 'CAJAS');
                        }}
                        className="block w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-[#D9ECFB] hover:text-[#1B5E91]"
                      >
                        {canOperateCash ? 'Cajas' : 'Auditoría de Cajas'}
                      </button>
                      {canOperateCash && (
                        <>
                          <div className="my-0.5 border-t border-slate-300 mx-2" />
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenu(null);
                              onNavigate('APERTURA_CAJA', 'ABRIR_CAJA');
                            }}
                            className="block w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-[#D9ECFB] hover:text-[#1B5E91]"
                          >
                            Abrir Nueva Caja
                          </button>
                          <div className="my-0.5 border-t border-slate-300 mx-2" />
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenu(null);
                              onNavigate('APERTURA_CAJA', 'OPERACION_CAJA');
                            }}
                            className="block w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-[#D9ECFB] hover:text-[#1B5E91]"
                          >
                            Registrar Operación de Caja
                          </button>
                          <div className="my-0.5 border-t border-slate-300 mx-2" />
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenu(null);
                              onNavigate('APERTURA_CAJA', 'NUEVO_GASTO');
                            }}
                            className="block w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-800 hover:bg-[#D9ECFB] hover:text-[#1B5E91]"
                          >
                            Nuevo Gasto
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {(user.role === 'ADMIN' || user.role === 'MASTER') && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onNavigate('PRODUCTOS');
                  }}
                  className={`justi-nav-pill text-[11px] sm:text-xs px-2 sm:px-2.5 ${
                    activeScreen === 'PRODUCTOS' ? 'justi-nav-pill-active' : ''
                  }`}
                >
                  <Tag className="mr-1 h-3.5 w-3.5" />
                  <span>Productos</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onNavigate('USUARIOS');
                  }}
                  className={`justi-nav-pill text-[11px] sm:text-xs px-2 sm:px-2.5 ${
                    activeScreen === 'USUARIOS' ? 'justi-nav-pill-active' : ''
                  }`}
                >
                  <Users className="mr-1 h-3.5 w-3.5" />
                  <span>Operadores</span>
                </button>
              </>
            )}

            {user.role === 'MASTER' && (
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  onNavigate('MASTER_CONTROL');
                }}
                className={`hidden sm:inline-flex justi-nav-pill ${
                  activeScreen === 'MASTER_CONTROL'
                    ? 'justi-nav-pill-active'
                    : ''
                }`}
              >
                <ShieldAlert className="mr-1 h-3.5 w-3.5 text-amber-600" />
                <span>Master</span>
              </button>
            )}
          </div>

          {/* Derecha: Estado Online/Offline + Usuario */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`hidden md:inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                isOnline
                  ? 'bg-emerald-100/90 text-emerald-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {isOnline ? (
                <Wifi className="h-3 w-3 text-emerald-700" />
              ) : (
                <WifiOff className="h-3 w-3 text-amber-700" />
              )}
              {isOnline
                ? `${user.branch || 'LOCALES'} • ONLINE`
                : `${user.branch || 'LOCALES'} • OFFLINE`}
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === 'USER' ? null : 'USER')}
                className="justi-nav-pill text-[11px] sm:text-xs px-2 sm:px-2.5"
              >
                <span className="max-w-[72px] sm:max-w-none truncate">
                  {firstName}
                </span>
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>

              {openMenu === 'USER' && (
                <div className="absolute right-0 mt-1 w-56 rounded border border-[#9CC2E5] bg-[#F5FAFF] py-1.5 shadow-xl z-50">
                  <div className="px-3.5 py-2 border-b border-slate-200">
                    <p className="text-xs font-bold text-[#1B5E91] truncate">
                      {user.fullName}
                    </p>
                    <p className="text-[11px] text-slate-600 truncate">
                      {user.email}
                    </p>
                    <span className="mt-1 inline-block rounded bg-[#D9ECFB] px-1.5 py-0.5 text-[10px] font-bold text-[#1B5E91]">
                      Rol: {user.role} • Sucursal: {user.branch || 'LOCALES'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Barra Inferior Táctil para Móviles (sm:hidden) */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#4B88BC] border-t border-[#3A72A3] px-1 py-1 shadow-[0_-2px_8px_rgba(0,0,0,0.15)]">
        <div className="grid grid-flow-col auto-cols-fr gap-1">
          <button
            type="button"
            onClick={() => onNavigate('BIENVENIDO')}
            className={`flex flex-col items-center justify-center rounded py-1 text-[10px] font-bold ${
              activeScreen === 'BIENVENIDO'
                ? 'bg-white text-[#E66000]'
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
                  ? 'bg-white text-[#E66000]'
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
                ? 'bg-white text-[#E66000]'
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
                  ? 'bg-white text-[#E66000]'
                  : 'text-white/95'
              }`}
            >
              <Wallet className="h-4 w-4 mb-0.5" />
              <span>{canOperateCash ? 'Tesorería' : 'Auditoría'}</span>
            </button>
          )}

          {(user.role === 'ADMIN' || user.role === 'MASTER') && (
            <button
              type="button"
              onClick={() => onNavigate('PRODUCTOS')}
              className={`flex flex-col items-center justify-center rounded py-1 text-[10px] font-bold ${
                activeScreen === 'PRODUCTOS'
                  ? 'bg-white text-[#E66000]'
                  : 'text-white/95'
              }`}
            >
              <Tag className="h-4 w-4 mb-0.5" />
              <span>Precios</span>
            </button>
          )}

          {user.role === 'MASTER' && (
            <button
              type="button"
              onClick={() => onNavigate('MASTER_CONTROL')}
              className={`flex flex-col items-center justify-center rounded py-1 text-[10px] font-bold ${
                activeScreen === 'MASTER_CONTROL'
                  ? 'bg-white text-[#E66000]'
                  : 'text-white/95'
              }`}
            >
              <ShieldAlert className="h-4 w-4 mb-0.5" />
              <span>Master</span>
            </button>
          )}
        </div>
      </nav>
    </>
  );
};

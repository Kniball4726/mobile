import React, { useState, useRef, useEffect } from 'react';
import {
  ActiveScreen,
  TesoreriaTab,
  UserProfile,
} from '../../types/domain.types';
import {
  Menu,
  ChevronDown,
  ShieldAlert,
  Wifi,
  WifiOff,
  RefreshCw,
  Tag,
  Users,
  Sun,
  Moon,
  LineChart,
} from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { NavigationDrawer } from './NavigationDrawer';
import { MobileBottomNav } from './MobileBottomNav';
import { UserMenuDropdown } from './UserMenuDropdown';

export interface JustiTopbarProps {
  token?: string;
  user: UserProfile;
  activeScreen: ActiveScreen;
  tesoreriaTab: TesoreriaTab;
  isCajaOpen: boolean;
  isDark?: boolean;
  onToggleDarkMode?: () => void;
  onNavigate: (screen: ActiveScreen, tesoreriaTab?: TesoreriaTab) => void;
  onLogout: () => void;
}

export const JustiTopbar: React.FC<JustiTopbarProps> = ({
  token,
  user,
  activeScreen,
  tesoreriaTab,
  isCajaOpen,
  isDark = false,
  onToggleDarkMode,
  onNavigate,
  onLogout,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<
    'VENTAS' | 'TESORERIA' | 'USER' | null
  >(null);
  const { isOnline, pendingCount, isSyncing, syncNow } = useNetworkStatus();
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDrawerOpen(false);
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isCrmOnly = user.role === 'CRM';
  const isMaster = user.role === 'MASTER';
  const canSell = user.role === 'CASHIER';
  const canOperateCash = user.role === 'CASHIER';
  const isAdmin = user.role === 'ADMIN';

  return (
    <>
      {/* BARRA SUPERIOR (HEADER) */}
      <header
        ref={navRef}
        className="justi-topbar sticky top-0 z-40 px-2 py-1.5 select-none shadow-sm"
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-1.5">
          {/* Izquierda: Botón Hamburguesa + Logo JustiMobile + Acceso Rápido Desktop */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* BOTÓN HAMBURGUESA */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 rounded-md hover:bg-white/15 text-white flex items-center justify-center transition active:scale-95"
              title="Abrir menú de navegación"
              aria-label="Menú principal"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo de la Marca */}
            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                onNavigate('BIENVENIDO');
              }}
              className="flex items-center gap-2 rounded px-1.5 py-0.5 hover:bg-white/10 transition-colors"
              title="Ir a Inicio - UltraTech Carreras"
            >
              <img
                src="/ultratech-carreras-logo.png"
                alt="UltraTech Carreras"
                className="h-7 w-7 rounded object-cover shadow-sm border border-slate-300/30"
              />
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white drop-shadow-sm flex items-center">
                UltraTech<span className="text-amber-300 ml-1">Carreras</span>
              </span>
            </button>

            {/* Acceso Rápido Horizontal Desktop (>= md) */}
            <div className="hidden md:flex items-center gap-1 ml-1">
              <button
                type="button"
                onClick={() => {
                  setOpenMenu(null);
                  onNavigate('BIENVENIDO');
                }}
                className={`justi-nav-pill text-xs px-2.5 ${
                  activeScreen === 'BIENVENIDO' ? 'justi-nav-pill-active' : ''
                }`}
              >
                Inicio
              </button>

              {isMaster ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onNavigate('USUARIOS');
                    }}
                    className={`justi-nav-pill text-xs px-2.5 ${
                      activeScreen === 'USUARIOS' ? 'justi-nav-pill-active' : ''
                    }`}
                  >
                    <Users className="mr-1 h-3.5 w-3.5" />
                    <span>Gestión de Usuarios</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOpenMenu(null);
                      onNavigate('MASTER_CONTROL');
                    }}
                    className={`justi-nav-pill text-xs px-2.5 ${
                      activeScreen === 'MASTER_CONTROL'
                        ? 'justi-nav-pill-active'
                        : ''
                    }`}
                  >
                    <ShieldAlert className="mr-1 h-3.5 w-3.5 text-amber-300" />
                    <span>Control Master</span>
                  </button>
                </>
              ) : isCrmOnly ? (
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenu(null);
                    onNavigate('CLIENTES');
                  }}
                  className={`justi-nav-pill text-xs px-2.5 ${
                    activeScreen === 'CLIENTES' ? 'justi-nav-pill-active' : ''
                  }`}
                >
                  <span>Clientes (CRM)</span>
                </button>
              ) : (
                <>
                  {/* Desplegable Ventas-Cobros */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(openMenu === 'VENTAS' ? null : 'VENTAS')
                      }
                      className={`justi-nav-pill text-xs px-2.5 ${
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
                      <div className="absolute left-0 mt-1 w-52 rounded border border-[#9CC2E5] dark:border-slate-700 bg-[#F5FAFF] dark:bg-slate-800 py-1 shadow-xl z-50">
                        {canSell && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenu(null);
                                onNavigate('NUEVA_VENTA');
                              }}
                              className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#D9ECFB] dark:hover:bg-slate-700 hover:text-[#1B5E91] dark:hover:text-blue-300"
                            >
                              Nueva Venta (POS)
                            </button>
                            <div className="my-0.5 border-t border-slate-300 dark:border-slate-700 mx-2" />
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenu(null);
                            onNavigate('VENTAS_USUARIOS');
                          }}
                          className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#D9ECFB] dark:hover:bg-slate-700 hover:text-[#1B5E91] dark:hover:text-blue-300"
                        >
                          {user.role === 'CASHIER'
                            ? 'Mis Ventas Registradas'
                            : 'Ventas por Usuario'}
                        </button>
                        <div className="my-0.5 border-t border-slate-300 dark:border-slate-700 mx-2" />
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenu(null);
                            onNavigate('CLIENTES');
                          }}
                          className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#D9ECFB] dark:hover:bg-slate-700 hover:text-[#1B5E91] dark:hover:text-blue-300"
                        >
                          Clientes CRM
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Desplegable Tesorería */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(
                          openMenu === 'TESORERIA' ? null : 'TESORERIA',
                        )
                      }
                      className={`justi-nav-pill text-xs px-2.5 ${
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
                      <div className="absolute left-0 mt-1 w-52 rounded border border-[#9CC2E5] dark:border-slate-700 bg-[#F5FAFF] dark:bg-slate-800 py-1 shadow-xl z-50">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenu(null);
                            onNavigate('APERTURA_CAJA', 'CAJAS');
                          }}
                          className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#D9ECFB] dark:hover:bg-slate-700 hover:text-[#1B5E91] dark:hover:text-blue-300"
                        >
                          {canOperateCash ? 'Cajas' : 'Auditoría de Cajas'}
                        </button>
                        {canOperateCash && (
                          <>
                            <div className="my-0.5 border-t border-slate-300 dark:border-slate-700 mx-2" />
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenu(null);
                                onNavigate('APERTURA_CAJA', 'ABRIR_CAJA');
                              }}
                              className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#D9ECFB] dark:hover:bg-slate-700 hover:text-[#1B5E91] dark:hover:text-blue-300"
                            >
                              Abrir Nueva Caja
                            </button>
                            <div className="my-0.5 border-t border-slate-300 dark:border-slate-700 mx-2" />
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenu(null);
                                onNavigate(
                                  'APERTURA_CAJA',
                                  'OPERACION_CAJA',
                                );
                              }}
                              className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#D9ECFB] dark:hover:bg-slate-700 hover:text-[#1B5E91] dark:hover:text-blue-300"
                            >
                              Registrar Operación de Caja
                            </button>
                            <div className="my-0.5 border-t border-slate-300 dark:border-slate-700 mx-2" />
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenu(null);
                                onNavigate('APERTURA_CAJA', 'NUEVO_GASTO');
                              }}
                              className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-[#D9ECFB] dark:hover:bg-slate-700 hover:text-[#1B5E91] dark:hover:text-blue-300"
                            >
                              Nuevo Gasto
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onNavigate('BIENVENIDO');
                        }}
                        className={`justi-nav-pill text-xs px-2.5 ${
                          activeScreen === 'BIENVENIDO'
                            ? 'justi-nav-pill-active'
                            : ''
                        }`}
                      >
                        <LineChart className="mr-1 h-3.5 w-3.5 text-amber-300" />
                        <span>Dashboard BI</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenu(null);
                          onNavigate('PRODUCTOS');
                        }}
                        className={`justi-nav-pill text-xs px-2.5 ${
                          activeScreen === 'PRODUCTOS'
                            ? 'justi-nav-pill-active'
                            : ''
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
                        className={`justi-nav-pill text-xs px-2.5 ${
                          activeScreen === 'USUARIOS'
                            ? 'justi-nav-pill-active'
                            : ''
                        }`}
                      >
                        <Users className="mr-1 h-3.5 w-3.5" />
                        <span>Operadores</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Derecha: Estado Online/Offline + Ventas Pendientes + Sucursal + Botón Dark Mode + Perfil */}
          <div className="flex items-center gap-1.5 shrink-0">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => token && syncNow(token)}
                disabled={isSyncing || !isOnline}
                title={
                  isOnline
                    ? `Sincronizar ${pendingCount} venta(s) offline con la nube`
                    : `${pendingCount} venta(s) guardadas offline en el dispositivo (sin conexión)`
                }
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold shadow-sm transition active:scale-95 ${
                  isOnline
                    ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 animate-pulse cursor-pointer'
                    : 'bg-amber-200/90 text-amber-950 cursor-default'
                }`}
              >
                <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>
                  {pendingCount} {pendingCount === 1 ? 'offline' : 'offlines'}
                </span>
              </button>
            )}

            <span
              className={`hidden sm:inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                isOnline
                  ? 'bg-emerald-100/90 text-emerald-900'
                  : 'bg-amber-100 text-amber-900 animate-pulse'
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

            {/* Botón Dark Mode Toggle */}
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="p-1 sm:p-1.5 rounded-md hover:bg-white/15 text-white flex items-center justify-center transition active:scale-90"
                title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
                aria-label="Alternar modo oscuro"
              >
                {isDark ? (
                  <Sun className="h-4 w-4 text-amber-300 animate-in spin-in-90 duration-200" />
                ) : (
                  <Moon className="h-4 w-4 text-white/90" />
                )}
              </button>
            )}

            {/* Menú de Usuario */}
            <UserMenuDropdown
              user={user}
              isOpen={openMenu === 'USER'}
              onToggle={() =>
                setOpenMenu(openMenu === 'USER' ? null : 'USER')
              }
              onClose={() => setOpenMenu(null)}
              onLogout={onLogout}
            />
          </div>
        </div>
      </header>

      {/* MENÚ HAMBURGUESA LATERAL (DRAWER) */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        user={user}
        activeScreen={activeScreen}
        isCajaOpen={isCajaOpen}
        isDark={isDark}
        onToggleDarkMode={onToggleDarkMode}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      {/* BARRA INFERIOR TÁCTIL PARA MÓVILES */}
      <MobileBottomNav
        user={user}
        activeScreen={activeScreen}
        onNavigate={onNavigate}
      />
    </>
  );
};

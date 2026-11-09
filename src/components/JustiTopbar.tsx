import React, { useState, useRef, useEffect } from 'react';
import {
  ActiveScreen,
  TesoreriaTab,
  UserProfile,
} from '../types/domain.types';
import {
  Menu,
  X,
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
  Receipt,
  PlusCircle,
  ArrowRightLeft,
  FileText,
  UserCheck,
  Building2,
  CheckCircle2,
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
  isCajaOpen,
  onNavigate,
  onLogout,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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

  const firstName = user.fullName.split(' ')[0] || user.email;
  const isCrmOnly = user.role === 'CRM';
  const canSell = user.role === 'CASHIER' || user.role === 'MASTER';
  const canOperateCash = user.role === 'CASHIER' || user.role === 'MASTER';
  const isAdminOrMaster = user.role === 'ADMIN' || user.role === 'MASTER';

  const handleDrawerNavigate = (
    screen: ActiveScreen,
    tab?: TesoreriaTab,
  ) => {
    setIsDrawerOpen(false);
    setOpenMenu(null);
    onNavigate(screen, tab);
  };

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
            {/* BOTÓN HAMBURGUESA (SIEMPRE DISPONIBLE) */}
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

            {/* Acceso Rápido Horizontal (Visible en Desktop/Tablet >= md) */}
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

              {isCrmOnly ? (
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
                      <div className="absolute left-0 mt-1 w-52 rounded border border-[#9CC2E5] bg-[#F5FAFF] py-1 shadow-xl z-50">
                        {canSell && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenu(null);
                                onNavigate('NUEVA_VENTA');
                              }}
                              className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 hover:bg-[#D9ECFB] hover:text-[#1B5E91]"
                            >
                              Nueva Venta (POS)
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
                          className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 hover:bg-[#D9ECFB] hover:text-[#1B5E91]"
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
                          className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 hover:bg-[#D9ECFB] hover:text-[#1B5E91]"
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
                      <div className="absolute left-0 mt-1 w-52 rounded border border-[#9CC2E5] bg-[#F5FAFF] py-1 shadow-xl z-50">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenu(null);
                            onNavigate('APERTURA_CAJA', 'CAJAS');
                          }}
                          className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 hover:bg-[#D9ECFB] hover:text-[#1B5E91]"
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
                              className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 hover:bg-[#D9ECFB] hover:text-[#1B5E91]"
                            >
                              Abrir Nueva Caja
                            </button>
                            <div className="my-0.5 border-t border-slate-300 mx-2" />
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenu(null);
                                onNavigate(
                                  'APERTURA_CAJA',
                                  'OPERACION_CAJA',
                                );
                              }}
                              className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 hover:bg-[#D9ECFB] hover:text-[#1B5E91]"
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
                              className="block w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-800 hover:bg-[#D9ECFB] hover:text-[#1B5E91]"
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

              {isAdminOrMaster && (
                <>
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
                  className={`justi-nav-pill text-xs px-2.5 ${
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
          </div>

          {/* Derecha: Estado Online/Offline + Sucursal + Perfil */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`hidden sm:inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
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

            {/* Menú de Usuario */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === 'USER' ? null : 'USER')}
                className="justi-nav-pill text-xs px-2 sm:px-2.5 flex items-center"
              >
                <span className="max-w-[80px] sm:max-w-none truncate font-bold">
                  {firstName}
                </span>
                <ChevronDown className="ml-1 h-3.5 w-3.5" />
              </button>

              {openMenu === 'USER' && (
                <div className="absolute right-0 mt-1 w-60 rounded border border-[#9CC2E5] bg-[#F5FAFF] py-1.5 shadow-xl z-50">
                  <div className="px-3.5 py-2 border-b border-slate-200">
                    <p className="text-xs font-bold text-[#1B5E91] truncate">
                      {user.fullName}
                    </p>
                    <p className="text-[11px] text-slate-600 truncate">
                      {user.email}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <span className="rounded bg-[#D9ECFB] px-1.5 py-0.5 text-[10px] font-bold text-[#1B5E91]">
                        Rol: {user.role}
                      </span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        {user.branch || 'LOCALES'}
                      </span>
                    </div>
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

      {/* MENÚ HAMBURGUESA LATERAL (DRAWER OVERLAY & PANEL) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Fondo Oscuro con Desenfoque */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Panel Lateral Drawer */}
          <aside className="fixed inset-y-0 left-0 max-w-full flex">
            <div className="w-80 max-w-[85vw] bg-white shadow-2xl flex flex-col border-r border-[#80AED8] animate-in slide-in-from-left duration-200">
              {/* Encabezado del Drawer */}
              <div className="bg-gradient-to-r from-[#1B5E91] to-[#3B82F6] p-4 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img
                      src="/justi-logo.svg"
                      alt="Justi Logo"
                      className="h-7 w-8 object-contain drop-shadow"
                    />
                    <span className="text-lg font-black tracking-tight">
                      Justi<span className="text-[#C5E1FF]">Mobile</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1 rounded-md text-white/90 hover:bg-white/20 hover:text-white transition"
                    title="Cerrar menú"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Perfil del Operador */}
                <div className="rounded bg-white/10 p-2.5 backdrop-blur-xs border border-white/20">
                  <p className="text-xs font-bold truncate">{user.fullName}</p>
                  <p className="text-[11px] text-white/80 truncate mb-1.5">
                    {user.email}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="rounded bg-white px-1.5 py-0.5 font-extrabold text-[#1B5E91]">
                      {user.role}
                    </span>
                    <span className="rounded bg-emerald-400/90 text-slate-900 px-1.5 py-0.5 font-bold flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {user.branch || 'LOCALES'}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-bold ${
                        isCajaOpen
                          ? 'bg-emerald-200 text-emerald-950'
                          : 'bg-slate-300 text-slate-800'
                      }`}
                    >
                      {isCajaOpen ? 'Caja Abierta' : 'Caja Cerrada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista Scrollable de Opciones */}
              <nav className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
                {/* 1. Módulo General */}
                <div>
                  <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    General
                  </span>
                  <div className="mt-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handleDrawerNavigate('BIENVENIDO')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                        activeScreen === 'BIENVENIDO'
                          ? 'bg-[#DCEAF7] text-[#1B5E91] font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Home className="h-4 w-4 text-[#1B5E91]" />
                      <span>Inicio / Panel Principal</span>
                    </button>
                  </div>
                </div>

                {/* 2. Módulo de Ventas & Cobros (si no es solo CRM) */}
                {!isCrmOnly && (
                  <div>
                    <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Ventas & Facturación
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {canSell && (
                        <button
                          type="button"
                          onClick={() => handleDrawerNavigate('NUEVA_VENTA')}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                            activeScreen === 'NUEVA_VENTA'
                              ? 'bg-[#DCEAF7] text-[#1B5E91] font-bold'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <ShoppingCart className="h-4 w-4 text-emerald-600" />
                          <span>Nueva Venta en POS</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          handleDrawerNavigate('VENTAS_USUARIOS')
                        }
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                          activeScreen === 'VENTAS_USUARIOS'
                            ? 'bg-[#DCEAF7] text-[#1B5E91] font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Receipt className="h-4 w-4 text-[#1B5E91]" />
                        <span>
                          {user.role === 'CASHIER'
                            ? 'Mis Ventas Registradas'
                            : 'Auditoría de Ventas por Usuario'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Módulo Clientes & Fidelización */}
                <div>
                  <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Fidelización & Clientes
                  </span>
                  <div className="mt-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handleDrawerNavigate('CLIENTES')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                        activeScreen === 'CLIENTES'
                          ? 'bg-[#DCEAF7] text-[#1B5E91] font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>Clientes CRM (Descuentos)</span>
                    </button>
                  </div>
                </div>

                {/* 4. Módulo Tesorería y Cajas (si no es solo CRM) */}
                {!isCrmOnly && (
                  <div>
                    <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Tesorería & Cajas
                    </span>
                    <div className="mt-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleDrawerNavigate('APERTURA_CAJA', 'CAJAS')
                        }
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                          activeScreen === 'APERTURA_CAJA'
                            ? 'bg-[#DCEAF7] text-[#1B5E91] font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Wallet className="h-4 w-4 text-[#1B5E91]" />
                        <span>
                          {canOperateCash
                            ? 'Consulta de Cajas'
                            : 'Auditoría de Cajas'}
                        </span>
                      </button>

                      {canOperateCash && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleDrawerNavigate(
                                'APERTURA_CAJA',
                                'ABRIR_CAJA',
                              )
                            }
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 font-semibold"
                          >
                            <PlusCircle className="h-4 w-4 text-emerald-600" />
                            <span>Abrir Nueva Caja</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDrawerNavigate(
                                'APERTURA_CAJA',
                                'OPERACION_CAJA',
                              )
                            }
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 font-semibold"
                          >
                            <ArrowRightLeft className="h-4 w-4 text-indigo-600" />
                            <span>Operación de Caja</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDrawerNavigate(
                                'APERTURA_CAJA',
                                'NUEVO_GASTO',
                              )
                            }
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 font-semibold"
                          >
                            <FileText className="h-4 w-4 text-red-600" />
                            <span>Nuevo Gasto de Mostrador</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. Módulo Administración (ADMIN / MASTER) */}
                {isAdminOrMaster && (
                  <div>
                    <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Administración Comercial
                    </span>
                    <div className="mt-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleDrawerNavigate('PRODUCTOS')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                          activeScreen === 'PRODUCTOS'
                            ? 'bg-[#DCEAF7] text-[#1B5E91] font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Tag className="h-4 w-4 text-amber-600" />
                        <span>Catálogo y Precios</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDrawerNavigate('USUARIOS')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                          activeScreen === 'USUARIOS'
                            ? 'bg-[#DCEAF7] text-[#1B5E91] font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <UserCheck className="h-4 w-4 text-[#1B5E91]" />
                        <span>Operadores y Sucursales</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 6. Módulo Master (solo MASTER) */}
                {user.role === 'MASTER' && (
                  <div>
                    <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Control del Sistema
                    </span>
                    <div className="mt-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleDrawerNavigate('MASTER_CONTROL')
                        }
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                          activeScreen === 'MASTER_CONTROL'
                            ? 'bg-[#DCEAF7] text-[#1B5E91] font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <ShieldAlert className="h-4 w-4 text-red-600" />
                        <span>Control Master (Kill-Switch / API)</span>
                      </button>
                    </div>
                  </div>
                )}
              </nav>

              {/* Pie del Drawer: Cerrar Sesión y Versión */}
              <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </button>
                <div className="text-center text-[10px] text-slate-500">
                  JustiMobile POS & CRM • v1.2.0
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* BARRA INFERIOR TÁCTIL PARA MÓVILES (sm:hidden) */}
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

          {isAdminOrMaster && (
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

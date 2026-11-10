import React from 'react';
import {
  ActiveScreen,
  TesoreriaTab,
  UserProfile,
} from '../../types/domain.types';
import {
  X,
  Home,
  ShoppingCart,
  Receipt,
  Users,
  Wallet,
  PlusCircle,
  ArrowRightLeft,
  FileText,
  Tag,
  UserCheck,
  ShieldAlert,
  Building2,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';

interface NavigationDrawerProps {
  isOpen: boolean;
  user: UserProfile;
  activeScreen: ActiveScreen;
  isCajaOpen: boolean;
  isDark?: boolean;
  onToggleDarkMode?: () => void;
  onClose: () => void;
  onNavigate: (screen: ActiveScreen, tab?: TesoreriaTab) => void;
  onLogout: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  user,
  activeScreen,
  isCajaOpen,
  isDark = false,
  onToggleDarkMode,
  onClose,
  onNavigate,
  onLogout,
}) => {
  if (!isOpen) return null;

  const isMaster = user.role === 'MASTER';
  const isCrmOnly = user.role === 'CRM';
  const canSell = user.role === 'CASHIER';
  const canOperateCash = user.role === 'CASHIER';
  const isAdmin = user.role === 'ADMIN';

  const handleNavigate = (screen: ActiveScreen, tab?: TesoreriaTab) => {
    onClose();
    onNavigate(screen, tab);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo Oscuro con Desenfoque */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Panel Lateral Drawer */}
      <aside className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-80 max-w-[85vw] bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-r border-[#80AED8] dark:border-slate-800 animate-in slide-in-from-left duration-200">
          {/* Encabezado del Drawer */}
          <div className="bg-gradient-to-r from-[#1B5E91] to-[#3B82F6] dark:from-slate-800 dark:to-slate-900 p-4 text-white">
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
                onClick={onClose}
                className="p-1 rounded-md text-white/90 hover:bg-white/20 hover:text-white transition"
                title="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Perfil del Operador */}
            <div className="rounded bg-white/10 dark:bg-slate-800/80 p-2.5 backdrop-blur-xs border border-white/20 dark:border-slate-700">
              <p className="text-xs font-bold truncate">{user.fullName}</p>
              <p className="text-[11px] text-white/80 dark:text-slate-400 truncate mb-1.5">
                {user.email}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                <span className="rounded bg-white dark:bg-slate-700 px-1.5 py-0.5 font-extrabold text-[#1B5E91] dark:text-blue-300">
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
                      : 'bg-slate-300 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
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
              <span className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                General
              </span>
              <div className="mt-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => handleNavigate('BIENVENIDO')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                    activeScreen === 'BIENVENIDO'
                      ? 'bg-[#DCEAF7] dark:bg-slate-800 text-[#1B5E91] dark:text-blue-400 font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Home className="h-4 w-4 text-[#1B5E91] dark:text-blue-400" />
                  <span>Inicio / Panel Principal</span>
                </button>
              </div>
            </div>

            {isMaster ? (
              <>
                {/* Módulo Gestión de Usuarios */}
                <div>
                  <span className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Gestión de Usuarios
                  </span>
                  <div className="mt-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handleNavigate('USUARIOS')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                        activeScreen === 'USUARIOS'
                          ? 'bg-[#DCEAF7] dark:bg-slate-800 text-[#1B5E91] dark:text-blue-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <UserCheck className="h-4 w-4 text-[#1B5E91] dark:text-blue-400" />
                      <span>Gestión de Usuarios</span>
                    </button>
                  </div>
                </div>

                {/* Módulo Control Master */}
                <div>
                  <span className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Control del Sistema
                  </span>
                  <div className="mt-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handleNavigate('MASTER_CONTROL')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                        activeScreen === 'MASTER_CONTROL'
                          ? 'bg-[#DCEAF7] dark:bg-slate-800 text-[#1B5E91] dark:text-blue-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <span>Control Master (Kill-Switch / API)</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 2. Módulo de Ventas & Cobros */}
                {!isCrmOnly && (
                  <div>
                    <span className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Ventas & Facturación
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {canSell && (
                        <button
                          type="button"
                          onClick={() => handleNavigate('NUEVA_VENTA')}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                            activeScreen === 'NUEVA_VENTA'
                              ? 'bg-[#DCEAF7] dark:bg-slate-800 text-[#1B5E91] dark:text-blue-400 font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <ShoppingCart className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Nueva Venta en POS</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleNavigate('VENTAS_USUARIOS')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                          activeScreen === 'VENTAS_USUARIOS'
                            ? 'bg-[#DCEAF7] dark:bg-slate-800 text-[#1B5E91] dark:text-blue-400 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Receipt className="h-4 w-4 text-[#1B5E91] dark:text-blue-400" />
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
                  <span className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Fidelización & Clientes
                  </span>
                  <div className="mt-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => handleNavigate('CLIENTES')}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                        activeScreen === 'CLIENTES'
                          ? 'bg-[#DCEAF7] dark:bg-slate-800 text-[#1B5E91] dark:text-blue-400 font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>Clientes CRM (Descuentos)</span>
                    </button>
                  </div>
                </div>

                {/* 4. Módulo Tesorería y Cajas */}
                {!isCrmOnly && (
                  <div>
                    <span className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Tesorería & Cajas
                    </span>
                    <div className="mt-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleNavigate('APERTURA_CAJA', 'CAJAS')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                          activeScreen === 'APERTURA_CAJA'
                            ? 'bg-[#DCEAF7] dark:bg-slate-800 text-[#1B5E91] dark:text-blue-400 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Wallet className="h-4 w-4 text-[#1B5E91] dark:text-blue-400" />
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
                              handleNavigate('APERTURA_CAJA', 'ABRIR_CAJA')
                            }
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                          >
                            <PlusCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            <span>Abrir Nueva Caja</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleNavigate('APERTURA_CAJA', 'OPERACION_CAJA')
                            }
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                          >
                            <ArrowRightLeft className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <span>Operación de Caja</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleNavigate('APERTURA_CAJA', 'NUEVO_GASTO')
                            }
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                          >
                            <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span>Nuevo Gasto de Mostrador</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. Módulo Administración */}
                {isAdmin && (
                  <div>
                    <span className="px-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Administración Comercial
                    </span>
                    <div className="mt-1 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => handleNavigate('PRODUCTOS')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                          activeScreen === 'PRODUCTOS'
                            ? 'bg-[#DCEAF7] dark:bg-slate-800 text-[#1B5E91] dark:text-blue-400 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Tag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <span>Catálogo y Precios</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavigate('USUARIOS')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md font-semibold transition ${
                          activeScreen === 'USUARIOS'
                            ? 'bg-[#DCEAF7] dark:bg-slate-800 text-[#1B5E91] dark:text-blue-400 font-bold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <UserCheck className="h-4 w-4 text-[#1B5E91] dark:text-blue-400" />
                        <span>Operadores y Sucursales</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Pie del Drawer: Tema, Cerrar Sesión y Versión */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-2">
            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md font-semibold text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  {isDark ? (
                    <Sun className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-indigo-600" />
                  )}
                  <span>Modo {isDark ? 'Oscuro' : 'Claro'}</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider ${
                    isDark
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {isDark ? 'ACTIVADO' : 'DESACTIVADO'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-md bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 font-bold text-xs border border-red-200 dark:border-red-900 transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </button>
            <div className="text-center text-[10px] text-slate-500 dark:text-slate-400">
              JustiMobile POS & CRM • v1.2.0
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

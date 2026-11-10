import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ActiveScreen,
  CashOperationRecord,
  CashRegisterRecord,
  SaleRecord,
  TesoreriaTab,
  UserProfile,
} from '../../types/domain.types';
import { SalesApi, TreasuryApi } from '../../services/api.service';
import {
  Users,
  Receipt,
  Building2,
  Wallet,
  TrendingUp,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Tag,
} from 'lucide-react';

interface AdminDashboardViewProps {
  token: string;
  user: UserProfile;
  onNavigate: (screen: ActiveScreen, tab?: TesoreriaTab) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  token,
  user,
  onNavigate,
}) => {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [registers, setRegisters] = useState<CashRegisterRecord[]>([]);
  const [operations, setOperations] = useState<CashOperationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [salesRes, regRes, opsRes] = await Promise.all([
        SalesApi.listSales(token, undefined, 200).catch(() => []),
        TreasuryApi.listRegisters(token, '').catch(() => []),
        TreasuryApi.listOperations(token, '').catch(() => []),
      ]);
      setSales(salesRes);
      setRegisters(regRes);
      setOperations(opsRes);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al sincronizar datos del panel administrativo.',
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Métricas del día de hoy
  const metrics = useMemo(() => {
    const todayStr = new Date().toDateString();

    const todaySales = sales.filter((s) => {
      const d = new Date(s.createdAt);
      return d.toDateString() === todayStr && s.status === 'COMPLETED';
    });

    const totalSalesPesos = todaySales.reduce(
      (acc, s) => acc + s.totalCents / 100,
      0,
    );

    const localesSales = todaySales.filter(
      (s) => (s.cashierSnapshot?.branch || 'LOCALES') === 'LOCALES',
    );
    const carrerasSales = todaySales.filter(
      (s) => s.cashierSnapshot?.branch === 'CARRERAS',
    );

    const localesTotalPesos = localesSales.reduce(
      (acc, s) => acc + s.totalCents / 100,
      0,
    );
    const carrerasTotalPesos = carrerasSales.reduce(
      (acc, s) => acc + s.totalCents / 100,
      0,
    );

    const openRegisters = registers.filter((r) => r.status === 'ABIERTA');

    const todayExpenses = operations.filter((op) => {
      return op.type === 'GASTO' || op.type === 'EGRESO_EXTRAORDINARIO';
    });

    const totalExpensesPesos = todayExpenses.reduce(
      (acc, op) => acc + (op.amount || 0),
      0,
    );

    return {
      todaySalesCount: todaySales.length,
      totalSalesPesos,
      localesTotalPesos,
      localesCount: localesSales.length,
      carrerasTotalPesos,
      carrerasCount: carrerasSales.length,
      openRegisters,
      todayExpenses,
      totalExpensesPesos,
    };
  }, [sales, registers, operations]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF] pb-16 sm:pb-4">
      {/* Franja de Título Administrativo */}
      <div className="justi-title-strip flex items-center justify-between px-4 sm:px-6">
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#1B5E91]" />
          Panel de Control y Supervisión Administrativa
        </span>
        <button
          type="button"
          onClick={loadDashboardData}
          className="rounded border border-[#9CC2E5] bg-white/60 p-1.5 text-xs text-[#1B5E91] hover:bg-white"
          title="Actualizar métricas"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <div className="p-3 sm:p-5 space-y-4 max-w-[1440px] w-full mx-auto flex-1">
        {error && <div className="justi-alert-error">{error}</div>}

        {/* 1. KPIs Principales del Día */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded border border-[#80AED8] bg-[#E8F2FC] p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                Facturación Total Hoy
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="mt-1 text-xl font-black text-slate-900">
              ${metrics.totalSalesPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {metrics.todaySalesCount} ventas registradas hoy
            </div>
          </div>

          <div className="rounded border border-[#80AED8] bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#1B5E91]">
                Sucursal LOCALES
              </span>
              <Building2 className="h-4 w-4 text-[#1B5E91]" />
            </div>
            <div className="mt-1 text-xl font-extrabold text-[#1B5E91]">
              ${metrics.localesTotalPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {metrics.localesCount} tickets cobrados
            </div>
          </div>

          <div className="rounded border border-[#80AED8] bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900">
                Sucursal CARRERAS
              </span>
              <Building2 className="h-4 w-4 text-purple-700" />
            </div>
            <div className="mt-1 text-xl font-extrabold text-purple-900">
              ${metrics.carrerasTotalPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {metrics.carrerasCount} tickets cobrados
            </div>
          </div>

          <div className="rounded border border-amber-300 bg-amber-50/70 p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">
                Gastos Declarados Hoy
              </span>
              <Wallet className="h-4 w-4 text-amber-700" />
            </div>
            <div className="mt-1 text-xl font-extrabold text-amber-900">
              ${metrics.totalExpensesPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
            <div className="mt-1 text-[11px] text-amber-700">
              {metrics.todayExpenses.length} egresos reportados en caja
            </div>
          </div>
        </div>

        {/* 2. Accesos Directos Administrativos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => onNavigate('PRODUCTOS')}
            className="flex items-center justify-between rounded border border-[#9CC2E5] bg-gradient-to-r from-[#DCECFB] to-[#C7E0F8] p-3 text-left shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] active:scale-[0.99] transition"
          >
            <div>
              <div className="text-sm font-bold text-[#1B5E91] flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                Catálogo y Precios
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Modificar precios y stock
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#1B5E91]" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('USUARIOS')}
            className="flex items-center justify-between rounded border border-[#9CC2E5] bg-gradient-to-r from-[#DCECFB] to-[#C7E0F8] p-3 text-left shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] active:scale-[0.99] transition"
          >
            <div>
              <div className="text-sm font-bold text-[#1B5E91] flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                Operadores
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Asignar sucursal a Cajeros y CRM
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#1B5E91]" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('VENTAS_USUARIOS')}
            className="flex items-center justify-between rounded border border-[#9CC2E5] bg-gradient-to-r from-[#DCECFB] to-[#C7E0F8] p-3 text-left shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] active:scale-[0.99] transition"
          >
            <div>
              <div className="text-sm font-bold text-[#1B5E91] flex items-center gap-1.5">
                <Receipt className="h-4 w-4" />
                Ventas por Usuario
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Auditar tickets y exportar a Excel
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#1B5E91]" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('CLIENTES')}
            className="flex items-center justify-between rounded border border-[#9CC2E5] bg-gradient-to-r from-[#DCECFB] to-[#C7E0F8] p-3 text-left shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] active:scale-[0.99] transition"
          >
            <div>
              <div className="text-sm font-bold text-[#1B5E91] flex items-center gap-1.5">
                <FileSpreadsheet className="h-4 w-4" />
                Clientes CRM
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Consultar descuentos de 1 uso
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#1B5E91]" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('APERTURA_CAJA')}
            className="flex items-center justify-between rounded border border-[#9CC2E5] bg-gradient-to-r from-[#DCECFB] to-[#C7E0F8] p-3 text-left shadow-sm hover:from-[#CBE3FA] hover:to-[#B4D6F5] active:scale-[0.99] transition"
          >
            <div>
              <div className="text-sm font-bold text-[#1B5E91] flex items-center gap-1.5">
                <Wallet className="h-4 w-4" />
                Auditoría de Cajas
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Historial de turnos y arqueos
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#1B5E91]" />
          </button>
        </div>

        {/* 3. Supervisión de Cajas Activas en Tiempo Real (Solo Lectura) */}
        <div className="border border-[#80AED8] bg-white rounded-sm overflow-hidden shadow-sm">
          <div className="bg-[#4E8EC2] px-3.5 py-2 text-white flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              Cajeros Activos en Turno ({metrics.openRegisters.length})
            </span>
            <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded">
              Auditoría en Tiempo Real
            </span>
          </div>

          <div className="p-3">
            {metrics.openRegisters.length === 0 ? (
              <div className="rounded border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                No hay cajas abiertas en este momento en ninguna sucursal.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {metrics.openRegisters.map((reg) => (
                  <div
                    key={reg.id}
                    className="rounded border border-[#80AED8] bg-[#F5FAFF] p-3 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-slate-500">
                          {reg.boxType}
                        </span>
                        <h4 className="font-extrabold text-[#1B5E91] text-sm">
                          {reg.userFullName}
                        </h4>
                      </div>
                      <span className="rounded bg-[#DCEAF7] border border-[#9CC2E5] px-2 py-0.5 text-[10px] font-bold text-[#1B5E91]">
                        {reg.branch}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between border-t border-slate-200 pt-2">
                      <div>
                        <div className="text-[10px] text-slate-500">
                          Apertura: {reg.openedAt}
                        </div>
                        <div className="text-sm font-extrabold text-emerald-800">
                          Saldo en Caja: ${reg.currentBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <span className="rounded bg-emerald-100 border border-emerald-400 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        ABIERTA
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 4. Control de Gastos y Egresos Reportados por Vendedores */}
        <div className="border border-[#80AED8] bg-white rounded-sm overflow-hidden shadow-sm">
          <div className="bg-[#4E8EC2] px-3.5 py-2 text-white flex items-center justify-between text-xs">
            <span className="font-bold flex items-center gap-1.5">
              <Wallet className="h-4 w-4" />
              Gastos y Egresos Reportados por Vendedores ({metrics.todayExpenses.length})
            </span>
            <button
              type="button"
              onClick={() => onNavigate('APERTURA_CAJA', 'CAJAS')}
              className="text-[11px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition flex items-center gap-1 text-white"
            >
              Auditar Todo el Historial →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs text-left">
              <thead>
                <tr className="bg-[#DCEAF7] text-[#1B5E91] border-b border-[#80AED8]">
                  <th className="py-2 px-3">Fecha / Hora</th>
                  <th className="py-2 px-3">Cajero</th>
                  <th className="py-2 px-3">Sucursal</th>
                  <th className="py-2 px-3">Categoría</th>
                  <th className="py-2 px-3">Detalle / Motivo</th>
                  <th className="py-2 px-3 text-right">Importe $</th>
                </tr>
              </thead>
              <tbody>
                {metrics.todayExpenses.length === 0 ? (
                  <tr className="bg-[#E5E5F7]">
                    <td
                      colSpan={6}
                      className="py-4 px-3 text-center text-slate-500"
                    >
                      No se han registrado egresos ni gastos de caja el día de hoy.
                    </td>
                  </tr>
                ) : (
                  metrics.todayExpenses.slice(0, 10).map((op, idx) => (
                    <tr
                      key={op.id}
                      className={`border-b border-slate-200 ${
                        idx % 2 === 0
                          ? 'justi-table-row-even'
                          : 'justi-table-row-odd'
                      }`}
                    >
                      <td className="py-2 px-3 whitespace-nowrap text-slate-600">
                        {op.createdAt}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-900">
                        {op.userFullName || 'Cajero'}
                      </td>
                      <td className="py-2 px-3">
                        <span className="rounded bg-[#DCEAF7] border border-[#9CC2E5] px-1.5 py-0.5 text-[10px] font-bold text-[#1B5E91]">
                          {op.branch || 'LOCALES'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-700">
                        {op.category || 'Gastos Varios'}
                      </td>
                      <td className="py-2 px-3 max-w-sm truncate text-slate-800">
                        {op.detail}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-red-700">
                        -${op.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer className="mt-8 py-3 text-center text-[10px] font-medium text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 transition-colors">
        JustiMobile 2026
      </footer>
    </div>
  );
};

import React, { useEffect, useState, useCallback } from 'react';
import {
  ActiveScreen,
  BusinessIntelligenceData,
  CashOperationRecord,
  CashRegisterRecord,
  TesoreriaTab,
  UserProfile,
} from '../../types/domain.types';
import { SalesApi, TreasuryApi } from '../../services/api.service';
import { BiKpiCards } from './components/BiKpiCards';
import { BiSalesTrendChart } from './components/BiSalesTrendChart';
import { BiPaymentMixChart } from './components/BiPaymentMixChart';
import { BiTopProductsTable } from './components/BiTopProductsTable';
import { BiBranchBenchmark } from './components/BiBranchBenchmark';
import { BiStaffLeaderboard } from './components/BiStaffLeaderboard';
import {
  LineChart,
  RefreshCw,
  Download,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
  Wallet,
  Tag,
  Users,
  Receipt,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';

interface BiDashboardViewProps {
  token: string;
  user: UserProfile;
  onNavigate: (screen: ActiveScreen, tab?: TesoreriaTab) => void;
}

export const BiDashboardView: React.FC<BiDashboardViewProps> = ({
  token,
  user,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'BI' | 'SUPERVISION'>('BI');
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [branchFilter, setBranchFilter] = useState<'ALL' | 'LOCALES' | 'CARRERAS'>('ALL');
  const [biData, setBiData] = useState<BusinessIntelligenceData | null>(null);
  const [openRegisters, setOpenRegisters] = useState<CashRegisterRecord[]>([]);
  const [operations, setOperations] = useState<CashOperationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [biRes, regRes, opsRes] = await Promise.all([
        SalesApi.getBusinessIntelligence(token, timeRange, branchFilter),
        TreasuryApi.listRegisters(token, '').catch(() => []),
        TreasuryApi.listOperations(token, '').catch(() => []),
      ]);
      setBiData(biRes);
      setOpenRegisters(regRes.filter((r) => r.status === 'ABIERTA'));
      setOperations(opsRes);
      setLastUpdated(new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al sincronizar datos de Inteligencia de Negocios.',
      );
    } finally {
      setLoading(false);
    }
  }, [token, timeRange, branchFilter]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleCloseRegisterAdmin = async (
    registerId: string,
    cashierName: string,
  ) => {
    if (
      !window.confirm(
        `¿Desea realizar el cierre administrativo de la caja de "${cashierName}"?`,
      )
    ) {
      return;
    }
    try {
      await TreasuryApi.closeRegister(token, registerId);
      await loadAllData();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? `Error al cerrar caja: ${err.message}`
          : 'No se pudo cerrar la caja seleccionada.',
      );
    }
  };

  const handleExportCsv = () => {
    if (!biData) return;
    const rows: (string | number)[][] = [
      ['REPORTE EJECUTIVO DE INTELIGENCIA DE NEGOCIOS - ULTRA TECH CARRERAS'],
      ['Fecha y Hora de Generación', new Date().toLocaleString('es-AR')],
      ['Rango Temporal', biData.timeRange],
      ['Sucursal Filtrada', biData.branch],
      [],
      ['1. RESUMEN EJECUTIVO (KPIS)'],
      ['Facturación Neta Total', `$${biData.summary.totalRevenuePesos}`],
      ['Cantidad de Tickets Cerrados', biData.summary.totalTransactions],
      ['Ticket Promedio (AOV)', `$${biData.summary.averageTicketPesos}`],
      ['Total Artículos Vendidos', biData.summary.totalItemsSold],
      ['Total Descuentos Bonificados', `$${biData.summary.totalDiscountsPesos}`],
      ['Total Gastos de Mostrador', `$${biData.summary.totalExpensesPesos}`],
      ['Flujo Operativo Neto', `$${biData.summary.operatingCashFlowPesos}`],
      ['Ratio Pagos Digitales (QR/Tarjetas)', `${biData.summary.digitalPaymentRatio}%`],
      [],
      ['2. MIX DE COBRANZA Y FORMAS DE PAGO'],
      ['Medio / Canal', 'Total Facturado $', 'Cantidad Tickets', '% Participación'],
      ...biData.paymentMix.map((p) => [p.label, p.totalPesos, p.count, `${p.percentage}%`]),
      [],
      ['3. TOP SUPLEMENTOS MAS VENDIDOS'],
      ['SKU', 'Producto', 'Unidades Vendidas', 'Recaudación Total $', '% Facturación'],
      ...biData.topProducts.map((p) => [p.sku, p.name, p.unitsSold, p.totalRevenuePesos, `${p.sharePercentage}%`]),
      [],
      ['4. BENCHMARK COMPARATIVO POR SUCURSAL'],
      ['Sucursal', 'Facturación $', 'Cantidad Tickets', 'Ticket Promedio $', '% Participación'],
      [
        'LOCALES',
        biData.branchBenchmark.locales.totalPesos,
        biData.branchBenchmark.locales.transactions,
        biData.branchBenchmark.locales.averageTicketPesos,
        `${biData.branchBenchmark.locales.sharePercentage}%`,
      ],
      [
        'CARRERAS',
        biData.branchBenchmark.carreras.totalPesos,
        biData.branchBenchmark.carreras.transactions,
        biData.branchBenchmark.carreras.averageTicketPesos,
        `${biData.branchBenchmark.carreras.sharePercentage}%`,
      ],
      [],
      ['5. LEADERBOARD DE VENDEDORES / CAJEROS'],
      ['Vendedor', 'Email', 'Sucursal', 'Tickets', 'Total Facturado $', 'Ticket Promedio $'],
      ...biData.staffLeaderboard.map((s) => [
        s.fullName,
        s.email,
        s.branch,
        s.transactionsCount,
        s.totalSalesPesos,
        s.averageTicketPesos,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `JustiMobile_BI_${biData.timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const todayExpenses = operations.filter(
    (op) => op.type === 'GASTO' || op.type === 'EGRESO_EXTRAORDINARIO',
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF] dark:bg-slate-900 pb-16 sm:pb-6 transition-colors">
      {/* Franja Superior Corporativa */}
      <div className="justi-title-strip flex flex-wrap items-center justify-between gap-2 px-3 sm:px-6 py-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#1B5E91] dark:text-sky-300" />
          <span className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100">
            Inteligencia de Negocios & Supervisión Administrativa
          </span>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-slate-400">
              Sincronizado: {lastUpdated}
            </span>
          )}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!biData || loading}
            className="flex items-center gap-1.5 rounded border border-[#9CC2E5] bg-white/80 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-[#1B5E91] dark:text-sky-300 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition active:scale-95 disabled:opacity-50"
            title="Exportar métricas ejecutivas a archivo CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>
          <button
            type="button"
            onClick={loadAllData}
            disabled={loading}
            className="rounded border border-[#9CC2E5] bg-white/80 dark:bg-slate-800 p-1.5 text-xs text-[#1B5E91] dark:text-sky-300 hover:bg-white dark:hover:bg-slate-700 shadow-sm transition active:scale-95"
            title="Actualizar datos"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-5 space-y-4 max-w-[1440px] w-full mx-auto flex-1">
        {error && <div className="justi-alert-error">{error}</div>}

        {/* Barra de Filtros Interactivos (Rango Temporal + Sucursal + Selector de Pestaña) */}
        <div className="bg-white dark:bg-slate-800 border border-[#9CC2E5] dark:border-slate-700 rounded-sm p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
          {/* Pestañas de Vista */}
          <div className="flex items-center bg-[#EBF4FC] dark:bg-slate-900 rounded p-1 border border-[#B8D7F5] dark:border-slate-700">
            <button
              type="button"
              onClick={() => setActiveTab('BI')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded transition ${
                activeTab === 'BI'
                  ? 'bg-[#1B5E91] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#1B5E91]'
              }`}
            >
              <LineChart className="h-3.5 w-3.5" />
              Inteligencia de Negocios (BI)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SUPERVISION')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded transition ${
                activeTab === 'SUPERVISION'
                  ? 'bg-[#1B5E91] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#1B5E91]'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              Cajas Activas & Egresos ({openRegisters.length})
            </button>
          </div>

          {/* Filtros de Rango Temporal y Sucursal (solo para BI) */}
          {activeTab === 'BI' && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Selector de Rango */}
              <div className="flex items-center gap-1 bg-[#F5FAFF] dark:bg-slate-900 rounded border border-[#CBD5E1] dark:border-slate-700 p-0.5 text-xs">
                <span className="px-1.5 text-slate-500 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                </span>
                <button
                  type="button"
                  onClick={() => setTimeRange('today')}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    timeRange === 'today'
                      ? 'bg-[#1B5E91] text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50'
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('7d')}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    timeRange === '7d'
                      ? 'bg-[#1B5E91] text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50'
                  }`}
                >
                  7 Días
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('30d')}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    timeRange === '30d'
                      ? 'bg-[#1B5E91] text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50'
                  }`}
                >
                  30 Días
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('all')}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    timeRange === 'all'
                      ? 'bg-[#1B5E91] text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50'
                  }`}
                >
                  Histórico
                </button>
              </div>

              {/* Selector de Sucursal */}
              <div className="flex items-center gap-1 bg-[#F5FAFF] dark:bg-slate-900 rounded border border-[#CBD5E1] dark:border-slate-700 p-0.5 text-xs">
                <span className="px-1.5 text-slate-500 flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5" />
                </span>
                <button
                  type="button"
                  onClick={() => setBranchFilter('ALL')}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    branchFilter === 'ALL'
                      ? 'bg-[#1B5E91] text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setBranchFilter('LOCALES')}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    branchFilter === 'LOCALES'
                      ? 'bg-[#1B5E91] text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50'
                  }`}
                >
                  LOCALES
                </button>
                <button
                  type="button"
                  onClick={() => setBranchFilter('CARRERAS')}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    branchFilter === 'CARRERAS'
                      ? 'bg-purple-700 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50'
                  }`}
                >
                  CARRERAS
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CONTENIDO PESTAÑA 1: INTELIGENCIA DE NEGOCIOS (BI) */}
        {activeTab === 'BI' && (
          <>
            {loading && !biData ? (
              <div className="py-20 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="h-6 w-6 animate-spin text-[#1B5E91]" />
                <span>Calculando métricas de Inteligencia de Negocios en tiempo real...</span>
              </div>
            ) : biData ? (
              <div className="space-y-4">
                {/* 1. KPIs Ejecutivos */}
                <BiKpiCards data={biData} />

                {/* 2. Gráfico de Tendencia Diaria */}
                <BiSalesTrendChart data={biData} />

                {/* 3. Grid: Mix de Cobranza & Benchmark de Sucursales */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <BiPaymentMixChart data={biData} />
                  <BiBranchBenchmark data={biData} />
                </div>

                {/* 4. Grid: Top Productos & Leaderboard de Vendedores */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <BiTopProductsTable data={biData} />
                  <BiStaffLeaderboard data={biData} />
                </div>

                {/* 5. Accesos Directos Administrativos */}
                <div className="border border-[#80AED8] dark:border-slate-700 bg-white dark:bg-slate-800 rounded-sm p-3.5 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#1B5E91]" />
                    Acciones de Gestión Directa
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    <button
                      type="button"
                      onClick={() => onNavigate('PRODUCTOS')}
                      className="flex items-center justify-between rounded border border-[#9CC2E5] dark:border-slate-700 bg-[#EBF4FC] dark:bg-slate-900 p-2.5 text-left hover:bg-[#D9ECFB] dark:hover:bg-slate-700 transition"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#1B5E91] dark:text-sky-300 flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5" />
                          Catálogo & Precios
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Modificar precios</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[#1B5E91]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('USUARIOS')}
                      className="flex items-center justify-between rounded border border-[#9CC2E5] dark:border-slate-700 bg-[#EBF4FC] dark:bg-slate-900 p-2.5 text-left hover:bg-[#D9ECFB] dark:hover:bg-slate-700 transition"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#1B5E91] dark:text-sky-300 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          Operadores
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Asignar sucursal</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[#1B5E91]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('VENTAS_USUARIOS')}
                      className="flex items-center justify-between rounded border border-[#9CC2E5] dark:border-slate-700 bg-[#EBF4FC] dark:bg-slate-900 p-2.5 text-left hover:bg-[#D9ECFB] dark:hover:bg-slate-700 transition"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#1B5E91] dark:text-sky-300 flex items-center gap-1">
                          <Receipt className="h-3.5 w-3.5" />
                          Auditoría de Tickets
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Historial de ventas</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[#1B5E91]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('CLIENTES')}
                      className="flex items-center justify-between rounded border border-[#9CC2E5] dark:border-slate-700 bg-[#EBF4FC] dark:bg-slate-900 p-2.5 text-left hover:bg-[#D9ECFB] dark:hover:bg-slate-700 transition"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#1B5E91] dark:text-sky-300 flex items-center gap-1">
                          <FileSpreadsheet className="h-3.5 w-3.5" />
                          Clientes CRM
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Descuentos 1 solo uso</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[#1B5E91]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('APERTURA_CAJA')}
                      className="flex items-center justify-between rounded border border-[#9CC2E5] dark:border-slate-700 bg-[#EBF4FC] dark:bg-slate-900 p-2.5 text-left hover:bg-[#D9ECFB] dark:hover:bg-slate-700 transition"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#1B5E91] dark:text-sky-300 flex items-center gap-1">
                          <Wallet className="h-3.5 w-3.5" />
                          Tesorería
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">Arqueos y turnos</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[#1B5E91]" />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}

        {/* CONTENIDO PESTAÑA 2: SUPERVISIÓN OPERATIVA & CAJAS EN VIVO */}
        {activeTab === 'SUPERVISION' && (
          <div className="space-y-4">
            {/* Cajas Activas en Turno */}
            <div className="border border-[#80AED8] dark:border-slate-700 bg-white dark:bg-slate-800/90 rounded-sm overflow-hidden shadow-sm">
              <div className="bg-[#4E8EC2] px-3.5 py-2 text-white flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Cajeros Activos en Turno ({openRegisters.length})
                </span>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded">
                  Supervisión en Tiempo Real
                </span>
              </div>

              <div className="p-3">
                {openRegisters.length === 0 ? (
                  <div className="rounded border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center text-xs text-slate-500">
                    No hay cajas abiertas en este momento en ninguna sucursal.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {openRegisters.map((reg) => (
                      <div
                        key={reg.id}
                        className="rounded border border-[#80AED8] dark:border-slate-700 bg-[#F5FAFF] dark:bg-slate-900/80 p-3 text-xs"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400">
                              {reg.boxType}
                            </span>
                            <h4 className="font-extrabold text-[#1B5E91] dark:text-sky-300 text-sm">
                              {reg.userFullName}
                            </h4>
                          </div>
                          <span className="rounded bg-[#DCEAF7] dark:bg-slate-800 border border-[#9CC2E5] dark:border-slate-700 px-2 py-0.5 text-[10px] font-bold text-[#1B5E91] dark:text-sky-300">
                            {reg.branch}
                          </span>
                        </div>

                        <div className="mt-2.5 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
                          <div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              Apertura: {reg.openedAt}
                            </div>
                            <div className="text-sm font-extrabold text-emerald-800 dark:text-emerald-400">
                              Saldo: ${reg.currentBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-700 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                              ABIERTA
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCloseRegisterAdmin(reg.id, reg.userFullName)}
                              className="justi-btn-primary text-[10px] py-1 px-2 font-bold"
                              title="Cerrar turno de caja forzadamente"
                            >
                              Cerrar Caja
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Gastos y Egresos Reportados */}
            <div className="border border-[#80AED8] dark:border-slate-700 bg-white dark:bg-slate-800/90 rounded-sm overflow-hidden shadow-sm">
              <div className="bg-[#4E8EC2] px-3.5 py-2 text-white flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5">
                  <Wallet className="h-4 w-4" />
                  Gastos y Egresos de Caja ({todayExpenses.length})
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate('APERTURA_CAJA', 'CAJAS')}
                  className="text-[11px] bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition text-white"
                >
                  Auditar Historial Completo →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-[#DCEAF7] dark:bg-slate-800 text-[#1B5E91] dark:text-sky-300 border-b border-[#80AED8] dark:border-slate-700">
                      <th className="py-2 px-3">Fecha / Hora</th>
                      <th className="py-2 px-3">Cajero</th>
                      <th className="py-2 px-3">Sucursal</th>
                      <th className="py-2 px-3">Categoría</th>
                      <th className="py-2 px-3">Detalle / Justificativo</th>
                      <th className="py-2 px-3 text-right">Importe $</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 px-3 text-center text-slate-500">
                          No se han registrado egresos ni gastos de mostrador.
                        </td>
                      </tr>
                    ) : (
                      todayExpenses.slice(0, 15).map((op, idx) => (
                        <tr
                          key={op.id}
                          className={`border-b border-slate-200 dark:border-slate-700/60 ${
                            idx % 2 === 0
                              ? 'bg-white dark:bg-slate-800/50'
                              : 'bg-[#F8FAFD] dark:bg-slate-900/40'
                          }`}
                        >
                          <td className="py-2 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                            {op.createdAt}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-100">
                            {op.userFullName || 'Cajero'}
                          </td>
                          <td className="py-2 px-3">
                            <span className="rounded bg-[#DCEAF7] border border-[#9CC2E5] px-1.5 py-0.5 text-[10px] font-bold text-[#1B5E91]">
                              {op.branch || 'LOCALES'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                            {op.category || 'Gastos Varios'}
                          </td>
                          <td className="py-2 px-3 max-w-sm truncate text-slate-800 dark:text-slate-200">
                            {op.detail}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-red-700 dark:text-red-400">
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
        )}
      </div>

      <footer className="mt-8 py-3 text-center text-[10px] font-medium text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 transition-colors">
        Copyright ©2026 JustiMobile™ - Todos y cada uno de los derechos reservados
      </footer>
    </div>
  );
};

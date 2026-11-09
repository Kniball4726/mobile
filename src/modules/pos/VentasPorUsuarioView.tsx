import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { SalesApi, UsersApi } from '../../services/api.service';
import { SaleRecord, UserProfile, UserRecord } from '../../types/domain.types';
import {
  FileSpreadsheet,
  RefreshCw,
  Receipt,
  UserCheck,
  Percent,
} from 'lucide-react';

interface VentasPorUsuarioViewProps {
  token: string;
  user: UserProfile;
}

export const VentasPorUsuarioView: React.FC<VentasPorUsuarioViewProps> = ({
  token,
  user,
}) => {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [sellers, setSellers] = useState<UserRecord[]>([]);
  const [selectedCashierId, setSelectedCashierId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isAdminOrMaster = user.role === 'ADMIN' || user.role === 'MASTER';

  // Cargar lista de vendedores (CASHIER) para el selector de filtro del ADMIN / MASTER
  useEffect(() => {
    if (!isAdminOrMaster) return;
    UsersApi.listUsers(token)
      .then((list) => {
        const cashierList = list.filter((u) => u.role === 'CASHIER');
        setSellers(cashierList);
      })
      .catch(() => {
        // ignore
      });
  }, [token, isAdminOrMaster]);

  const loadSales = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await SalesApi.listSales(
        token,
        isAdminOrMaster ? selectedCashierId : undefined,
        100,
      );
      setSales(list);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al consultar el historial de ventas por usuario.',
      );
    } finally {
      setLoading(false);
    }
  }, [token, isAdminOrMaster, selectedCashierId]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const sellerMap = useMemo(() => {
    const map = new Map<string, UserRecord>();
    sellers.forEach((s) => map.set(s._id, s));
    return map;
  }, [sellers]);

  const filteredSales = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sales;
    return sales.filter((s) => {
      const cashierName =
        s.cashierSnapshot?.fullName ||
        sellerMap.get(s.cashierId)?.fullName ||
        '';
      const customerName = s.customerSnapshot?.fullName || 'Consumidor Final';
      return (
        s.receiptNumber.toLowerCase().includes(q) ||
        cashierName.toLowerCase().includes(q) ||
        customerName.toLowerCase().includes(q)
      );
    });
  }, [sales, searchQuery, sellerMap]);

  const summary = useMemo(() => {
    const completed = filteredSales.filter((s) => s.status === 'COMPLETED');
    const totalPesos = completed.reduce(
      (acc, s) => acc + s.totalCents / 100,
      0,
    );
    const totalDiscountPesos = completed.reduce(
      (acc, s) => acc + (s.discountCents || 0) / 100,
      0,
    );
    return {
      count: completed.length,
      totalPesos,
      totalDiscountPesos,
    };
  }, [filteredSales]);

  const handleExportCsv = () => {
    const headers = [
      'Comprobante',
      'Fecha_Hora',
      'Vendedor',
      'Sucursal',
      'Cliente',
      'Articulos',
      'Descuento_CRM_%',
      'Total_Pesos',
      'Estado',
    ];
    const rows = filteredSales.map((s) => {
      const seller =
        s.cashierSnapshot || sellerMap.get(s.cashierId) || null;
      const itemsText = s.items
        .map((i) => `${i.quantity}x ${i.name}`)
        .join(' | ');
      return [
        s.receiptNumber,
        new Date(s.createdAt).toLocaleString('es-AR'),
        `"${(seller?.fullName || user.fullName).replace(/"/g, '""')}"`,
        seller?.branch || user.branch || 'LOCALES',
        `"${(s.customerSnapshot?.fullName || 'Consumidor Final').replace(
          /"/g,
          '""',
        )}"`,
        `"${itemsText.replace(/"/g, '""')}"`,
        s.discountPercentageApplied || 0,
        (s.totalCents / 100).toFixed(2),
        s.status,
      ].join(';');
    });
    const blob = new Blob(['\uFEFF' + [headers.join(';'), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ventas_por_usuario_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF] pb-16 sm:pb-4">
      <div className="justi-title-strip">
        {isAdminOrMaster
          ? 'Ventas por Usuario (Control de Vendedores)'
          : 'Mis Ventas Registradas'}
      </div>

      <div className="p-2.5 sm:p-4 space-y-3 flex-1 max-w-[1440px] w-full mx-auto">
        {error && <div className="justi-alert-error">{error}</div>}

        {/* Barra de Filtros Gris-Beige (#B7B2A3) */}
        <div className="justi-filter-bar flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-sm">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {isAdminOrMaster && (
              <label className="flex flex-col sm:flex-row sm:items-center gap-1 w-full sm:w-auto">
                <span className="font-bold flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" />
                  Filtrar por Vendedor:
                </span>
                <select
                  value={selectedCashierId}
                  onChange={(e) => setSelectedCashierId(e.target.value)}
                  className="rounded border border-slate-400 bg-white px-2 py-1 text-xs font-bold text-[#1B5E91]"
                >
                  <option value="">(Todos los Vendedores)</option>
                  {sellers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} — Sucursal: {s.branch || 'LOCALES'}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <span className="font-semibold">Buscar:</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nº Comprobante, vendedor o cliente..."
                className="w-full sm:w-64 rounded border border-slate-400 bg-white px-2.5 py-1 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={loadSales}
              className="justi-btn-primary py-1.5 px-3"
            >
              <RefreshCw
                className={`mr-1 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
              />
              Actualizar
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="justi-btn-primary py-1.5 px-3 font-bold"
            >
              <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
              Exportar Excel
            </button>
          </div>
        </div>

        {/* Tarjetas Resumen KPI */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center">
          <div className="rounded border border-[#80AED8] bg-[#DCEAF7] p-2.5">
            <div className="text-[11px] font-bold text-slate-600">
              Ventas Completadas
            </div>
            <div className="text-lg font-extrabold text-[#1B5E91]">
              {summary.count}
            </div>
          </div>
          <div className="rounded border border-[#80AED8] bg-[#DCEAF7] p-2.5">
            <div className="text-[11px] font-bold text-slate-600">
              Total Facturado
            </div>
            <div className="text-lg font-extrabold text-emerald-800">
              ${summary.totalPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="rounded border border-[#80AED8] bg-[#DCEAF7] p-2.5">
            <div className="text-[11px] font-bold text-slate-600">
              Descuentos CRM Otorgados
            </div>
            <div className="text-lg font-extrabold text-[#1B5E91]">
              ${summary.totalDiscountPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Vista Móvil (< md): Tarjetas de Ventas */}
        <div className="md:hidden space-y-2">
          {loading ? (
            <div className="p-6 text-center text-xs text-slate-600">
              Consultando ventas en MongoDB Atlas...
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-600 bg-white border border-slate-200 rounded">
              No se encontraron ventas registradas para el filtro seleccionado.
            </div>
          ) : (
            filteredSales.map((sale, idx) => {
              const seller =
                sale.cashierSnapshot || sellerMap.get(sale.cashierId);
              const totalPesos = sale.totalCents / 100;
              return (
                <div
                  key={sale._id}
                  className={`rounded border border-[#80AED8] p-3 text-xs shadow-sm ${
                    idx % 2 === 0 ? 'bg-[#E5E5F7]' : 'bg-[#F4F4FB]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-extrabold text-[#1B5E91]">
                        {sale.receiptNumber}
                      </span>
                      <p className="text-[11px] text-slate-600">
                        {new Date(sale.createdAt).toLocaleString('es-AR')}
                      </p>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-800">
                      ${totalPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 border-t border-slate-300/70 pt-2">
                    <p>
                      <strong className="text-[#1B5E91]">Vendedor:</strong>{' '}
                      {seller?.fullName || user.fullName}{' '}
                      <span className="rounded bg-[#DCEAF7] px-1.5 py-0.5 text-[10px] font-bold text-[#1B5E91]">
                        {seller?.branch || user.branch || 'LOCALES'}
                      </span>
                    </p>
                    <p>
                      <strong>Cliente:</strong>{' '}
                      {sale.customerSnapshot?.fullName || 'Consumidor Final'}
                      {sale.discountPercentageApplied > 0 && (
                        <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                          <Percent className="h-2.5 w-2.5" />
                          {sale.discountPercentageApplied}% CRM
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-700">
                      <strong>Artículos:</strong>{' '}
                      {sale.items
                        .map((i) => `${i.quantity}x ${i.name}`)
                        .join(', ')}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Vista Tabla Desktop (>= md) */}
        <div className="hidden md:block border border-[#80AED8] bg-white overflow-x-auto">
          <div className="bg-[#4E8EC2] px-3 py-1.5 text-white flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-bold">
              <Receipt className="h-4 w-4" />
              Listado de Comprobantes de Venta ({filteredSales.length})
            </span>
          </div>
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="bg-[#DCEAF7] text-[#1B5E91] border-b border-[#80AED8]">
                <th className="py-2 px-2.5">Comprobante</th>
                <th className="py-2 px-2.5">Fecha / Hora</th>
                <th className="py-2 px-2.5">Vendedor</th>
                <th className="py-2 px-2.5">Sucursal</th>
                <th className="py-2 px-2.5">Cliente</th>
                <th className="py-2 px-2.5">Artículos Vendidos</th>
                <th className="py-2 px-2.5 text-center">Dto. CRM</th>
                <th className="py-2 px-2.5 text-right">Total Cobrado</th>
                <th className="py-2 px-2.5 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr className="bg-[#E5E5F7]">
                  <td
                    colSpan={9}
                    className="py-4 px-3 text-center text-slate-500"
                  >
                    No se encontraron ventas registradas.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale, idx) => {
                  const seller =
                    sale.cashierSnapshot || sellerMap.get(sale.cashierId);
                  const totalPesos = sale.totalCents / 100;
                  return (
                    <tr
                      key={sale._id}
                      className={`border-b border-slate-200 ${
                        idx % 2 === 0
                          ? 'justi-table-row-even'
                          : 'justi-table-row-odd'
                      }`}
                    >
                      <td className="py-2 px-2.5 font-mono font-bold text-[#1B5E91]">
                        {sale.receiptNumber}
                      </td>
                      <td className="py-2 px-2.5 whitespace-nowrap">
                        {new Date(sale.createdAt).toLocaleString('es-AR')}
                      </td>
                      <td className="py-2 px-2.5 font-bold text-slate-900">
                        {seller?.fullName || user.fullName}
                      </td>
                      <td className="py-2 px-2.5">
                        <span className="rounded bg-[#DCEAF7] border border-[#9CC2E5] px-2 py-0.5 text-[10px] font-bold text-[#1B5E91]">
                          {seller?.branch || user.branch || 'LOCALES'}
                        </span>
                      </td>
                      <td className="py-2 px-2.5">
                        {sale.customerSnapshot?.fullName || 'Consumidor Final'}
                      </td>
                      <td className="py-2 px-2.5 max-w-xs truncate">
                        {sale.items
                          .map((i) => `${i.quantity}x ${i.name}`)
                          .join(', ')}
                      </td>
                      <td className="py-2 px-2.5 text-center">
                        {sale.discountPercentageApplied > 0 ? (
                          <span className="rounded bg-emerald-100 border border-emerald-400 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            {sale.discountPercentageApplied}%
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                        ${totalPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-2.5 text-center">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            sale.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {sale.status === 'COMPLETED'
                            ? 'COMPLETADA'
                            : 'ANULADA'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

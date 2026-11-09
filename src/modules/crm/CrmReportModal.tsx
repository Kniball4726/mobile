import React, { useMemo, useState } from 'react';
import { FileText, Printer, FileSpreadsheet, X } from 'lucide-react';
import { CustomerItem } from '../../types/domain.types';

interface CrmReportModalProps {
  isOpen: boolean;
  customers: CustomerItem[];
  onClose: () => void;
}

type SortOrder = 'DESC' | 'ASC';

const captureDate = (c: CustomerItem): Date =>
  new Date(c.activeDiscount?.assignedAt || c.createdAt);

const statusLabel = (c: CustomerItem): string => {
  if (c.activeDiscount?.isAvailable && c.activeDiscount.percentage > 0) {
    return 'DISPONIBLE';
  }
  return c.activeDiscount?.consumedInSaleNumber ? 'CONSUMIDO' : 'SIN DESCUENTO';
};

/**
 * Informe de clientes capturados por el rol CRM, ordenado por fecha/hora de carga.
 * Permite filtrar por rango de fechas, imprimir/guardar como PDF y exportar a CSV (Excel).
 */
export const CrmReportModal: React.FC<CrmReportModalProps> = ({
  isOpen,
  customers,
  onClose,
}) => {
  const [order, setOrder] = useState<SortOrder>('DESC');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const rows = useMemo(() => {
    const from = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null;
    return customers
      .filter((c) => {
        const d = captureDate(c);
        return (!from || d >= from) && (!to || d <= to);
      })
      .sort((a, b) => {
        const diff = captureDate(a).getTime() - captureDate(b).getTime();
        return order === 'ASC' ? diff : -diff;
      });
  }, [customers, order, fromDate, toDate]);

  const summary = useMemo(() => {
    const available = rows.filter((c) => statusLabel(c) === 'DISPONIBLE');
    const consumed = rows.filter((c) => statusLabel(c) === 'CONSUMIDO');
    const avg =
      available.length > 0
        ? available.reduce((acc, c) => acc + c.activeDiscount.percentage, 0) /
          available.length
        : 0;
    return {
      total: rows.length,
      available: available.length,
      consumed: consumed.length,
      avg,
    };
  }, [rows]);

  if (!isOpen) return null;

  const handleExportCsv = () => {
    const headers = [
      'Nro',
      'Fecha_Hora_Carga',
      'Cliente',
      'Email',
      'Descuento_%',
      'Estado',
      'Consumido_En',
      'Fecha_Consumo',
    ];
    const lines = rows.map((c, i) =>
      [
        i + 1,
        captureDate(c).toLocaleString('es-AR'),
        `"${c.fullName.replace(/"/g, '""')}"`,
        c.email,
        c.activeDiscount?.percentage ?? 0,
        statusLabel(c),
        c.activeDiscount?.consumedInSaleNumber || '',
        c.activeDiscount?.consumedAt
          ? new Date(c.activeDiscount.consumedAt).toLocaleString('es-AR')
          : '',
      ].join(';'),
    );
    const blob = new Blob(['\uFEFF' + [headers.join(';'), ...lines].join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `informe_clientes_crm_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="crm-report-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4">
      <div className="crm-report-sheet flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded border border-[#4E8EC2] bg-white shadow-2xl">
        <div className="no-print flex items-center justify-between bg-[#4E8EC2] px-4 py-2.5 text-white">
          <span className="flex items-center gap-1.5 text-sm font-bold">
            <FileText className="h-4 w-4" />
            Informe de Clientes CRM
          </span>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-white/20">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Controles */}
        <div className="no-print grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-2 border-b border-[#9CC2E5] bg-[#DCEAF7] p-2.5 text-xs">
          <label className="flex flex-col gap-0.5">
            <span className="font-semibold text-[#1B5E91]">Desde:</span>
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="justi-input" />
          </label>
          <label className="flex flex-col gap-0.5">
            <span className="font-semibold text-[#1B5E91]">Hasta:</span>
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="justi-input" />
          </label>
          <label className="col-span-2 sm:col-span-1 flex flex-col gap-0.5">
            <span className="font-semibold text-[#1B5E91]">Orden por fecha:</span>
            <select value={order} onChange={(e) => setOrder(e.target.value as SortOrder)} className="justi-select">
              <option value="DESC">Más recientes primero</option>
              <option value="ASC">Más antiguos primero</option>
            </select>
          </label>
          <button type="button" onClick={() => window.print()} className="justi-btn-primary py-2 sm:py-1.5 font-bold">
            <Printer className="mr-1 h-3.5 w-3.5" />
            Imprimir / PDF
          </button>
          <button type="button" onClick={handleExportCsv} className="justi-btn-primary py-2 sm:py-1.5 font-bold">
            <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
            Excel (CSV)
          </button>
        </div>

        {/* Contenido imprimible */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 text-xs">
          <div className="mb-3 text-center">
            <h2 className="text-base font-bold text-[#1B5E91]">
              LABORATORIO WEB SUPPLEMENTS — Informe de Clientes CRM
            </h2>
            <p className="text-[11px] text-slate-600">
              Sucursal PASTEUR • Generado: {new Date().toLocaleString('es-AR')} •
              Orden: {order === 'DESC' ? 'más recientes primero' : 'más antiguos primero'}
              {(fromDate || toDate) && ` • Rango: ${fromDate || '…'} a ${toDate || '…'}`}
            </p>
          </div>

          <div className="mb-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            {[
              ['Clientes', summary.total],
              ['Dto. disponible', summary.available],
              ['Dto. consumido', summary.consumed],
              ['% promedio disp.', `${summary.avg.toFixed(1)}%`],
            ].map(([label, value]) => (
              <div key={label} className="rounded border border-[#9CC2E5] bg-[#E8F2FC] p-2">
                <div className="text-[10px] font-semibold text-slate-600">{label}</div>
                <div className="text-base font-extrabold text-[#1B5E91]">{value}</div>
              </div>
            ))}
          </div>

          {rows.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No hay clientes en el rango seleccionado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[11px]">
                <thead>
                  <tr className="bg-[#DCEAF7] text-[#1B5E91] border-b border-[#80AED8]">
                    <th className="p-1.5">#</th>
                    <th className="p-1.5">Fecha / Hora</th>
                    <th className="p-1.5">Cliente</th>
                    <th className="p-1.5">Email</th>
                    <th className="p-1.5 text-center">Dto. %</th>
                    <th className="p-1.5">Estado</th>
                    <th className="p-1.5">Consumido en</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c, i) => (
                    <tr key={c._id} className={i % 2 === 0 ? 'justi-table-row-even' : 'justi-table-row-odd'}>
                      <td className="p-1.5 font-mono">{i + 1}</td>
                      <td className="p-1.5 whitespace-nowrap">{captureDate(c).toLocaleString('es-AR')}</td>
                      <td className="p-1.5 font-semibold">{c.fullName}</td>
                      <td className="p-1.5 break-all">{c.email}</td>
                      <td className="p-1.5 text-center font-bold">{c.activeDiscount?.percentage ?? 0}%</td>
                      <td className="p-1.5 font-bold">{statusLabel(c)}</td>
                      <td className="p-1.5 font-mono">{c.activeDiscount?.consumedInSaleNumber || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

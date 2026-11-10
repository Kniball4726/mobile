import React from 'react';
import {
  CheckCircle2,
  Clock,
  Pencil,
  Percent,
  Search,
  ShoppingCart,
} from 'lucide-react';
import { BranchType, CustomerItem } from '../../../types/domain.types';

interface CustomerListProps {
  customers: CustomerItem[];
  visibleCustomers: CustomerItem[];
  pageSize: number;
  setPageSize: (val: number) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  loading: boolean;
  canSell: boolean;
  userBranch: BranchType;
  onOpenEditDiscount: (cust: CustomerItem) => void;
  onSelectCustomerForSale: (cust: CustomerItem) => void;
}

export const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  visibleCustomers,
  pageSize,
  setPageSize,
  searchQuery,
  setSearchQuery,
  loading,
  canSell,
  userBranch,
  onOpenEditDiscount,
  onSelectCustomerForSale,
}) => {
  return (
    <>
      {/* Barra Azul de Tabla (#4E8EC2) */}
      <div className="bg-[#4E8EC2] px-3 py-2 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs rounded-t-sm">
        <div className="flex items-center justify-between sm:justify-start gap-1.5">
          <span>Ver</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-800"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>registros por página</span>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="shrink-0">Buscar:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nombre o email del cliente..."
            className="w-full sm:w-64 rounded border border-slate-300 bg-white px-2.5 py-1.5 sm:py-1 text-sm sm:text-xs text-slate-900 focus:outline-none"
          />
        </div>
      </div>

      {/* Vista Mobile-First (< md): Tarjetas táctiles */}
      <div className="grid grid-cols-1 gap-2 md:hidden">
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-600">
            Cargando clientes desde MongoDB Atlas...
          </div>
        ) : visibleCustomers.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-600 bg-white border border-slate-200 rounded">
            No se encontraron clientes con ese criterio.
          </div>
        ) : (
          visibleCustomers.map((customer, index) => {
            const hasDiscount =
              customer.activeDiscount?.isAvailable &&
              customer.activeDiscount?.percentage > 0;
            return (
              <div
                key={customer._id}
                className={`rounded border border-[#B8D4EC] p-3 shadow-sm ${
                  index % 2 === 0 ? 'bg-[#E5E5F7]' : 'bg-[#F4F4FB]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-slate-500">
                      Nº Interno #{2575 + index} •{' '}
                      {customer.branch || userBranch}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 truncate">
                      {customer.fullName}
                    </h3>
                    <a
                      href={`mailto:${customer.email}`}
                      className="block text-xs text-blue-700 underline truncate"
                    >
                      {customer.email}
                    </a>
                  </div>

                  <div className="shrink-0 text-right">
                    {hasDiscount ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-100 border border-emerald-400 px-2 py-0.5 text-xs font-bold text-emerald-900">
                        <Percent className="h-3 w-3" />
                        {customer.activeDiscount.percentage}% ACTIVO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                        {customer.activeDiscount?.consumedInSaleNumber
                          ? `Usado (${customer.activeDiscount.consumedInSaleNumber})`
                          : 'Sin descuento'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-600">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    Carga:{' '}
                    {new Date(
                      customer.activeDiscount?.assignedAt ||
                        customer.createdAt,
                    ).toLocaleString('es-AR')}
                  </span>
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-slate-300/80 pt-2">
                  <button
                    type="button"
                    onClick={() => onOpenEditDiscount(customer)}
                    className="justi-btn-primary py-2 text-xs font-bold"
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Editar % CRM
                  </button>
                  {canSell && (
                    <button
                      type="button"
                      onClick={() => onSelectCustomerForSale(customer)}
                      className="justi-btn-primary py-2 text-xs font-bold"
                    >
                      <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                      Facturar en Caja
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Vista Tabla Clásica Desktop/Tablet (>= md) */}
      <div className="hidden md:block overflow-x-auto border border-[#80AED8] bg-white">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-[#DCEAF7] text-[#1B5E91] border-b border-[#80AED8]">
              <th className="py-2 px-2 w-20 text-center">Acciones</th>
              <th className="py-2 px-2">Nº Interno</th>
              <th className="py-2 px-2">Cliente</th>
              <th className="py-2 px-2">Condición IVA</th>
              <th className="py-2 px-2">Email</th>
              <th className="py-2 px-2 text-center">
                Descuento CRM (1 Uso)
              </th>
              <th className="py-2 px-2">Fecha / Hora Carga</th>
              <th className="py-2 px-2">Sucursal</th>
              {canSell && (
                <th className="py-2 px-2 text-center">Enviar a POS</th>
              )}
            </tr>
          </thead>
          <tbody>
            {visibleCustomers.map((customer, index) => {
              const hasDiscount =
                customer.activeDiscount?.isAvailable &&
                customer.activeDiscount?.percentage > 0;
              return (
                <tr
                  key={customer._id}
                  className={`border-b border-slate-200 ${
                    index % 2 === 0
                      ? 'justi-table-row-even'
                      : 'justi-table-row-odd'
                  } hover:bg-[#D3E7F8]`}
                >
                  <td className="py-1.5 px-2">
                    <div className="flex items-center justify-center gap-1">
                      {canSell && (
                        <button
                          type="button"
                          onClick={() => onSelectCustomerForSale(customer)}
                          title="Seleccionar para Nueva Venta"
                          className="rounded border border-[#80AED8] bg-[#E8F2FC] p-1 text-[#1B5E91] hover:bg-[#CBE3FA]"
                        >
                          <Search className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onOpenEditDiscount(customer)}
                        title="Editar % de Descuento CRM"
                        className="rounded border border-[#80AED8] bg-[#E8F2FC] p-1 text-[#1B5E91] hover:bg-[#CBE3FA]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="py-1.5 px-2 font-mono">{2575 + index}</td>
                  <td className="py-1.5 px-2 font-semibold text-slate-900">
                    {customer.fullName}
                  </td>
                  <td className="py-1.5 px-2">CONSUMIDOR FINAL</td>
                  <td className="py-1.5 px-2">
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-blue-700 underline"
                    >
                      {customer.email}
                    </a>
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    {hasDiscount ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-100 border border-emerald-500 px-2 py-0.5 text-[11px] font-bold text-emerald-900">
                        <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                        {customer.activeDiscount.percentage}% Disponible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-slate-200 px-2 py-0.5 text-[11px] text-slate-700">
                        {customer.activeDiscount?.consumedInSaleNumber
                          ? `Usado en ${customer.activeDiscount.consumedInSaleNumber}`
                          : '0% (Inactivo)'}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-[11px] text-slate-700">
                    {new Date(
                      customer.activeDiscount?.assignedAt ||
                        customer.createdAt,
                    ).toLocaleString('es-AR')}
                  </td>
                  <td className="py-1.5 px-2 font-semibold">
                    {customer.branch || userBranch}
                  </td>
                  {canSell && (
                    <td className="py-1.5 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => onSelectCustomerForSale(customer)}
                        className="justi-btn-primary py-0.5 px-2 text-[11px]"
                      >
                        Facturar en Caja
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Barra Inferior de Paginación Azul (#4E8EC2) */}
      <div className="bg-[#4E8EC2] px-3 py-2 text-white flex flex-wrap items-center justify-between gap-2 text-xs rounded-b-sm">
        <span>
          1 a {visibleCustomers.length} de {customers.length} registros
        </span>
        <div className="flex items-center gap-1">
          <span className="rounded bg-white/20 px-2 py-0.5 text-[11px]">
            Anterior
          </span>
          <span className="rounded bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#1B5E91]">
            1
          </span>
          <span className="rounded bg-white/20 px-2 py-0.5 text-[11px]">
            Siguiente
          </span>
        </div>
      </div>
    </>
  );
};

import React, { useEffect, useState, useCallback } from 'react';
import { CrmApi } from '../../services/api.service';
import { BranchType, CustomerItem } from '../../types/domain.types';
import {
  Search,
  Pencil,
  UserPlus,
  FileSpreadsheet,
  ShoppingCart,
  Percent,
  CheckCircle2,
  Clock,
  X,
  FileText,
} from 'lucide-react';
import { CrmReportModal } from './CrmReportModal';
import { JustiFooter } from '../../components/JustiFooter';

interface ClientesViewProps {
  token: string;
  canSell?: boolean;
  userBranch?: BranchType;
  isBranchLocked?: boolean;
  onSelectCustomerForSale: (customer: CustomerItem) => void;
}

export const ClientesView: React.FC<ClientesViewProps> = ({
  token,
  canSell = true,
  userBranch = 'LOCALES',
  isBranchLocked = true,
  onSelectCustomerForSale,
}) => {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchType>(userBranch);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyWithDiscount, setOnlyWithDiscount] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerItem | null>(
    null,
  );
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDiscount, setFormDiscount] = useState('15');
  const [saving, setSaving] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await CrmApi.searchCustomers(
        token,
        searchQuery,
        onlyWithDiscount,
      );
      setCustomers(list);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al consultar clientes CRM',
      );
    } finally {
      setLoading(false);
    }
  }, [token, searchQuery, onlyWithDiscount]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const openNewCustomerModal = () => {
    setEditingCustomer(null);
    setFormFullName('');
    setFormEmail('');
    setFormDiscount('15');
    setIsModalOpen(true);
  };

  const openEditDiscountModal = (customer: CustomerItem) => {
    setEditingCustomer(customer);
    setFormFullName(customer.fullName);
    setFormEmail(customer.email);
    setFormDiscount(String(customer.activeDiscount?.percentage ?? 0));
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const parsedDiscount = Math.min(
      100,
      Math.max(0, Number(formDiscount) || 0),
    );

    try {
      if (editingCustomer) {
        await CrmApi.assignDiscount(
          token,
          editingCustomer._id,
          parsedDiscount,
        );
        setSuccessMsg(
          `Descuento de un solo uso (${parsedDiscount}%) actualizado para ${editingCustomer.fullName}.`,
        );
      } else {
        await CrmApi.registerOrUpdateCustomer(token, {
          fullName: formFullName.trim(),
          email: formEmail.trim().toLowerCase(),
          discountPercentage: parsedDiscount,
        });
        setSuccessMsg(
          `Cliente "${formFullName.trim()}" registrado con ${parsedDiscount}% de descuento activo.`,
        );
      }
      setIsModalOpen(false);
      await loadCustomers();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'No se pudo guardar el cliente.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Nro_Interno',
      'Cliente',
      'Email',
      'Descuento_CRM_%',
      'Estado_Descuento',
      'Fecha_Hora_Asignacion',
      'Sucursal',
    ];
    const rows = customers.map((c, idx) => [
      2500 + idx,
      `"${c.fullName.replace(/"/g, '""')}"`,
      c.email,
      c.activeDiscount?.percentage ?? 0,
      c.activeDiscount?.isAvailable ? 'DISPONIBLE' : 'CONSUMIDO',
      c.activeDiscount?.assignedAt || c.createdAt,
      c.branch || userBranch,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'clientes_crm_justi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const visibleCustomers = customers.slice(0, pageSize);

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF] pb-16 sm:pb-4">
      <div className="justi-title-strip">Clientes</div>

      <div className="p-2 sm:p-4 space-y-2.5 flex-1 max-w-[1440px] w-full mx-auto">
        {error && <div className="justi-alert-error">{error}</div>}
        {successMsg && <div className="justi-alert-success">{successMsg}</div>}

        {/* Barra de Filtros Gris-Beige (#B7B2A3) 100% Responsive */}
        <div className="justi-filter-bar flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-sm">
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 text-[11px]">
            <label className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
              <span>Tipo de Cliente:</span>
              <select className="rounded border border-slate-400 bg-white px-1.5 py-1 sm:py-0.5 text-xs sm:text-[11px] text-slate-800">
                <option>(todos)</option>
                <option>Consumidor Final</option>
                <option>Canje / Fidelizado</option>
              </select>
            </label>

            <label className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
              <span>Por Estado:</span>
              <select className="rounded border border-slate-400 bg-white px-1.5 py-1 sm:py-0.5 text-xs sm:text-[11px] text-slate-800">
                <option>Activos</option>
                <option>Todos</option>
              </select>
            </label>

            <label className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1">
              <span>Sucursal:</span>
              <select
                value={isBranchLocked ? userBranch : selectedBranch}
                disabled={isBranchLocked}
                onChange={(e) => setSelectedBranch(e.target.value as BranchType)}
                title={
                  isBranchLocked
                    ? 'Sucursal asignada por el Administrador (bloqueada)'
                    : 'Filtrar sucursal'
                }
                className="rounded border border-slate-400 bg-white px-1.5 py-1 sm:py-0.5 text-xs sm:text-[11px] font-bold text-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed"
              >
                <option value="LOCALES">LOCALES</option>
                <option value="CARRERAS">CARRERAS</option>
              </select>
            </label>

            <label className="col-span-2 sm:col-span-1 flex items-center gap-1.5 cursor-pointer bg-white/20 px-2.5 py-1.5 sm:py-0.5 rounded">
              <input
                type="checkbox"
                checked={onlyWithDiscount}
                onChange={(e) => setOnlyWithDiscount(e.target.checked)}
                className="rounded"
              />
              <span className="font-semibold">Solo con Descuento Activo</span>
            </label>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="col-span-2 sm:col-span-1 justi-btn-primary py-2 sm:py-1 font-bold"
            >
              <FileText className="mr-1 h-3.5 w-3.5" />
              Generar Informe
            </button>
            <button
              type="button"
              onClick={openNewCustomerModal}
              className="justi-btn-primary py-2 sm:py-1 font-bold"
            >
              <UserPlus className="mr-1 h-3.5 w-3.5" />
              Agregar Cliente
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="justi-btn-primary py-2 sm:py-1"
            >
              <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
              Exportar Excel
            </button>
          </div>
        </div>

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
                      onClick={() => openEditDiscountModal(customer)}
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
                          onClick={() => openEditDiscountModal(customer)}
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

        <JustiFooter className="mt-8" />
      </div>

      <CrmReportModal
        isOpen={isReportOpen}
        customers={customers}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Modal CRM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
          <div className="w-full max-w-md overflow-hidden rounded border border-[#4E8EC2] bg-[#E8F2FC] shadow-2xl">
            <div className="flex items-center justify-between bg-[#4E8EC2] px-4 py-2.5 text-white">
              <span className="text-sm font-bold">
                {editingCustomer
                  ? 'Actualizar Descuento CRM (1 Uso)'
                  : 'Agregar Cliente CRM con Descuento'}
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded p-1 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                  Nombres y Apellidos del Cliente *:
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingCustomer)}
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  placeholder="Ej: Alejandro Briozzo"
                  className="justi-input w-full disabled:bg-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                  Correo Electrónico (Email) *:
                </label>
                <input
                  type="email"
                  required
                  disabled={Boolean(editingCustomer)}
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="cliente@dominio.com"
                  className="justi-input w-full disabled:bg-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                  Sucursal Asignada:
                </label>
                <select
                  value={isBranchLocked ? userBranch : selectedBranch}
                  disabled={isBranchLocked}
                  onChange={(e) =>
                    setSelectedBranch(e.target.value as BranchType)
                  }
                  className="justi-select w-full font-bold disabled:bg-slate-200 disabled:text-slate-700 disabled:cursor-not-allowed"
                >
                  <option value="LOCALES">LOCALES</option>
                  <option value="CARRERAS">CARRERAS</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                  Descuento habilitado de un solo uso (0% a 100%) *:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    required
                    value={formDiscount}
                    onChange={(e) => setFormDiscount(e.target.value)}
                    className="justi-input w-28 font-bold text-emerald-800"
                  />
                  <span className="text-xs text-slate-600">
                    % (Se consumirá al cobrar en Caja)
                  </span>
                </div>
              </div>

              <div className="rounded border border-[#9CC2E5] bg-[#DCEAF7] p-2 text-[11px] text-[#1B5E91]">
                <strong>Fecha y Hora Automática:</strong> El servidor registrará
                automáticamente el instante exacto de asignación en MongoDB
                Atlas.
              </div>

              <div className="justi-bottom-action-box grid grid-cols-2 gap-2 mt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="justi-btn-primary py-2 font-bold"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="justi-btn-primary py-2"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useCallback, useEffect, useState } from 'react';
import { JustiFooter } from '../../components/JustiFooter';
import { CrmApi } from '../../services/api.service';
import { BranchType, CustomerItem } from '../../types/domain.types';
import { CustomerFilterBar } from './components/CustomerFilterBar';
import { CustomerList } from './components/CustomerList';
import { CustomerModal } from './components/CustomerModal';
import { CrmReportModal } from './CrmReportModal';

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

        {/* Barra de Filtros */}
        <CustomerFilterBar
          userBranch={userBranch}
          selectedBranch={selectedBranch}
          setSelectedBranch={setSelectedBranch}
          isBranchLocked={isBranchLocked}
          onlyWithDiscount={onlyWithDiscount}
          setOnlyWithDiscount={setOnlyWithDiscount}
          onOpenReport={() => setIsReportOpen(true)}
          onNewCustomer={openNewCustomerModal}
          onExportCsv={handleExportCsv}
        />

        {/* Listado de Clientes (Móvil y Escritorio) */}
        <CustomerList
          customers={customers}
          visibleCustomers={visibleCustomers}
          pageSize={pageSize}
          setPageSize={setPageSize}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          loading={loading}
          canSell={canSell}
          userBranch={userBranch}
          onOpenEditDiscount={openEditDiscountModal}
          onSelectCustomerForSale={onSelectCustomerForSale}
        />

        <JustiFooter className="mt-8" />
      </div>

      <CrmReportModal
        isOpen={isReportOpen}
        customers={customers}
        onClose={() => setIsReportOpen(false)}
      />

      {/* Modal Creación / Edición Descuento CRM */}
      <CustomerModal
        isOpen={isModalOpen}
        editingCustomer={editingCustomer}
        formFullName={formFullName}
        setFormFullName={setFormFullName}
        formEmail={formEmail}
        setFormEmail={setFormEmail}
        formDiscount={formDiscount}
        setFormDiscount={setFormDiscount}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        userBranch={userBranch}
        isBranchLocked={isBranchLocked}
        saving={saving}
        onSave={handleSaveCustomer}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

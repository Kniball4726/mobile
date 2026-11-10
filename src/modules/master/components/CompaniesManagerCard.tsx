import React, { useEffect, useState, useCallback } from 'react';
import {
  Building2,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  FileText,
  PauseCircle,
  PlayCircle,
  X,
} from 'lucide-react';
import { MasterApi } from '../../../services/api';
import { CompanyRecord } from '../../../types/domain.types';

interface CompaniesManagerCardProps {
  token: string;
}

export const CompaniesManagerCard: React.FC<CompaniesManagerCardProps> = ({
  token,
}) => {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal / Formulario Nueva Empresa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [cuit, setCuit] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('/justi-logo.svg');

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MasterApi.listCompanies(token);
      setCompanies(data || []);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar el listado de empresas.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleToggleStatus = async (company: CompanyRecord) => {
    try {
      const updated = await MasterApi.toggleCompanyStatus(token, company._id);
      setCompanies((prev) =>
        prev.map((c) => (c._id === updated._id ? updated : c)),
      );
      setSuccess(
        `Estado de "${company.name}" actualizado a ${
          updated.status === 'ACTIVE' ? 'ACTIVA' : 'SUSPENDIDA'
        }`,
      );
      setTimeout(() => setSuccess(null), 3500);
    } catch (err: any) {
      setError(err?.message || 'Error al cambiar estado de la empresa.');
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const newCompany = await MasterApi.createCompany(token, {
        name: name.trim(),
        legalName: legalName.trim(),
        cuit: cuit.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        branding: {
          logoUrl: logoUrl.trim() || '/justi-logo.svg',
        },
      });

      setCompanies((prev) => [newCompany, ...prev]);
      setSuccess(`¡Empresa "${newCompany.name}" registrada con éxito!`);
      setIsModalOpen(false);

      // Limpiar campos
      setName('');
      setLegalName('');
      setCuit('');
      setEmail('');
      setPhone('');
      setAddress('');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(err?.message || 'Error al crear la nueva empresa.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 p-5 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-blue-600 dark:text-sky-400" />
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Gestión de Empresas (Multi-Tenant)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Administra múltiples perfiles de empresas, sus CUITs y marcas independientes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchCompanies}
            disabled={loading}
            className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
            title="Refrescar lista"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow transition"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Empresa</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg flex items-center gap-2 text-xs sm:text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700 rounded-lg flex items-center gap-2 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading && companies.length === 0 ? (
        <div className="py-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <p className="text-xs">Cargando empresas registradas...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="py-8 text-center text-slate-500 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
          <Building2 className="h-8 w-8 mx-auto mb-2 text-slate-400 opacity-60" />
          <p className="text-sm font-semibold">No hay empresas registradas aún.</p>
          <p className="text-xs text-slate-400 mt-1">
            Crea la primera empresa con el botón «Nueva Empresa».
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((company) => (
            <div
              key={company._id}
              className={`p-4 rounded-xl border transition-all ${
                company.status === 'ACTIVE'
                  ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 shadow-sm'
                  : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-1 shrink-0 shadow-sm">
                    <img
                      src={company.branding?.logoUrl || '/justi-logo.svg'}
                      alt={company.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {company.name}
                      </h3>
                      {company.isDefault && (
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-extrabold px-1.5 py-0.5 rounded">
                          PREDETERMINADA
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {company.legalName}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    company.status === 'ACTIVE'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                      : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-300'
                  }`}
                >
                  {company.status === 'ACTIVE' ? 'ACTIVA' : 'SUSPENDIDA'}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-500">CUIT:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {company.cuitFormatted || company.cuit}
                  </span>
                </div>

                {company.email && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">Email:</span>
                    <span className="truncate max-w-[200px]">{company.email}</span>
                  </div>
                )}
              </div>

              {/* Badges de integraciones independientes */}
              <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  <FileText className="h-3 w-3 text-blue-500" />
                  AFIP {company.afipEnabled ? 'OK' : 'Pendiente'}
                </span>

                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  <CreditCard className="h-3 w-3 text-sky-500" />
                  Mercado Pago {company.mercadoPagoEnabled ? 'OK' : 'Pendiente'}
                </span>

                {!company.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(company)}
                    className="ml-auto text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 transition"
                    title={
                      company.status === 'ACTIVE'
                        ? 'Suspender empresa'
                        : 'Activar empresa'
                    }
                  >
                    {company.status === 'ACTIVE' ? (
                      <>
                        <PauseCircle className="h-3.5 w-3.5 text-amber-500" />
                        <span>Pausar</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Activar</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Formulario Nueva Empresa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                  Registrar Nueva Empresa (Tenant)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de Fantasía / Comercial *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ej. Sucursal Centro"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Razón Social Legal *
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  required
                  placeholder="Ej. Nutrición y Deportes S.R.L."
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  CUIT de la Empresa (11 dígitos) *
                </label>
                <input
                  type="text"
                  value={cuit}
                  onChange={(e) => setCuit(e.target.value)}
                  required
                  placeholder="Ej. 30-71234567-1"
                  className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Validado automáticamente con el algoritmo oficial de AFIP (Módulo 11).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@empresa.com"
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+54 11 ..."
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dirección Comercial
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Av. Santa Fe 2345, CABA"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ruta o URL del Logotipo
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="/justi-logo.svg o URL web"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={creating}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow transition disabled:opacity-50"
                >
                  {creating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Crear Empresa</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

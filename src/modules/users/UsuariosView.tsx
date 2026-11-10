import React, { useEffect, useState, useCallback } from 'react';
import { UsersApi, MasterApi } from '../../services/api.service';
import { BranchType, CompanyRecord, UserRecord, UserRole } from '../../types/domain.types';
import { Building2, UserPlus, RefreshCw, Lock, Filter } from 'lucide-react';
import { JustiFooter } from '../../components/JustiFooter';

interface UsuariosViewProps {
  token: string;
  currentUserRole?: UserRole;
}

export const UsuariosView: React.FC<UsuariosViewProps> = ({
  token,
  currentUserRole = 'ADMIN',
}) => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulario nuevo usuario
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Exclude<UserRole, 'MASTER'>>('CASHIER');
  const [branch, setBranch] = useState<BranchType>('LOCALES');
  const [saving, setSaving] = useState(false);

  // Multi-Tenant / Empresas
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('');

  const loadCompanies = useCallback(async () => {
    if (currentUserRole !== 'MASTER') return;
    try {
      const list = await MasterApi.listCompanies(token);
      setCompanies(list || []);
      const def = list.find((c) => c.isDefault) || list[0];
      if (def) setSelectedCompanyId(def._id);
    } catch {}
  }, [token, currentUserRole]);

  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await UsersApi.listUsers(
        token,
        currentUserRole === 'MASTER' && companyFilter ? companyFilter : undefined,
      );
      setUsers(
        currentUserRole === 'MASTER'
          ? list
          : list.filter((u) => u.role === 'CRM' || u.role === 'CASHIER'),
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al consultar operadores y sucursales.',
      );
    } finally {
      setLoading(false);
    }
  }, [token, currentUserRole, companyFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await UsersApi.createUser(token, {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        branch,
        companyId: currentUserRole === 'MASTER' ? selectedCompanyId || null : undefined,
      });
      setSuccess(
        `Operador "${fullName.trim()}" (${role}) creado con sucursal asignada "${branch}".`,
      );
      setFullName('');
      setEmail('');
      setPassword('');
      await loadUsers();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'No se pudo crear el usuario.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleBranchChange = async (
    userId: string,
    userName: string,
    newBranch: BranchType,
  ) => {
    setError(null);
    setSuccess(null);
    try {
      await UsersApi.assignBranch(token, userId, newBranch);
      setSuccess(
        `Sucursal de "${userName}" actualizada a "${newBranch}". El campo quedará fijo en su sesión.`,
      );
      await loadUsers();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la sucursal del usuario.',
      );
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF] pb-16 sm:pb-0">
      <div className="justi-title-strip">
        Operadores y Asignación de Sucursal (LOCALES / CARRERAS)
      </div>

      <div className="p-3 sm:p-4 space-y-4 flex-1 max-w-[1440px] w-full mx-auto">
        {error && <div className="justi-alert-error">{error}</div>}
        {success && <div className="justi-alert-success">{success}</div>}

        {/* Formulario de Alta de Usuario con Asignación de Sucursal */}
        <div className="border border-[#80AED8] bg-[#E8F2FC]">
          <div className="justi-section-header flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <UserPlus className="h-4 w-4" />
              {currentUserRole === 'MASTER'
                ? 'Crear Operador (Vendedor / CRM / Admin) y Asignar Sucursal'
                : 'Crear Operador (Vendedor / CRM) y Asignar Sucursal'}
            </span>
            <button
              type="button"
              onClick={loadUsers}
              className="rounded bg-white/20 p-1 hover:bg-white/30"
              title="Actualizar lista"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
              />
            </button>
          </div>

          <form
            onSubmit={handleCreateUser}
            className={`p-3 grid grid-cols-1 sm:grid-cols-2 ${
              currentUserRole === 'MASTER' ? 'lg:grid-cols-7' : 'lg:grid-cols-6'
            } gap-2.5 items-end text-xs`}
          >
            <div>
              <label className="block font-bold text-[#1B5E91] mb-1">
                Nombre Completo *:
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Martín Vendedor"
                className="justi-input w-full"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B5E91] mb-1">
                Email *:
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendedor@justimobile.com"
                className="justi-input w-full"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B5E91] mb-1">
                Clave de Acceso *:
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="justi-input w-full"
              />
            </div>

            <div>
              <label className="block font-bold text-[#1B5E91] mb-1">
                Rol del Operador *:
              </label>
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as Exclude<UserRole, 'MASTER'>)
                }
                className="justi-select w-full font-bold"
              >
                <option value="CASHIER">CASHIER (Vendedor POS)</option>
                <option value="CRM">CRM (Carga Clientes)</option>
                {currentUserRole === 'MASTER' && (
                  <option value="ADMIN">ADMIN (Administrador)</option>
                )}
              </select>
            </div>

            {currentUserRole === 'MASTER' && (
              <div>
                <label className="block font-bold text-[#1B5E91] mb-1">
                  Empresa Asignada *:
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  required
                  className="justi-select w-full font-bold bg-amber-50 border-amber-300 text-amber-900"
                >
                  <option value="">-- Seleccionar --</option>
                  {companies
                    .filter((c) => c.status === 'ACTIVE')
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} {c.isDefault ? '(Default)' : ''}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-bold text-[#1B5E91] mb-1">
                Sucursal Asignada *:
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value as BranchType)}
                className="justi-select w-full font-bold text-[#1B5E91]"
              >
                <option value="LOCALES">LOCALES</option>
                <option value="CARRERAS">CARRERAS</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                disabled={saving}
                className="justi-btn-primary w-full py-1.5 font-bold"
              >
                {saving ? 'Creando...' : 'Guardar Operador'}
              </button>
            </div>
          </form>
        </div>

        {/* Filtro Multi-Empresa para MASTER */}
        {currentUserRole === 'MASTER' && companies.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white border border-[#80AED8] rounded text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#1B5E91]" />
              <span className="font-bold text-slate-800">
                Filtrar Operadores por Empresa (Tenant):
              </span>
            </div>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="justi-select py-1 px-3 text-xs font-bold w-full sm:w-auto text-[#1B5E91]"
            >
              <option value="">Todas las Empresas ({companies.length})</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.isDefault ? '(Predeterminada)' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tabla de Operadores y Cambio Rápido de Sucursal Asignada */}
        <div className="border border-[#80AED8] bg-white overflow-x-auto">
          <div className="justi-section-header flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4" />
              Operadores Registrados (Asignación de Sucursal y Empresa)
            </span>
            <span className="text-[11px] font-normal flex items-center gap-1">
              <Lock className="h-3 w-3" />
              La sucursal elegida aquí queda bloqueada para el Vendedor y el CRM
            </span>
          </div>

          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="bg-[#DCEAF7] text-[#1B5E91] border-b border-[#80AED8]">
                <th className="py-2 px-3">Operador</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Empresa (Tenant)</th>
                <th className="py-2 px-3">Rol</th>
                <th className="py-2 px-3">Sucursal Asignada (Enum)</th>
                <th className="py-2 px-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr
                  key={u._id}
                  className={`border-b border-slate-200 ${
                    idx % 2 === 0
                      ? 'justi-table-row-even'
                      : 'justi-table-row-odd'
                  }`}
                >
                  <td className="py-2 px-3 font-bold text-slate-900">
                    {u.fullName}
                  </td>
                  <td className="py-2 px-3 font-mono text-[11px]">{u.email}</td>
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-300 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                      <Building2 className="h-3 w-3 text-amber-600 shrink-0" />
                      {u.companyName || 'UltraTech Carreras'}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="rounded bg-[#DCEAF7] border border-[#9CC2E5] px-2 py-0.5 text-[11px] font-bold text-[#1B5E91]">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={u.branch || 'LOCALES'}
                      onChange={(e) =>
                        handleBranchChange(
                          u._id,
                          u.fullName,
                          e.target.value as BranchType,
                        )
                      }
                      className="justi-select font-bold text-[#1B5E91] w-36"
                    >
                      <option value="LOCALES">LOCALES</option>
                      <option value="CARRERAS">CARRERAS</option>
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <span className="rounded bg-emerald-100 border border-emerald-400 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      ACTIVO
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <JustiFooter className="mt-8" />
      </div>
    </div>
  );
};

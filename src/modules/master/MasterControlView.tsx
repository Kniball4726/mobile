import React, { useEffect, useState, useCallback } from 'react';
import { MasterApi } from '../../services/api.service';
import { JustiFooter } from '../../components/JustiFooter';
import {
  ApiKeyRecord,
  AuditLogRecord,
  GlobalSystemSettings,
  MaskedMercadoPagoSettings,
} from '../../types/domain.types';
import {
  Key,
  ShieldAlert,
  Settings,
  ScrollText,
  Copy,
  Check,
  RefreshCw,
  CreditCard,
  QrCode,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';

interface MasterControlViewProps {
  token: string;
}

export const MasterControlView: React.FC<MasterControlViewProps> = ({
  token,
}) => {
  const [settings, setSettings] = useState<GlobalSystemSettings | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Formulario nueva API Key
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'crm:write',
    'catalog:read',
  ]);
  const [createdPlaintextKey, setCreatedPlaintextKey] = useState<string | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  // Formulario Settings
  const [maxDiscountInput, setMaxDiscountInput] = useState<number>(100);
  const [posPaused, setPosPaused] = useState<boolean>(false);
  const [crmPaused, setCrmPaused] = useState<boolean>(false);

  // Formulario Mercado Pago (Exclusivo MASTER)
  const [mpSettings, setMpSettings] =
    useState<MaskedMercadoPagoSettings | null>(null);
  const [mpEnabled, setMpEnabled] = useState(false);
  const [mpSandbox, setMpSandbox] = useState(true);
  const [mpPublicKey, setMpPublicKey] = useState('');
  const [mpAccessToken, setMpAccessToken] = useState('');
  const [mpWebhookSecret, setMpWebhookSecret] = useState('');
  const [mpPosId, setMpPosId] = useState('');
  const [mpUserId, setMpUserId] = useState('');
  const [showMpToken, setShowMpToken] = useState(false);
  const [testingMp, setTestingMp] = useState(false);
  const [mpTestResult, setMpTestResult] = useState<{
    success: boolean;
    message: string;
    nickname?: string;
  } | null>(null);
  const [savingMp, setSavingMp] = useState(false);

  const loadMasterData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cfg, keys, logs, mpCfg] = await Promise.all([
        MasterApi.getSettings(token),
        MasterApi.listApiKeys(token),
        MasterApi.listAuditLogs(token),
        MasterApi.getMercadoPagoSettings(token).catch((err: unknown) => {
          console.warn(
            'Endpoint de Mercado Pago no disponible en el servidor actual:',
            err,
          );
          return null;
        }),
      ]);
      setSettings(cfg);
      setMaxDiscountInput(cfg.maxCrmDiscountPercentage);
      setPosPaused(Boolean(cfg.maintenanceMode?.posPaused));
      setCrmPaused(Boolean(cfg.maintenanceMode?.crmPaused));
      setApiKeys(keys);
      setAuditLogs(logs);

      // Cargar configuración de Mercado Pago (si está desplegada en el servidor)
      if (mpCfg) {
        setMpSettings(mpCfg);
        setMpEnabled(Boolean(mpCfg.isEnabled));
        setMpSandbox(mpCfg.isSandbox ?? true);
        setMpPublicKey(mpCfg.publicKey || '');
        setMpAccessToken(mpCfg.accessTokenMasked || '');
        setMpWebhookSecret(mpCfg.hasWebhookSecret ? '••••••••••••••••' : '');
        setMpPosId(mpCfg.posId || '');
        setMpUserId(mpCfg.userId || '');
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cargar panel de Control Master.',
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const updated = await MasterApi.updateSettings(token, {
        maxCrmDiscountPercentage: Number(maxDiscountInput),
        maintenanceMode: {
          posPaused,
          crmPaused,
          reason:
            posPaused || crmPaused
              ? 'Pausa preventiva activada por Master'
              : null,
        },
      });
      setSettings(updated);
      setSuccess('Configuración global actualizada en MongoDB Atlas.');
      await loadMasterData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'No se pudo actualizar settings.',
      );
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await MasterApi.createApiKey(token, {
        name: newKeyName.trim(),
        scopes: selectedScopes,
        expiresInDays: 90,
      });
      setCreatedPlaintextKey(res.apiKey || null);
      setNewKeyName('');
      setSuccess(
        `API Key "${res.name}" generada con éxito. Copie el token ahora.`,
      );
      await loadMasterData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al generar API Key.',
      );
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await MasterApi.revokeApiKey(token, id);
      setSuccess('API Key revocada inmediatamente.');
      await loadMasterData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al revocar API Key.',
      );
    }
  };

  const handleKillSwitch = async () => {
    setError(null);
    setSuccess(null);
    try {
      const res = await MasterApi.revokeAllSessions(token);
      setSuccess(
        `Kill-Switch ejecutado: ${res.revokedUsersCount} sesiones activas fueron revocadas.`,
      );
      await loadMasterData();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al ejecutar Kill-Switch.',
      );
    }
  };

  const handleSaveMercadoPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSavingMp(true);
    try {
      const updated = await MasterApi.updateMercadoPagoSettings(token, {
        isEnabled: mpEnabled,
        isSandbox: mpSandbox,
        publicKey: mpPublicKey.trim() || null,
        accessToken: mpAccessToken.trim() || null,
        webhookSecret: mpWebhookSecret.trim() || null,
        posId: mpPosId.trim() || null,
        userId: mpUserId.trim() || null,
      });
      setMpSettings(updated);
      setMpAccessToken(updated.accessTokenMasked || '');
      setSuccess(
        'Configuración de Mercado Pago actualizada exitosamente en MongoDB con política Zero-Knowledge.',
      );
      await loadMasterData();
    } catch (err: unknown) {
      const rawMsg =
        err instanceof Error
          ? err.message
          : 'Error al actualizar credenciales de Mercado Pago.';
      setError(
        rawMsg.includes('Cannot') || rawMsg.includes('404')
          ? 'El endpoint de integración de Mercado Pago aún no está desplegado en el servidor actual de Render.'
          : rawMsg,
      );
    } finally {
      setSavingMp(false);
    }
  };

  const handleTestMpConnection = async () => {
    setError(null);
    setSuccess(null);
    setMpTestResult(null);
    setTestingMp(true);
    try {
      const res = await MasterApi.testMercadoPagoConnection(
        token,
        mpAccessToken && !mpAccessToken.includes('****')
          ? mpAccessToken
          : undefined,
      );
      setMpTestResult({
        success: true,
        message: res.message,
        nickname: res.nickname,
      });
      setSuccess(res.message);
    } catch (err: unknown) {
      const rawMsg =
        err instanceof Error ? err.message : 'Fallo en la prueba de conexión';
      const msg =
        rawMsg.includes('Cannot') || rawMsg.includes('404')
          ? 'El endpoint de prueba de Mercado Pago aún no está desplegado en el servidor actual de Render.'
          : rawMsg;
      setMpTestResult({ success: false, message: msg });
      setError(msg);
    } finally {
      setTestingMp(false);
    }
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF]">
      <div className="justi-title-strip">
        Control Master &amp; Integraciones Externas
      </div>

      <div className="p-3 sm:p-4 space-y-4 flex-1 max-w-[1440px] w-full mx-auto">
        {error && <div className="justi-alert-error">{error}</div>}
        {success && <div className="justi-alert-success">{success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 1. Configuración Global & Kill-Switch */}
          <div className="border border-[#80AED8] bg-[#E8F2FC]">
            <div className="justi-section-header flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Settings className="h-4 w-4" />
                Parámetros Globales (system_settings)
              </span>
              <button
                type="button"
                onClick={loadMasterData}
                className="rounded bg-white/20 p-1 hover:bg-white/30"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
                />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-3 space-y-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <label className="font-bold text-[#1B5E91]">
                  Tope Máximo Descuento CRM (%):
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={maxDiscountInput}
                  onChange={(e) => setMaxDiscountInput(Number(e.target.value))}
                  className="justi-input w-24 text-right font-bold"
                />
              </div>

              <div className="flex flex-wrap gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={posPaused}
                    onChange={(e) => setPosPaused(e.target.checked)}
                  />
                  Pausar Facturación POS
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={crmPaused}
                    onChange={(e) => setCrmPaused(e.target.checked)}
                  />
                  Pausar Carga CRM
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#B8D4EC]">
                <button type="submit" className="justi-btn-primary">
                  Guardar Parámetros
                </button>

                <button
                  type="button"
                  onClick={handleKillSwitch}
                  className="inline-flex items-center gap-1 rounded border border-red-600 bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Kill-Switch (Cerrar Sesiones)
                </button>
              </div>
            </form>
          </div>

          {/* 2. Generador de API Keys Externas (X-API-Key) */}
          <div className="border border-[#80AED8] bg-[#E8F2FC]">
            <div className="justi-section-header flex items-center gap-1.5">
              <Key className="h-4 w-4" />
              <span>Llaves de Integración Externa (X-API-Key)</span>
            </div>

            <form onSubmit={handleCreateKey} className="p-3 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#1B5E91] mb-1">
                  Nombre del Sistema Externo (ERP / E-Commerce / Bot):
                </label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Ej: ERP Central / Tienda Nube"
                  className="justi-input w-full"
                />
              </div>

              <div>
                <span className="block font-bold text-[#1B5E91] mb-1">
                  Permisos (Scopes):
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'crm:read',
                    'crm:write',
                    'catalog:read',
                    'catalog:write',
                    'sales:read',
                    'sales:write',
                  ].map((scope) => (
                    <label
                      key={scope}
                      className="inline-flex items-center gap-1 rounded border border-[#9CC2E5] bg-white px-2 py-0.5 text-[11px] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope)}
                        onChange={() => toggleScope(scope)}
                      />
                      <span className="font-mono">{scope}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="justi-btn-primary">
                Generar Nueva API Key
              </button>

              {createdPlaintextKey && (
                <div className="rounded border border-emerald-500 bg-emerald-50 p-2.5 text-xs">
                  <p className="font-bold text-emerald-900 mb-1">
                    Copie su X-API-Key ahora (solo se muestra una vez):
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 overflow-x-auto rounded bg-white p-1.5 font-mono text-[11px] border border-emerald-300">
                      {createdPlaintextKey}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(createdPlaintextKey);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="justi-btn-primary"
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-700" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* 3. Integración Mercado Pago (Exclusivo Superusuario MASTER) */}
        <div className="border border-[#009EE3] dark:border-sky-700 bg-white dark:bg-slate-900 shadow-sm transition-colors">
          <div className="bg-[#009EE3] text-white px-3 py-2 flex items-center justify-between font-bold text-xs">
            <span className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              <span>Pasarela Mercado Pago (QR Dinámico &amp; APIs de Cobro)</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                mpEnabled
                  ? mpSandbox
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-emerald-400 text-slate-900'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              {mpEnabled
                ? mpSandbox
                  ? 'MODO SANDBOX (PRUEBAS)'
                  : 'PRODUCCIÓN ACTIVA'
                : 'DESHABILITADO'}
            </span>
          </div>

          <form
            onSubmit={handleSaveMercadoPago}
            className="p-3 sm:p-4 space-y-4 text-xs"
          >
            <div className="p-2.5 rounded border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/40 text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
              <strong>Administración Exclusiva del Rol MASTER:</strong> Configure
              las credenciales de su cuenta de Mercado Pago Developers. El Punto
              de Venta generará automáticamente órdenes con QR interoperable y
              verificará pagos en tiempo real. Los tokens de acceso se almacenan
              enmascarados bajo estricta política Zero-Knowledge.
            </div>

            {mpTestResult && (
              <div
                className={`p-2.5 rounded text-xs flex items-center gap-2 ${
                  mpTestResult.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-400 text-emerald-900 dark:text-emerald-200 font-semibold'
                    : 'bg-red-50 dark:bg-red-950/50 border border-red-400 text-red-900 dark:text-red-200'
                }`}
              >
                <Check
                  className={`h-4 w-4 ${
                    mpTestResult.success ? 'text-emerald-600' : 'text-red-600'
                  }`}
                />
                <span>{mpTestResult.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Switches de Habilitación */}
              <div className="flex items-center gap-2 p-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <input
                  type="checkbox"
                  id="mpEnabledCheck"
                  checked={mpEnabled}
                  onChange={(e) => setMpEnabled(e.target.checked)}
                  className="h-4 w-4 rounded text-[#009EE3] focus:ring-[#009EE3]"
                />
                <label
                  htmlFor="mpEnabledCheck"
                  className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Habilitar Mercado Pago en Punto de Venta (POS)
                </label>
              </div>

              <div className="flex items-center gap-2 p-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                <input
                  type="checkbox"
                  id="mpSandboxCheck"
                  checked={mpSandbox}
                  onChange={(e) => setMpSandbox(e.target.checked)}
                  className="h-4 w-4 rounded text-[#009EE3] focus:ring-[#009EE3]"
                />
                <label
                  htmlFor="mpSandboxCheck"
                  className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  Modo Sandbox (Credenciales TEST-... para pruebas)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Access Token */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Access Token (Producción o Test):
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showMpToken ? 'text' : 'password'}
                    value={mpAccessToken}
                    onChange={(e) => setMpAccessToken(e.target.value)}
                    placeholder="APP_USR-xxxx o TEST-xxxx"
                    className="justi-input w-full font-mono text-xs pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMpToken(!showMpToken)}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showMpToken ? 'Ocultar token' : 'Mostrar token'}
                  >
                    {showMpToken ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {mpSettings?.hasAccessToken
                    ? '✓ Token configurado en el servidor (enmascarado con Zero-Knowledge).'
                    : 'Sin token cargado.'}
                </p>
              </div>

              {/* Public Key */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Public Key (Clave Pública):
                </label>
                <input
                  type="text"
                  value={mpPublicKey}
                  onChange={(e) => setMpPublicKey(e.target.value)}
                  placeholder="APP_USR-xxxx o TEST-xxxx"
                  className="justi-input w-full font-mono text-xs"
                />
              </div>

              {/* Webhook Secret */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Webhook Secret (Firma HMAC x-signature):
                </label>
                <input
                  type="password"
                  value={mpWebhookSecret}
                  onChange={(e) => setMpWebhookSecret(e.target.value)}
                  placeholder="Opcional para validación de firma"
                  className="justi-input w-full font-mono text-xs"
                />
              </div>

              {/* POS ID / External Store ID */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  POS ID / Identificador de Caja:
                </label>
                <input
                  type="text"
                  value={mpPosId}
                  onChange={(e) => setMpPosId(e.target.value)}
                  placeholder="Ej. SUC_LOCALES_POS1 (Opcional)"
                  className="justi-input w-full text-xs"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                disabled={testingMp || !mpAccessToken}
                onClick={handleTestMpConnection}
                className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${testingMp ? 'animate-spin' : ''}`}
                />
                <span>
                  {testingMp
                    ? 'Verificando con MP...'
                    : 'Probar Conexión con Mercado Pago'}
                </span>
              </button>

              <button
                type="submit"
                disabled={savingMp}
                className="justi-btn-primary px-4 py-1.5 text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>
                  {savingMp
                    ? 'Guardando...'
                    : 'Guardar Credenciales Mercado Pago'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Lista de API Keys Emitidas */}
        <div className="border border-[#80AED8] bg-white overflow-x-auto">
          <div className="justi-section-header">API Keys Registradas</div>
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="bg-[#DCEAF7] text-[#1B5E91] border-b border-[#80AED8]">
                <th className="py-1.5 px-2">Nombre</th>
                <th className="py-1.5 px-2">Prefijo</th>
                <th className="py-1.5 px-2">Scopes</th>
                <th className="py-1.5 px-2">Estado</th>
                <th className="py-1.5 px-2 text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((k, idx) => {
                const keyId = k._id || k.id || String(idx);
                return (
                  <tr
                    key={keyId}
                    className={`border-b border-slate-200 ${
                      idx % 2 === 0
                        ? 'justi-table-row-even'
                        : 'justi-table-row-odd'
                    }`}
                  >
                    <td className="py-1.5 px-2 font-bold">{k.name}</td>
                    <td className="py-1.5 px-2 font-mono">{k.keyPrefix}...</td>
                    <td className="py-1.5 px-2 font-mono text-[11px]">
                      {k.scopes.join(', ')}
                    </td>
                    <td className="py-1.5 px-2">
                      {k.isActive !== false ? (
                        <span className="font-bold text-emerald-700">
                          ACTIVA
                        </span>
                      ) : (
                        <span className="font-bold text-red-700">REVOCADA</span>
                      )}
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      {k.isActive !== false && (
                        <button
                          type="button"
                          onClick={() => handleRevokeKey(keyId)}
                          className="justi-btn-primary text-[11px] py-0.5 px-2"
                        >
                          Revocar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bitácora de Auditoría Inmutable (audit_logs) */}
        <div className="border border-[#80AED8] bg-white overflow-x-auto">
          <div className="justi-section-header flex items-center gap-1.5">
            <ScrollText className="h-4 w-4" />
            <span>Bitácora de Auditoría Inmutable (audit_logs)</span>
          </div>
          <table className="w-full border-collapse text-xs text-left">
            <thead>
              <tr className="bg-[#DCEAF7] text-[#1B5E91] border-b border-[#80AED8]">
                <th className="py-1.5 px-2">Fecha / Hora</th>
                <th className="py-1.5 px-2">Acción</th>
                <th className="py-1.5 px-2">Actor</th>
                <th className="py-1.5 px-2">Colección</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 12).map((log, idx) => (
                <tr
                  key={log._id}
                  className={`border-b border-slate-200 ${
                    idx % 2 === 0
                      ? 'justi-table-row-even'
                      : 'justi-table-row-odd'
                  }`}
                >
                  <td className="py-1.5 px-2 font-mono text-[11px]">
                    {new Date(log.createdAt).toLocaleString('es-AR')}
                  </td>
                  <td className="py-1.5 px-2 font-bold text-[#1B5E91]">
                    {log.action}
                  </td>
                  <td className="py-1.5 px-2">{log.actorIdentifier}</td>
                  <td className="py-1.5 px-2 font-mono">
                    {log.targetCollection || '-'}
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

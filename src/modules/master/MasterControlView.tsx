import React, { useEffect, useState, useCallback } from 'react';
import { MasterApi } from '../../services/api.service';
import { JustiFooter } from '../../components/JustiFooter';
import {
  ApiKeyRecord,
  AuditLogRecord,
  CompanyRecord,
  GlobalSystemSettings,
  MaskedAfipSettings,
  MaskedMercadoPagoSettings,
  MasterTab,
  TestAfipConnectionResult,
} from '../../types/domain.types';
import { Building2, Layers, ShieldAlert, FileText } from 'lucide-react';
import { CompaniesTab } from './components/CompaniesTab';
import { IntegrationsTab } from './components/IntegrationsTab';
import { SecurityTab } from './components/SecurityTab';
import { AuditTab } from './components/AuditTab';
import { parseApiError } from '../../utils/error-handler';

interface MasterControlViewProps {
  token: string;
  activeTab?: MasterTab;
  onChangeTab?: (tab: MasterTab) => void;
}

export const MasterControlView: React.FC<MasterControlViewProps> = ({
  token,
  activeTab,
  onChangeTab,
}) => {
  const [internalTab, setInternalTab] = useState<MasterTab>('EMPRESAS');
  const currentTab = activeTab ?? internalTab;
  const handleTabChange = (tab: MasterTab) => {
    if (onChangeTab) {
      onChangeTab(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const [, setSettings] = useState<GlobalSystemSettings | null>(null);
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
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
  const [createdPlaintextKey, setCreatedPlaintextKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Formulario Settings
  const [maxDiscountInput, setMaxDiscountInput] = useState<number>(100);
  const [posPaused, setPosPaused] = useState<boolean>(false);
  const [crmPaused, setCrmPaused] = useState<boolean>(false);

  // Formulario Mercado Pago (Exclusivo MASTER)
  const [mpSettings, setMpSettings] = useState<MaskedMercadoPagoSettings | null>(null);
  const [mpEnabled, setMpEnabled] = useState(false);
  const [mpSandbox, setMpSandbox] = useState(true);
  const [mpPublicKey, setMpPublicKey] = useState('');
  const [mpAccessToken, setMpAccessToken] = useState('');
  const [mpWebhookSecret, setMpWebhookSecret] = useState('');
  const [mpPosId, setMpPosId] = useState('');
  const [showMpToken, setShowMpToken] = useState(false);
  const [testingMp, setTestingMp] = useState(false);
  const [mpTestResult, setMpTestResult] = useState<{
    success: boolean;
    message: string;
    nickname?: string;
  } | null>(null);
  const [savingMp, setSavingMp] = useState(false);

  // Formulario Facturación Electrónica AFIP / ARCA (Exclusivo MASTER)
  const [afipSettings, setAfipSettings] = useState<MaskedAfipSettings | null>(null);
  const [afipEnabled, setAfipEnabled] = useState(false);
  const [afipProduction, setAfipProduction] = useState(false);
  const [afipCuit, setAfipCuit] = useState('');
  const [afipPuntoVenta, setAfipPuntoVenta] = useState<number>(1);
  const [afipCert, setAfipCert] = useState('');
  const [afipPrivateKey, setAfipPrivateKey] = useState('');
  const [afipDefaultConcepto, setAfipDefaultConcepto] = useState<number>(1);
  const [afipDefaultCbteTipo, setAfipDefaultCbteTipo] = useState<number>(6);
  const [showAfipKey, setShowAfipKey] = useState(false);
  const [testingAfip, setTestingAfip] = useState(false);
  const [afipTestResult, setAfipTestResult] = useState<TestAfipConnectionResult | null>(null);
  const [savingAfip, setSavingAfip] = useState(false);

  const applyMpSettings = useCallback(
    (mpCfg: MaskedMercadoPagoSettings | null) => {
      if (mpCfg) {
        setMpSettings(mpCfg);
        setMpEnabled(Boolean(mpCfg.isEnabled));
        setMpSandbox(mpCfg.isSandbox ?? true);
        setMpPublicKey(mpCfg.publicKey || '');
        setMpAccessToken(mpCfg.accessTokenMasked || '');
        setMpWebhookSecret(mpCfg.hasWebhookSecret ? '••••••••••••••••' : '');
        setMpPosId(mpCfg.posId || '');
      } else {
        setMpSettings(null);
        setMpEnabled(false);
        setMpSandbox(true);
        setMpPublicKey('');
        setMpAccessToken('');
        setMpWebhookSecret('');
        setMpPosId('');
      }
    },
    [],
  );

  const applyAfipSettings = useCallback(
    (afipCfg: MaskedAfipSettings | null, companyCuitDefault?: string | null) => {
      if (afipCfg) {
        setAfipSettings(afipCfg);
        setAfipEnabled(Boolean(afipCfg.isEnabled));
        setAfipProduction(Boolean(afipCfg.isProduction));
        setAfipCuit(afipCfg.cuit || companyCuitDefault || '');
        setAfipPuntoVenta(afipCfg.puntoVenta ?? 1);
        setAfipCert(
          afipCfg.hasCert
            ? afipCfg.certPreview || 'Certificado X.509 configurado en servidor'
            : '',
        );
        setAfipPrivateKey(afipCfg.hasPrivateKey ? '••••••••••••••••' : '');
        setAfipDefaultConcepto(afipCfg.defaultConcepto ?? 1);
        setAfipDefaultCbteTipo(afipCfg.defaultCbteTipo ?? 6);
      } else {
        setAfipSettings(null);
        setAfipEnabled(false);
        setAfipProduction(false);
        setAfipCuit(companyCuitDefault || '');
        setAfipPuntoVenta(1);
        setAfipCert('');
        setAfipPrivateKey('');
        setAfipDefaultConcepto(1);
        setAfipDefaultCbteTipo(6);
      }
    },
    [],
  );

  const loadMasterData = useCallback(
    async (targetCompanyId?: string) => {
      setLoading(true);
      setError(null);
      try {
        const [cfg, keys, logs, companiesList] = await Promise.all([
          MasterApi.getSettings(token),
          MasterApi.listApiKeys(token),
          MasterApi.listAuditLogs(token),
          MasterApi.listCompanies(token).catch(() => []),
        ]);
        setSettings(cfg);
        setMaxDiscountInput(cfg.maxCrmDiscountPercentage);
        setPosPaused(Boolean(cfg.maintenanceMode?.posPaused));
        setCrmPaused(Boolean(cfg.maintenanceMode?.crmPaused));
        setApiKeys(keys);
        setAuditLogs(logs);

        if (companiesList && companiesList.length > 0) {
          setCompanies(companiesList);
        }

        const activeCompId =
          targetCompanyId ||
          selectedCompanyId ||
          companiesList.find((c: CompanyRecord) => c.isDefault)?._id ||
          companiesList[0]?._id ||
          '';

        if (!selectedCompanyId && activeCompId) {
          setSelectedCompanyId(activeCompId);
        }

        const activeCompany = companiesList.find(
          (c: CompanyRecord) => c._id === activeCompId,
        );

        const [mpCfg, afipCfg] = await Promise.all([
          MasterApi.getMercadoPagoSettings(
            token,
            activeCompId || undefined,
          ).catch((err: unknown) => {
            console.warn('Endpoint de Mercado Pago error:', err);
            return null;
          }),
          MasterApi.getAfipSettings(
            token,
            activeCompId || undefined,
          ).catch((err: unknown) => {
            console.warn('Endpoint de AFIP error:', err);
            return null;
          }),
        ]);

        applyMpSettings(mpCfg);
        applyAfipSettings(afipCfg, activeCompany?.cuit);
      } catch (err: unknown) {
        setError(parseApiError(err, 'Error al cargar panel de Control Master.').message);
      } finally {
        setLoading(false);
      }
    },
    [token, selectedCompanyId, applyMpSettings, applyAfipSettings],
  );

  const handleSelectCompanyForIntegrations = async (companyId: string) => {
    setSelectedCompanyId(companyId);
    setLoading(true);
    setError(null);
    setSuccess(null);
    setMpTestResult(null);
    setAfipTestResult(null);
    try {
      const company = companies.find((c) => c._id === companyId);
      const [mpCfg, afipCfg] = await Promise.all([
        MasterApi.getMercadoPagoSettings(token, companyId),
        MasterApi.getAfipSettings(token, companyId),
      ]);
      applyMpSettings(mpCfg);
      applyAfipSettings(afipCfg, company?.cuit);
    } catch (err: unknown) {
      setError(parseApiError(err, 'Error al cargar integraciones de la empresa seleccionada.').message);
    } finally {
      setLoading(false);
    }
  };

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
          reason: posPaused || crmPaused ? 'Mantenimiento Preventivo' : null,
        },
      });
      setSettings(updated);
      setSuccess('Parámetros del sistema actualizados correctamente.');
    } catch (err: unknown) {
      setError(parseApiError(err, 'Error al guardar parámetros.').message);
    }
  };

  const handleKillSwitch = async () => {
    if (
      !window.confirm(
        '¿CONFIRMA CIERRE FORZOSO DE TODAS LAS SESIONES MÓVILES EN LA EMPRESA?',
      )
    ) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      const res = await MasterApi.revokeAllSessions(token);
      setSuccess(
        `Kill-Switch ejecutado: ${res.revokedUsersCount} sesiones revocadas.`,
      );
      await loadMasterData();
    } catch (err: unknown) {
      setError(parseApiError(err, 'Error al ejecutar Kill-Switch.').message);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await MasterApi.createApiKey(token, {
        name: newKeyName.trim(),
        scopes: selectedScopes,
      });
      if (res.apiKey) {
        setCreatedPlaintextKey(res.apiKey);
        setSuccess(
          'API Key creada. Copie la clave inmediatamente, no volverá a mostrarse.',
        );
      }
      setNewKeyName('');
      await loadMasterData();
    } catch (err: unknown) {
      setError(parseApiError(err, 'Error al generar clave API.').message);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!window.confirm('¿Revocar inmediatamente el acceso de esta API Key?')) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await MasterApi.revokeApiKey(token, id);
      setSuccess('Clave API revocada exitosamente.');
      await loadMasterData();
    } catch (err: unknown) {
      setError(parseApiError(err, 'Error al revocar clave API.').message);
    }
  };

  const handleSaveMp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSavingMp(true);
    try {
      const cleanToken =
        mpAccessToken.trim() && !mpAccessToken.includes('****')
          ? mpAccessToken.trim()
          : undefined;
      const cleanSecret =
        mpWebhookSecret.trim() && !mpWebhookSecret.includes('••••')
          ? mpWebhookSecret.trim()
          : undefined;

      const updated = await MasterApi.updateMercadoPagoSettings(
        token,
        {
          isEnabled: mpEnabled,
          isSandbox: mpSandbox,
          publicKey: mpPublicKey.trim() || null,
          accessToken: cleanToken,
          webhookSecret: cleanSecret,
          posId: mpPosId.trim() || null,
        },
        selectedCompanyId || undefined,
      );

      setMpSettings(updated);
      setSuccess(
        'Configuración de Mercado Pago actualizada exitosamente para la empresa seleccionada bajo política Zero-Knowledge.',
      );
    } catch (err: unknown) {
      setError(parseApiError(err, 'Error al actualizar credenciales de Mercado Pago.').message);
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
        selectedCompanyId || undefined,
      );
      setMpTestResult({
        success: true,
        message: res.message,
        nickname: res.nickname,
      });
      setSuccess(res.message);
    } catch (err: unknown) {
      const msg = parseApiError(err, 'Fallo en la prueba de conexión con Mercado Pago.').message;
      setMpTestResult({ success: false, message: msg });
      setError(msg);
    } finally {
      setTestingMp(false);
    }
  };

  const handleSaveAfip = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSavingAfip(true);
    try {
      const cleanCert =
        afipCert.trim() &&
        !afipCert.includes('configurado en servidor') &&
        !afipCert.includes('X.509')
          ? afipCert.trim()
          : undefined;

      const cleanKey =
        afipPrivateKey.trim() && !afipPrivateKey.includes('••••')
          ? afipPrivateKey.trim()
          : undefined;

      const updated = await MasterApi.updateAfipSettings(
        token,
        {
          isEnabled: afipEnabled,
          isProduction: afipProduction,
          cuit: afipCuit.trim() || null,
          puntoVenta: Number(afipPuntoVenta) || 1,
          cert: cleanCert,
          privateKey: cleanKey,
          defaultConcepto: Number(afipDefaultConcepto) || 1,
          defaultCbteTipo: Number(afipDefaultCbteTipo) || 6,
        },
        selectedCompanyId || undefined,
      );

      setAfipSettings(updated);
      setSuccess(
        'Configuración de Facturación AFIP / ARCA actualizada exitosamente para la empresa seleccionada bajo política Zero-Knowledge.',
      );
    } catch (err: unknown) {
      setError(parseApiError(err, 'Error al actualizar configuración de AFIP.').message);
    } finally {
      setSavingAfip(false);
    }
  };

  const handleTestAfipConnection = async () => {
    setError(null);
    setSuccess(null);
    setAfipTestResult(null);
    setTestingAfip(true);
    try {
      const res = await MasterApi.testAfipConnection(
        token,
        {
          cuitOverride: afipCuit.trim() || undefined,
          isProductionOverride: afipProduction,
        },
        selectedCompanyId || undefined,
      );
      setAfipTestResult(res);
      if (res.success) {
        setSuccess(res.message);
      } else {
        setError(res.message);
      }
    } catch (err: unknown) {
      const msg = parseApiError(err, 'Fallo en la prueba de conexión con AFIP.').message;
      setAfipTestResult({
        success: false,
        message: msg,
        environment: afipProduction ? 'Producción' : 'Homologación (Testing)',
        cuit: afipCuit.trim() || null,
      });
      setError(msg);
    } finally {
      setTestingAfip(false);
    }
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF] dark:bg-slate-900 pb-16 sm:pb-4 transition-colors">
      <div className="justi-title-strip">
        Control Master &amp; Integraciones Externas
      </div>

      {/* Barra de Pestañas / Sub-navegación por Funciones */}
      <div className="bg-[#DCEAF7] dark:bg-slate-800 border-b border-[#9CC2E5] dark:border-slate-700 p-2 sm:px-4 sm:py-2">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleTabChange('EMPRESAS')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded font-bold transition shadow-xs ${
              currentTab === 'EMPRESAS'
                ? 'bg-[#1B5E91] text-white ring-2 ring-[#1B5E91] dark:ring-sky-400 font-extrabold'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-[#EBF4FC] dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600'
            }`}
          >
            <Building2 className="h-4 w-4 text-blue-500 dark:text-sky-300" />
            <span>Empresas &amp; Marca</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('INTEGRACIONES')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded font-bold transition shadow-xs ${
              currentTab === 'INTEGRACIONES'
                ? 'bg-[#1B5E91] text-white ring-2 ring-[#1B5E91] dark:ring-sky-400 font-extrabold'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-[#EBF4FC] dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600'
            }`}
          >
            <Layers className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            <span>Integraciones (MP / AFIP)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('SEGURIDAD')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded font-bold transition shadow-xs ${
              currentTab === 'SEGURIDAD'
                ? 'bg-[#1B5E91] text-white ring-2 ring-[#1B5E91] dark:ring-sky-400 font-extrabold'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-[#EBF4FC] dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600'
            }`}
          >
            <ShieldAlert className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            <span>Seguridad &amp; APIs</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('AUDITORIA')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded font-bold transition shadow-xs ${
              currentTab === 'AUDITORIA'
                ? 'bg-[#1B5E91] text-white ring-2 ring-[#1B5E91] dark:ring-sky-400 font-extrabold'
                : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-[#EBF4FC] dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600'
            }`}
          >
            <FileText className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <span>Bitácora de Auditoría ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4 space-y-4 flex-1 max-w-[1440px] w-full mx-auto">
        {error && <div className="justi-alert-error">{error}</div>}
        {success && <div className="justi-alert-success">{success}</div>}

        {/* 1. PESTAÑA: EMPRESAS & MARCA */}
        {currentTab === 'EMPRESAS' && <CompaniesTab token={token} />}

        {/* 2. PESTAÑA: INTEGRACIONES EXTERNAS */}
        {currentTab === 'INTEGRACIONES' && (
          <IntegrationsTab
            companies={companies}
            selectedCompanyId={selectedCompanyId}
            onSelectCompany={handleSelectCompanyForIntegrations}
            mpSettings={mpSettings}
            mpEnabled={mpEnabled}
            setMpEnabled={setMpEnabled}
            mpSandbox={mpSandbox}
            setMpSandbox={setMpSandbox}
            mpPublicKey={mpPublicKey}
            setMpPublicKey={setMpPublicKey}
            mpAccessToken={mpAccessToken}
            setMpAccessToken={setMpAccessToken}
            mpWebhookSecret={mpWebhookSecret}
            setMpWebhookSecret={setMpWebhookSecret}
            mpPosId={mpPosId}
            setMpPosId={setMpPosId}
            showMpToken={showMpToken}
            setShowMpToken={setShowMpToken}
            testingMp={testingMp}
            savingMp={savingMp}
            mpTestResult={mpTestResult}
            onTestMpConnection={handleTestMpConnection}
            onSaveMp={handleSaveMp}
            afipSettings={afipSettings}
            afipEnabled={afipEnabled}
            setAfipEnabled={setAfipEnabled}
            afipProduction={afipProduction}
            setAfipProduction={setAfipProduction}
            afipCuit={afipCuit}
            setAfipCuit={setAfipCuit}
            afipPuntoVenta={afipPuntoVenta}
            setAfipPuntoVenta={setAfipPuntoVenta}
            afipCert={afipCert}
            setAfipCert={setAfipCert}
            afipPrivateKey={afipPrivateKey}
            setAfipPrivateKey={setAfipPrivateKey}
            afipDefaultConcepto={afipDefaultConcepto}
            setAfipDefaultConcepto={setAfipDefaultConcepto}
            afipDefaultCbteTipo={afipDefaultCbteTipo}
            setAfipDefaultCbteTipo={setAfipDefaultCbteTipo}
            showAfipKey={showAfipKey}
            setShowAfipKey={setShowAfipKey}
            testingAfip={testingAfip}
            savingAfip={savingAfip}
            afipTestResult={afipTestResult}
            onTestAfipConnection={handleTestAfipConnection}
            onSaveAfip={handleSaveAfip}
          />
        )}

        {/* 3. PESTAÑA: SEGURIDAD & APIS */}
        {currentTab === 'SEGURIDAD' && (
          <SecurityTab
            maxDiscountInput={maxDiscountInput}
            setMaxDiscountInput={setMaxDiscountInput}
            posPaused={posPaused}
            setPosPaused={setPosPaused}
            crmPaused={crmPaused}
            setCrmPaused={setCrmPaused}
            loading={loading}
            onRefresh={loadMasterData}
            onSaveSettings={handleSaveSettings}
            onKillSwitch={handleKillSwitch}
            newKeyName={newKeyName}
            setNewKeyName={setNewKeyName}
            selectedScopes={selectedScopes}
            toggleScope={toggleScope}
            createdPlaintextKey={createdPlaintextKey}
            copied={copied}
            onCopyKey={() => {
              if (createdPlaintextKey) {
                navigator.clipboard.writeText(createdPlaintextKey);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
            onCreateKey={handleCreateKey}
            apiKeys={apiKeys}
            onRevokeKey={handleRevokeKey}
          />
        )}

        {/* 4. PESTAÑA: AUDITORÍA GLOBAL */}
        {currentTab === 'AUDITORIA' && <AuditTab auditLogs={auditLogs} />}

        <JustiFooter className="mt-8" />
      </div>
    </div>
  );
};

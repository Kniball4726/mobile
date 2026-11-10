import React, { useEffect, useState, useCallback } from 'react';
import { MasterApi } from '../../services/api.service';
import { JustiFooter } from '../../components/JustiFooter';
import {
  ApiKeyRecord,
  AuditLogRecord,
  GlobalSystemSettings,
  MaskedAfipSettings,
  MaskedMercadoPagoSettings,
  TestAfipConnectionResult,
} from '../../types/domain.types';

import { SystemSettingsCard } from './components/SystemSettingsCard';
import { ApiKeyCreateCard } from './components/ApiKeyCreateCard';
import { MercadoPagoIntegrationCard } from './components/MercadoPagoIntegrationCard';
import { AfipIntegrationCard } from './components/AfipIntegrationCard';
import { ApiKeysTable } from './components/ApiKeysTable';
import { AuditLogsTable } from './components/AuditLogsTable';

interface MasterControlViewProps {
  token: string;
}

export const MasterControlView: React.FC<MasterControlViewProps> = ({
  token,
}) => {
  const [, setSettings] = useState<GlobalSystemSettings | null>(null);
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
  const [showMpToken, setShowMpToken] = useState(false);
  const [testingMp, setTestingMp] = useState(false);
  const [mpTestResult, setMpTestResult] = useState<{
    success: boolean;
    message: string;
    nickname?: string;
  } | null>(null);
  const [savingMp, setSavingMp] = useState(false);

  // Formulario Facturación Electrónica AFIP / ARCA (Exclusivo MASTER)
  const [afipSettings, setAfipSettings] =
    useState<MaskedAfipSettings | null>(null);
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
  const [afipTestResult, setAfipTestResult] =
    useState<TestAfipConnectionResult | null>(null);
  const [savingAfip, setSavingAfip] = useState(false);

  const loadMasterData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cfg, keys, logs, mpCfg, afipCfg] = await Promise.all([
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
        MasterApi.getAfipSettings(token).catch((err: unknown) => {
          console.warn(
            'Endpoint de AFIP no disponible en el servidor actual:',
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

      if (mpCfg) {
        setMpSettings(mpCfg);
        setMpEnabled(Boolean(mpCfg.isEnabled));
        setMpSandbox(mpCfg.isSandbox ?? true);
        setMpPublicKey(mpCfg.publicKey || '');
        setMpAccessToken(mpCfg.accessTokenMasked || '');
        setMpWebhookSecret(mpCfg.hasWebhookSecret ? '••••••••••••••••' : '');
        setMpPosId(mpCfg.posId || '');
      }

      if (afipCfg) {
        setAfipSettings(afipCfg);
        setAfipEnabled(Boolean(afipCfg.isEnabled));
        setAfipProduction(Boolean(afipCfg.isProduction));
        setAfipCuit(afipCfg.cuit || '');
        setAfipPuntoVenta(afipCfg.puntoVenta ?? 1);
        setAfipCert(
          afipCfg.hasCert
            ? afipCfg.certPreview || 'Certificado X.509 configurado en servidor'
            : '',
        );
        setAfipPrivateKey(afipCfg.hasPrivateKey ? '••••••••••••••••' : '');
        setAfipDefaultConcepto(afipCfg.defaultConcepto ?? 1);
        setAfipDefaultCbteTipo(afipCfg.defaultCbteTipo ?? 6);
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
          reason: posPaused || crmPaused ? 'Mantenimiento Preventivo' : null,
        },
      });
      setSettings(updated);
      setSuccess('Parámetros del sistema actualizados correctamente.');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Error al guardar parámetros.',
      );
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
      setError(
        err instanceof Error
          ? err.message
          : 'Error al ejecutar Kill-Switch.',
      );
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
      setError(
        err instanceof Error ? err.message : 'Error al generar clave API.',
      );
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
      setError(
        err instanceof Error ? err.message : 'Error al revocar clave API.',
      );
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

      const updated = await MasterApi.updateMercadoPagoSettings(token, {
        isEnabled: mpEnabled,
        isSandbox: mpSandbox,
        publicKey: mpPublicKey.trim() || null,
        accessToken: cleanToken,
        webhookSecret: cleanSecret,
        posId: mpPosId.trim() || null,
      });

      setMpSettings(updated);
      setSuccess(
        'Configuración de Mercado Pago actualizada exitosamente en MongoDB bajo política Zero-Knowledge.',
      );
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

      const updated = await MasterApi.updateAfipSettings(token, {
        isEnabled: afipEnabled,
        isProduction: afipProduction,
        cuit: afipCuit.trim() || null,
        puntoVenta: Number(afipPuntoVenta) || 1,
        cert: cleanCert,
        privateKey: cleanKey,
        defaultConcepto: Number(afipDefaultConcepto) || 1,
        defaultCbteTipo: Number(afipDefaultCbteTipo) || 6,
      });

      setAfipSettings(updated);
      setSuccess(
        'Configuración de Facturación AFIP / ARCA actualizada exitosamente en MongoDB bajo política Zero-Knowledge.',
      );
    } catch (err: unknown) {
      const rawMsg =
        err instanceof Error
          ? err.message
          : 'Error al actualizar configuración de AFIP.';
      setError(
        rawMsg.includes('Cannot') || rawMsg.includes('404')
          ? 'El endpoint de integración de AFIP aún no está desplegado en el servidor actual de Render.'
          : rawMsg,
      );
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
      const res = await MasterApi.testAfipConnection(token, {
        cuitOverride: afipCuit.trim() || undefined,
        isProductionOverride: afipProduction,
      });
      setAfipTestResult(res);
      if (res.success) {
        setSuccess(res.message);
      } else {
        setError(res.message);
      }
    } catch (err: unknown) {
      const rawMsg =
        err instanceof Error
          ? err.message
          : 'Fallo en la prueba de conexión con AFIP';
      const msg =
        rawMsg.includes('Cannot') || rawMsg.includes('404')
          ? 'El endpoint de prueba de AFIP aún no está desplegado en el servidor actual de Render.'
          : rawMsg;
      setAfipTestResult({
        success: false,
        message: msg,
        environment: afipProduction
          ? 'Producción'
          : 'Homologación (Testing)',
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
    <div className="flex flex-col min-h-[calc(100vh-44px)] bg-[#F7FBFF]">
      <div className="justi-title-strip">
        Control Master &amp; Integraciones Externas
      </div>

      <div className="p-3 sm:p-4 space-y-4 flex-1 max-w-[1440px] w-full mx-auto">
        {error && <div className="justi-alert-error">{error}</div>}
        {success && <div className="justi-alert-success">{success}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 1. Configuración Global & Kill-Switch */}
          <SystemSettingsCard
            maxDiscountInput={maxDiscountInput}
            setMaxDiscountInput={setMaxDiscountInput}
            posPaused={posPaused}
            setPosPaused={setPosPaused}
            crmPaused={crmPaused}
            setCrmPaused={setCrmPaused}
            loading={loading}
            onRefresh={loadMasterData}
            onSave={handleSaveSettings}
            onKillSwitch={handleKillSwitch}
          />

          {/* 2. Generador de API Keys Externas */}
          <ApiKeyCreateCard
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
            onSubmit={handleCreateKey}
          />
        </div>

        {/* 3. Integración Mercado Pago */}
        <MercadoPagoIntegrationCard
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
          onTestConnection={handleTestMpConnection}
          onSave={handleSaveMp}
        />

        {/* 4. Facturación Electrónica AFIP / ARCA */}
        <AfipIntegrationCard
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
          onTestConnection={handleTestAfipConnection}
          onSave={handleSaveAfip}
        />

        {/* 5. Tabla de API Keys Registradas */}
        <ApiKeysTable apiKeys={apiKeys} onRevokeKey={handleRevokeKey} />

        {/* 6. Bitácora de Auditoría Inmutable */}
        <AuditLogsTable auditLogs={auditLogs} />

        <JustiFooter className="mt-8" />
      </div>
    </div>
  );
};

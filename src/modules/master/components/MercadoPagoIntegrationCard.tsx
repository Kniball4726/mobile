import React from 'react';
import { MaskedMercadoPagoSettings } from '../../../types/domain.types';
import {
  QrCode,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  CreditCard,
  ExternalLink,
} from 'lucide-react';

interface MercadoPagoIntegrationCardProps {
  mpSettings: MaskedMercadoPagoSettings | null;
  mpEnabled: boolean;
  setMpEnabled: (val: boolean) => void;
  mpSandbox: boolean;
  setMpSandbox: (val: boolean) => void;
  mpPublicKey: string;
  setMpPublicKey: (val: string) => void;
  mpAccessToken: string;
  setMpAccessToken: (val: string) => void;
  mpWebhookSecret: string;
  setMpWebhookSecret: (val: string) => void;
  mpPosId: string;
  setMpPosId: (val: string) => void;
  showMpToken: boolean;
  setShowMpToken: (val: boolean) => void;
  testingMp: boolean;
  savingMp: boolean;
  mpTestResult: { success: boolean; message: string; nickname?: string } | null;
  onTestConnection: () => void;
  onSave: (e: React.FormEvent) => void;
}

export const MercadoPagoIntegrationCard: React.FC<
  MercadoPagoIntegrationCardProps
> = ({
  mpSettings,
  mpEnabled,
  setMpEnabled,
  mpSandbox,
  setMpSandbox,
  mpPublicKey,
  setMpPublicKey,
  mpAccessToken,
  setMpAccessToken,
  mpWebhookSecret,
  setMpWebhookSecret,
  mpPosId,
  setMpPosId,
  showMpToken,
  setShowMpToken,
  testingMp,
  savingMp,
  mpTestResult,
  onTestConnection,
  onSave,
}) => {
  return (
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

      <form onSubmit={onSave} className="p-3 sm:p-4 space-y-4 text-xs">
        <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-200 dark:border-slate-800">
          Esta pasarela permite al superusuario <strong className="text-[#009EE3]">MASTER</strong> configurar
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
            onClick={onTestConnection}
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
  );
};

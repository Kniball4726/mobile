import React from 'react';
import {
  MaskedAfipSettings,
  TestAfipConnectionResult,
} from '../../../types/domain.types';
import {
  Landmark,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  FileText,
} from 'lucide-react';

interface AfipIntegrationCardProps {
  afipSettings: MaskedAfipSettings | null;
  afipEnabled: boolean;
  setAfipEnabled: (val: boolean) => void;
  afipProduction: boolean;
  setAfipProduction: (val: boolean) => void;
  afipCuit: string;
  setAfipCuit: (val: string) => void;
  afipPuntoVenta: number;
  setAfipPuntoVenta: (val: number) => void;
  afipCert: string;
  setAfipCert: (val: string) => void;
  afipPrivateKey: string;
  setAfipPrivateKey: (val: string) => void;
  afipDefaultConcepto: number;
  setAfipDefaultConcepto: (val: number) => void;
  afipDefaultCbteTipo: number;
  setAfipDefaultCbteTipo: (val: number) => void;
  showAfipKey: boolean;
  setShowAfipKey: (val: boolean) => void;
  testingAfip: boolean;
  savingAfip: boolean;
  afipTestResult: TestAfipConnectionResult | null;
  onTestConnection: () => void;
  onSave: (e: React.FormEvent) => void;
}

export const AfipIntegrationCard: React.FC<AfipIntegrationCardProps> = ({
  afipSettings,
  afipEnabled,
  setAfipEnabled,
  afipProduction,
  setAfipProduction,
  afipCuit,
  setAfipCuit,
  afipPuntoVenta,
  setAfipPuntoVenta,
  afipCert,
  setAfipCert,
  afipPrivateKey,
  setAfipPrivateKey,
  afipDefaultConcepto,
  setAfipDefaultConcepto,
  afipDefaultCbteTipo,
  setAfipDefaultCbteTipo,
  showAfipKey,
  setShowAfipKey,
  testingAfip,
  savingAfip,
  afipTestResult,
  onTestConnection,
  onSave,
}) => {
  return (
    <div className="border border-[#204060] dark:border-blue-900 bg-white dark:bg-slate-900 shadow-sm transition-colors">
      <div className="bg-[#204060] text-white px-3 py-2 flex items-center justify-between font-bold text-xs">
        <span className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-sky-300" />
          <span>Facturación Electrónica AFIP / ARCA (WSFEv1 &amp; CAE Fiscal)</span>
        </span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
            afipEnabled
              ? afipProduction
                ? 'bg-emerald-400 text-slate-900'
                : 'bg-amber-400 text-slate-900'
              : 'bg-slate-700 text-slate-200'
          }`}
        >
          {afipEnabled
            ? afipProduction
              ? 'PRODUCCIÓN FISCAL ACTIVA'
              : 'HOMOLOGACIÓN (PRUEBAS)'
            : 'DESHABILITADO'}
        </span>
      </div>

      <form onSubmit={onSave} className="p-3 sm:p-4 space-y-4 text-xs">
        <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-200 dark:border-slate-800">
          <p className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
            Responsabilidad Exclusiva de Nivel MASTER:
          </p>
          Esta sección prepara y administra la conexión con los Servicios Web de AFIP / ARCA (WSAA y WSFEv1).
          Al habilitarse, el Punto de Venta generará facturas electrónicas oficiales (A, B y C) con CAE y código QR normativo (RG 4291/2018).
          Los certificados y claves privadas se resguardan bajo política estricta de <strong className="text-[#1B5E91] dark:text-sky-400">Zero-Knowledge</strong>.
        </div>

        {afipTestResult && (
          <div
            className={`p-2.5 rounded text-xs flex flex-col gap-1.5 ${
              afipTestResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-400 text-emerald-900 dark:text-emerald-200 font-semibold'
                : 'bg-amber-50 dark:bg-amber-950/50 border border-amber-400 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Check
                className={`h-4 w-4 flex-shrink-0 ${
                  afipTestResult.success ? 'text-emerald-600' : 'text-amber-600'
                }`}
              />
              <span>{afipTestResult.message}</span>
            </div>
            {afipTestResult.servers && (
              <div className="flex flex-wrap gap-3 text-[10px] pl-6 text-slate-600 dark:text-slate-300">
                <span>AppServer: <strong className="text-slate-900 dark:text-white">{afipTestResult.servers.appServer}</strong></span>
                <span>DbServer: <strong className="text-slate-900 dark:text-white">{afipTestResult.servers.dbServer}</strong></span>
                <span>AuthServer: <strong className="text-slate-900 dark:text-white">{afipTestResult.servers.authServer}</strong></span>
                {afipTestResult.diagnostics?.latencyMs !== undefined && (
                  <span>Latencia: <strong>{afipTestResult.diagnostics.latencyMs}ms</strong></span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
            <input
              type="checkbox"
              id="afipEnabledCheck"
              checked={afipEnabled}
              onChange={(e) => setAfipEnabled(e.target.checked)}
              className="h-4 w-4 rounded text-[#204060] focus:ring-[#204060]"
            />
            <label
              htmlFor="afipEnabledCheck"
              className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              Habilitar Facturación Electrónica en POS
            </label>
          </div>

          <div className="flex items-center gap-2 p-2 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
            <input
              type="checkbox"
              id="afipProductionCheck"
              checked={afipProduction}
              onChange={(e) => setAfipProduction(e.target.checked)}
              className="h-4 w-4 rounded text-[#204060] focus:ring-[#204060]"
            />
            <label
              htmlFor="afipProductionCheck"
              className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              Entorno Producción Real (Desmarcar para Testing / Homologación)
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              CUIT de la Empresa / Titular:
            </label>
            <input
              type="text"
              value={afipCuit}
              onChange={(e) => setAfipCuit(e.target.value)}
              placeholder="Ej. 20-12345678-9 o 30712345678"
              maxLength={13}
              className="justi-input w-full font-mono text-xs"
            />
            <p className="text-[10px] text-slate-500 mt-0.5">
              11 dígitos con validación matemática de dígito verificador.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Punto de Venta AFIP (Pto Vta):
            </label>
            <input
              type="number"
              min={1}
              max={99999}
              value={afipPuntoVenta}
              onChange={(e) => setAfipPuntoVenta(Number(e.target.value))}
              placeholder="Ej. 1"
              className="justi-input w-full text-xs font-bold"
            />
            <p className="text-[10px] text-slate-500 mt-0.5">
              Número de punto de venta habilitado en AFIP para WSFE.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Comprobante por Defecto:
            </label>
            <select
              value={afipDefaultCbteTipo}
              onChange={(e) => setAfipDefaultCbteTipo(Number(e.target.value))}
              className="justi-input w-full text-xs"
            >
              <option value={6}>Factura B (Consumidor Final / Exento)</option>
              <option value={11}>Factura C (Monotributista)</option>
              <option value={1}>Factura A (Responsable Inscripto)</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Se ajusta automáticamente según la condición de IVA del cliente.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Certificado Digital X.509 (.crt / .pem):
            </label>
            <textarea
              rows={3}
              value={afipCert}
              onChange={(e) => setAfipCert(e.target.value)}
              placeholder="Pegue aquí el contenido de -----BEGIN CERTIFICATE----- ... -----END CERTIFICATE-----"
              className="justi-input w-full font-mono text-[11px] resize-y"
            />
            <p className="text-[10px] text-slate-500 mt-0.5">
              {afipSettings?.hasCert
                ? '✓ Certificado X.509 cargado en servidor.'
                : 'Sin certificado digital cargado.'}
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Clave Privada (.key / PEM):
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={afipPrivateKey}
                onChange={(e) => setAfipPrivateKey(e.target.value)}
                placeholder="Pegue aquí el contenido de -----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----"
                className="justi-input w-full font-mono text-[11px] resize-y pr-8"
              />
              <button
                type="button"
                onClick={() => setShowAfipKey(!showAfipKey)}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={showAfipKey ? 'Ocultar' : 'Mostrar'}
              >
                {showAfipKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              {afipSettings?.hasPrivateKey
                ? '✓ Clave privada resguardada con Zero-Knowledge.'
                : 'Sin clave privada cargada.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            disabled={testingAfip}
            onClick={onTestConnection}
            className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${testingAfip ? 'animate-spin' : ''}`}
            />
            <span>
              {testingAfip
                ? 'Probando Servidores AFIP...'
                : 'Probar Conexión con AFIP (FEDummy)'}
            </span>
          </button>

          <button
            type="submit"
            disabled={savingAfip}
            className="justi-btn-primary px-4 py-1.5 text-xs font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>
              {savingAfip ? 'Guardando...' : 'Guardar Configuración AFIP'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

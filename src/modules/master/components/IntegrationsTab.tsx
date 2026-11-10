import React from 'react';
import {
  CompanyRecord,
  MaskedAfipSettings,
  MaskedMercadoPagoSettings,
  TestAfipConnectionResult,
} from '../../../types/domain.types';
import { Building2 } from 'lucide-react';
import { MercadoPagoIntegrationCard } from './MercadoPagoIntegrationCard';
import { AfipIntegrationCard } from './AfipIntegrationCard';

interface IntegrationsTabProps {
  companies: CompanyRecord[];
  selectedCompanyId: string;
  onSelectCompany: (companyId: string) => void;
  // Mercado Pago
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
  mpTestResult: {
    success: boolean;
    message: string;
    nickname?: string;
  } | null;
  onTestMpConnection: () => void;
  onSaveMp: (e: React.FormEvent) => void;
  // AFIP
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
  onTestAfipConnection: () => void;
  onSaveAfip: (e: React.FormEvent) => void;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  companies,
  selectedCompanyId,
  onSelectCompany,
  // MP
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
  onTestMpConnection,
  onSaveMp,
  // AFIP
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
  onTestAfipConnection,
  onSaveAfip,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Banner Selector de Empresa para Integraciones */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-3.5 border border-[#9CC2E5] dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#DCEAF7] dark:bg-slate-700 text-[#1B5E91] dark:text-sky-300">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>Pasarelas &amp; Facturación por Empresa</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Multi-Tenant Aislado
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Las claves de Mercado Pago y certificados AFIP se asignan independientemente a cada razón social.
            </p>
          </div>
        </div>

        {companies.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Empresa Jurídica:
            </label>
            <select
              value={selectedCompanyId}
              onChange={(e) => onSelectCompany(e.target.value)}
              className="justi-input text-xs font-bold py-1.5 px-3 min-w-[220px]"
            >
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.isDefault ? '★ (Principal)' : ''} [CUIT:{' '}
                  {c.cuitFormatted || c.cuit}]
                </option>
              ))}
            </select>
          </div>
        )}
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
        onTestConnection={onTestMpConnection}
        onSave={onSaveMp}
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
        onTestConnection={onTestAfipConnection}
        onSave={onSaveAfip}
      />
    </div>
  );
};

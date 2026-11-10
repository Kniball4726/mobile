import React from 'react';
import { Settings, ShieldAlert, RefreshCw } from 'lucide-react';

interface SystemSettingsCardProps {
  maxDiscountInput: number;
  setMaxDiscountInput: (val: number) => void;
  posPaused: boolean;
  setPosPaused: (val: boolean) => void;
  crmPaused: boolean;
  setCrmPaused: (val: boolean) => void;
  loading: boolean;
  onRefresh: () => void;
  onSave: (e: React.FormEvent) => void;
  onKillSwitch: () => void;
}

export const SystemSettingsCard: React.FC<SystemSettingsCardProps> = ({
  maxDiscountInput,
  setMaxDiscountInput,
  posPaused,
  setPosPaused,
  crmPaused,
  setCrmPaused,
  loading,
  onRefresh,
  onSave,
  onKillSwitch,
}) => {
  return (
    <div className="border border-[#80AED8] bg-[#E8F2FC]">
      <div className="justi-section-header flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Settings className="h-4 w-4" />
          Parámetros Globales (system_settings)
        </span>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded bg-white/20 p-1 hover:bg-white/30"
          title="Refrescar parámetros"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
          />
        </button>
      </div>

      <form onSubmit={onSave} className="p-3 space-y-3 text-xs">
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
            onClick={onKillSwitch}
            className="inline-flex items-center gap-1 rounded border border-red-600 bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700 transition active:scale-95"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Kill-Switch (Cerrar Sesiones)
          </button>
        </div>
      </form>
    </div>
  );
};

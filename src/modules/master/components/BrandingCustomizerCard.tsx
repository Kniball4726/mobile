import React, { useState } from 'react';
import { Palette, CheckCircle2, AlertCircle, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { MasterApi } from '../../../services/api';
import { useBranding } from '../../../context/BrandingContext';

interface BrandingCustomizerCardProps {
  token: string;
}

const PRESET_LOGOS = [
  {
    id: 'justi-svg',
    label: 'JustiMobile POS — Logotipo Oficial (SVG)',
    url: '/justi-logo.svg',
    type: 'svg',
  },
  {
    id: 'gold-svg',
    label: 'Vector Dorado Alternativo (SVG)',
    url: '/ultratech-carreras-logo.svg',
    type: 'svg',
  },
];

export const BrandingCustomizerCard: React.FC<BrandingCustomizerCardProps> = ({
  token,
}) => {
  const { branding, setBranding, reloadBranding } = useBranding();

  const [companyName, setCompanyName] = useState(branding.companyName);
  const [legalName, setLegalName] = useState(branding.legalName);
  const [slogan, setSlogan] = useState(branding.slogan);
  const [selectedLogoUrl, setSelectedLogoUrl] = useState(branding.logoUrl);
  const [customLogoInput, setCustomLogoInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const logoToSave = customLogoInput.trim() || selectedLogoUrl;

    try {
      const updated = await MasterApi.updateBranding(token, {
        companyName: companyName.trim(),
        legalName: legalName.trim(),
        slogan: slogan.trim(),
        logoUrl: logoToSave,
      });

      setBranding(updated);
      setSuccess('¡Identidad visual y logotipo actualizados con éxito en toda la aplicación!');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(
        err?.message || 'Error al guardar la configuración de identidad visual.',
      );
    } finally {
      setSaving(false);
    }
  };

  const currentPreviewLogo = customLogoInput.trim() || selectedLogoUrl;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 p-5 mb-6">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-amber-500" />
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            Identidad Visual y Marca de la Aplicación
          </h2>
        </div>
        <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-semibold px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-700">
          Personalización en Tiempo Real
        </span>
      </div>

      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-5">
        Configura el nombre comercial, eslogan y el logotipo que verán todos los operadores en el Login, barra superior, menú lateral y comprobantes.
      </p>

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

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nombre Comercial de la App / Empresa
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Ej. Mi Empresa POS"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Se visualiza en el título del navegador, login y barra superior.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Razón Social Legal (Para Facturas y Tickets)
            </label>
            <input
              type="text"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Ej. Mi Empresa S.A."
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Eslogan Oficial o Subtítulo
          </label>
          <input
            type="text"
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 outline-none"
            placeholder="Ej. ADVANCED TECHNOLOGY IN SPORTS NUTRITION"
          />
        </div>

        {/* Selector de Logotipo */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Seleccionar Logotipo del Sistema
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {PRESET_LOGOS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedLogoUrl(preset.url);
                  setCustomLogoInput('');
                }}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                  selectedLogoUrl === preset.url && !customLogoInput
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-1 ring-amber-400'
                    : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="h-12 w-12 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 p-1">
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {preset.label}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {preset.type.toUpperCase()} • {preset.url}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              O ingresa la ruta / URL de un logotipo personalizado:
            </label>
            <input
              type="text"
              value={customLogoInput}
              onChange={(e) => setCustomLogoInput(e.target.value)}
              placeholder="Ej. /mi-logo-empresa.svg o https://..."
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-amber-500 outline-none font-mono"
            />
          </div>
        </div>

        {/* Previsualización en Vivo */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              Previsualización en Vivo de la Marca
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Preview sobre fondo celeste (como en Login Claro) */}
            <div className="p-4 rounded-lg bg-[#DCEAF7] border border-[#C6DDF2] flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Fondo Claro (Pantalla de Ingreso)
              </span>
              <img
                src={currentPreviewLogo}
                alt="Preview"
                className="h-16 w-16 object-contain drop-shadow-md mb-2"
              />
              <p className="font-extrabold text-sm text-slate-800 tracking-wide">
                {companyName || 'Nombre Empresa'}
              </p>
              <p className="text-[9px] text-slate-600 font-semibold uppercase tracking-wider">
                {slogan || 'Eslogan de la Empresa'}
              </p>
            </div>

            {/* Preview sobre fondo azul marino (como en Topbar / Modo Noche) */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-[#1B5E91] to-[#2563EB] border border-blue-400/40 flex flex-col items-center justify-center text-center text-white">
              <span className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-2">
                Barra Superior / Modo Noche
              </span>
              <img
                src={currentPreviewLogo}
                alt="Preview"
                className="h-16 w-16 object-contain drop-shadow-md mb-2"
              />
              <p className="font-extrabold text-sm text-white tracking-wide">
                {companyName || 'Nombre Empresa'}
              </p>
              <p className="text-[9px] text-blue-100 font-semibold uppercase tracking-wider">
                {slogan || 'Eslogan de la Empresa'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={reloadBranding}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Restablecer
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Guardar Cambios de Marca</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

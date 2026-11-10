import React, { useEffect, useState } from 'react';
import { AuthApi } from '../../services/api.service';
import { LoginResponse } from '../../types/domain.types';
import { Sun, Moon, ShieldAlert, Clock } from 'lucide-react';
import { useBranding } from '../../context/BrandingContext';

interface LoginViewProps {
  onLoginSuccess: (session: LoginResponse) => void;
  isDark?: boolean;
  onToggleDarkMode?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  isDark,
  onToggleDarkMode,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const { branding } = useBranding();

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const isDarkMode =
    typeof isDark === 'boolean'
      ? isDark
      : typeof document !== 'undefined' &&
        document.documentElement.classList.contains('dark');

  const inputStyle: React.CSSProperties = isDarkMode
    ? {
        backgroundColor: '#1E293B',
        color: '#FFFFFF',
        borderColor: '#475569',
        colorScheme: 'dark',
      }
    : {
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        borderColor: '#94A3B8',
        colorScheme: 'light',
      };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setError(null);
    setLoading(true);
    try {
      const response = await AuthApi.login(email.trim(), password);
      onLoginSuccess(response);
    } catch (err: any) {
      const isRateLimit =
        err?.status === 429 ||
        err?.code === 'TOO_MANY_LOGIN_ATTEMPTS' ||
        err?.code === 'RATE_LIMIT_EXCEEDED';

      const regexMatch = err?.message?.match(/(\d+)\s*segundos/i);
      const parsedSeconds = regexMatch ? parseInt(regexMatch[1], 10) : 0;
      const retryAfter =
        err?.details?.retryAfterSeconds ||
        (parsedSeconds > 0 ? parsedSeconds : isRateLimit ? 60 : 0);

      if (isRateLimit || retryAfter > 0) {
        setLockoutSeconds(retryAfter);
      }

      setError(
        err instanceof Error
          ? err.message
          : 'Credenciales inválidas o servidor no disponible.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#E8F2FC] dark:bg-slate-900 flex flex-col relative transition-colors duration-200">
      {onToggleDarkMode && (
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="absolute top-4 right-4 p-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800 shadow-sm hover:scale-105 transition"
          title={isDark ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
        >
          {isDark ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-slate-700" />
          )}
        </button>
      )}

      <div className="w-full bg-[#DCEAF7] dark:bg-slate-800 border-b border-[#C6DDF2] dark:border-slate-700 pt-6 pb-4 px-4 flex flex-col items-center">
        <div className="relative mb-2">
          <img
            src={branding.logoUrl || '/ultratech-carreras-logo.svg'}
            alt={branding.companyName || 'Logo'}
            className="h-28 w-28 sm:h-32 sm:w-32 object-contain drop-shadow-md hover:scale-105 transition-transform duration-200"
          />
        </div>

        <div className="mt-1 text-center">
          <p className="text-xs sm:text-[14px] tracking-[0.14em] font-extrabold text-slate-800 dark:text-slate-100 uppercase">
            {branding.companyName || 'ULTRATECH CARRERAS'}
          </p>
          <div className="w-full h-[1.5px] bg-amber-600/40 dark:bg-amber-400/40 my-0.5" />
          <p className="text-[9px] sm:text-[10px] tracking-[0.16em] font-semibold text-slate-600 dark:text-slate-300 uppercase">
            {branding.slogan || 'ADVANCED TECHNOLOGY IN SPORTS NUTRITION'}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-1">
          <span className="text-base sm:text-lg font-black text-[#1B5E91] dark:text-sky-400 tracking-tight">
            Sistema de Gestión POS &amp; CRM
          </span>
        </div>

        <h1 className="mt-0.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
          Ingreso de Operadores
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pt-6 pb-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm flex flex-col items-center space-y-3.5"
        >
          {lockoutSeconds > 0 ? (
            <div className="w-full p-3 rounded-lg border border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs flex flex-col gap-1.5 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span>Bloqueo temporal por seguridad (Anti-Fuerza Bruta)</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Se detectaron múltiples intentos fallidos. Por protección de la cuenta y del servidor, el acceso está restringido.
              </p>
              <div className="flex items-center justify-between pt-1 font-semibold text-xs text-amber-700 dark:text-amber-300 border-t border-amber-200 dark:border-amber-800/60">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Reintentando en:
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-800 font-mono font-bold text-amber-900 dark:text-amber-100">
                  {lockoutSeconds} seg
                </span>
              </div>
            </div>
          ) : (
            error && (
              <div className="w-full justi-alert-error text-center">{error}</div>
            )
          )}

          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-center gap-1 sm:gap-3">
            <label className="text-xs font-bold text-[#1B5E91] dark:text-sky-300 sm:w-28 sm:text-right">
              Email:
            </label>
            <input
              type="email"
              required
              disabled={lockoutSeconds > 0}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              className="justi-input w-full sm:w-60 font-medium placeholder-slate-400 dark:placeholder-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="usuario@justi.com.ar"
            />
          </div>

          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-center gap-1 sm:gap-3">
            <label className="text-xs font-bold text-[#1B5E91] dark:text-sky-300 sm:w-28 sm:text-right">
              Clave de Acceso:
            </label>
            <input
              type="password"
              required
              disabled={lockoutSeconds > 0}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              className="justi-input w-full sm:w-60 font-medium placeholder-slate-400 dark:placeholder-slate-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="••••••••••"
            />
          </div>

          <div className="w-full sm:w-auto pt-1 flex justify-center">
            <button
              type="submit"
              disabled={loading || lockoutSeconds > 0}
              className="justi-btn-primary w-full sm:w-auto px-8 py-2.5 sm:py-1.5 text-sm sm:text-xs font-bold shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              {lockoutSeconds > 0 ? (
                <>
                  <Clock className="h-3.5 w-3.5 animate-spin" />
                  <span>Bloqueado ({lockoutSeconds}s)</span>
                </>
              ) : loading ? (
                'Ingresando...'
              ) : (
                'Ingresar'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 w-full max-w-4xl border-t border-slate-300 dark:border-slate-700 pt-3 text-center">
          <p className="text-[11px] font-medium text-[#1B5E91] dark:text-sky-400/80">
            Copyright ©2026 JustiMobile™ - Todos y cada uno de los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
};

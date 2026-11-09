import React, { useState } from 'react';
import { AuthApi } from '../../services/api.service';
import { LoginResponse } from '../../types/domain.types';
import { Sun, Moon } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await AuthApi.login(email.trim(), password);
      onLoginSuccess(response);
    } catch (err: unknown) {
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
        <img
          src="/justi-logo.svg"
          alt="Laboratorio Web Supplements"
          className="h-20 w-28 object-contain drop-shadow-sm"
        />

        <div className="mt-1 text-center">
          <p className="text-xs sm:text-[14px] tracking-[0.12em] font-semibold text-slate-700 dark:text-slate-200 uppercase">
            LABORATORIO WEB SUPPLEMENTS
          </p>
          <div className="w-full h-[1.5px] bg-slate-600 dark:bg-slate-500 my-0.5" />
          <p className="text-[9px] sm:text-[10px] tracking-[0.16em] font-semibold text-slate-600 dark:text-slate-300 uppercase">
            BIENESTAR - SALUD - PERFORMANCE
          </p>
        </div>

        <div className="mt-4 flex items-center gap-1">
          <span className="text-xl sm:text-2xl font-black text-[#1B5E91] dark:text-sky-400 tracking-tight">
            Justi<span className="text-[#3F80B5] dark:text-sky-300">Mobile</span>
          </span>
        </div>

        <h1 className="mt-1 text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-100">
          Ingreso al Sistema
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pt-6 pb-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm flex flex-col items-center space-y-3.5"
        >
          {error && (
            <div className="w-full justi-alert-error text-center">{error}</div>
          )}

          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-center gap-1 sm:gap-3">
            <label className="text-xs font-bold text-[#1B5E91] dark:text-sky-300 sm:w-28 sm:text-right">
              Email:
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="justi-input w-full sm:w-60 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 font-medium"
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="justi-input w-full sm:w-60 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 font-medium"
              placeholder="••••••••••"
            />
          </div>

          <div className="w-full sm:w-auto pt-1 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="justi-btn-primary w-full sm:w-auto px-8 py-2.5 sm:py-1.5 text-sm sm:text-xs font-bold shadow-sm disabled:opacity-60"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </form>

        <div className="mt-8 w-full max-w-4xl border-t border-slate-300 dark:border-slate-700 pt-3 text-center">
          <p className="text-[11px] font-medium text-[#1B5E91] dark:text-sky-400/80">
            Copyright © 2013/2026 Justi® - Todos y cada uno de los derechos
            reservados
          </p>
        </div>
      </div>
    </div>
  );
};

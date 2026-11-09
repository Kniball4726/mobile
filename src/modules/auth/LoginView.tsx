import React, { useState } from 'react';
import { AuthApi } from '../../services/api.service';
import { LoginResponse } from '../../types/domain.types';

interface LoginViewProps {
  onLoginSuccess: (session: LoginResponse) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
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
    <div className="min-h-screen w-full bg-[#E8F2FC] flex flex-col">
      <div className="w-full bg-[#DCEAF7] border-b border-[#C6DDF2] pt-6 pb-4 px-4 flex flex-col items-center">
        <img
          src="/justi-logo.svg"
          alt="Laboratorio Web Supplements"
          className="h-20 w-28 object-contain"
        />

        <div className="mt-1 text-center">
          <p className="text-xs sm:text-[14px] tracking-[0.12em] font-semibold text-slate-700 uppercase">
            LABORATORIO WEB SUPPLEMENTS
          </p>
          <div className="w-full h-[1.5px] bg-slate-600 my-0.5" />
          <p className="text-[9px] sm:text-[10px] tracking-[0.16em] font-semibold text-slate-600 uppercase">
            BIENESTAR - SALUD - PERFORMANCE
          </p>
        </div>

        <div className="mt-4 flex items-center gap-1">
          <span className="text-xl sm:text-2xl font-black text-[#1B5E91] tracking-tight">
            Justi<span className="text-[#3F80B5]">Mobile</span>
          </span>
        </div>

        <h1 className="mt-1 text-base sm:text-lg font-semibold text-slate-700">
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
            <label className="text-xs font-bold text-[#1B5E91] sm:w-28 sm:text-right">
              Email:
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="justi-input w-full sm:w-56 bg-[#E8F0FE] focus:bg-white"
              placeholder="usuario@justi.com.ar"
            />
          </div>

          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-center gap-1 sm:gap-3">
            <label className="text-xs font-bold text-[#1B5E91] sm:w-28 sm:text-right">
              Clave de Acceso:
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="justi-input w-full sm:w-56 bg-[#E8F0FE] focus:bg-white"
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

        <div className="mt-8 w-full max-w-4xl border-t border-slate-300 pt-3 text-center">
          <p className="text-[11px] font-medium text-[#1B5E91]">
            Copyright © 2013/2026 Justi® - Todos y cada uno de los derechos
            reservados
          </p>
        </div>
      </div>
    </div>
  );
};

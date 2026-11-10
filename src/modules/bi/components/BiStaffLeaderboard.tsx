import React from 'react';
import { BusinessIntelligenceData } from '../../../types/domain.types';
import { Users, Trophy, Building2 } from 'lucide-react';

interface BiStaffLeaderboardProps {
  data: BusinessIntelligenceData;
}

export const BiStaffLeaderboard: React.FC<BiStaffLeaderboardProps> = ({ data }) => {
  const { staffLeaderboard } = data;

  return (
    <div className="border border-[#80AED8] dark:border-slate-700 bg-white dark:bg-slate-800/90 rounded-sm shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-[#4E8EC2] px-3.5 py-2 text-white flex items-center justify-between text-xs">
        <span className="font-bold flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-amber-300" />
          Rendimiento por Vendedor / Cajero (Leaderboard)
        </span>
        <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded">
          {staffLeaderboard.length} operadores
        </span>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full border-collapse text-xs text-left">
          <thead>
            <tr className="bg-[#DCEAF7] dark:bg-slate-800 text-[#1B5E91] dark:text-sky-300 border-b border-[#80AED8] dark:border-slate-700">
              <th className="py-2 px-3 w-8 text-center">#</th>
              <th className="py-2 px-3">Vendedor</th>
              <th className="py-2 px-3 text-center">Sucursal</th>
              <th className="py-2 px-3 text-center">Tickets</th>
              <th className="py-2 px-3 text-right">Facturación $</th>
              <th className="py-2 px-3 text-right">Ticket Prom.</th>
            </tr>
          </thead>
          <tbody>
            {staffLeaderboard.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-3 text-center text-slate-400">
                  No hay operaciones registradas para los vendedores en este rango.
                </td>
              </tr>
            ) : (
              staffLeaderboard.map((staff, idx) => (
                <tr
                  key={staff.cashierId}
                  className={`border-b border-slate-200 dark:border-slate-700/60 ${
                    idx % 2 === 0
                      ? 'bg-white dark:bg-slate-800/50'
                      : 'bg-[#F8FAFD] dark:bg-slate-900/40'
                  } hover:bg-blue-50/50 dark:hover:bg-slate-700/40 transition-colors`}
                >
                  <td className="py-2 px-3 text-center font-bold">
                    {idx === 0 ? (
                      <span className="text-amber-500 font-extrabold text-sm">🥇</span>
                    ) : idx === 1 ? (
                      <span className="text-slate-400 font-extrabold text-sm">🥈</span>
                    ) : idx === 2 ? (
                      <span className="text-amber-700 font-extrabold text-sm">🥉</span>
                    ) : (
                      <span className="text-slate-500 font-mono text-[11px]">{idx + 1}</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {staff.fullName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      {staff.email}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-bold ${
                        staff.branch === 'CARRERAS'
                          ? 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                          : 'border-[#9CC2E5] bg-[#DCEAF7] text-[#1B5E91] dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300'
                      }`}
                    >
                      <Building2 className="h-3 w-3" />
                      {staff.branch}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center font-bold text-slate-700 dark:text-slate-300">
                    {staff.transactionsCount}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-emerald-800 dark:text-emerald-400">
                    ${staff.totalSalesPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-medium text-[#1B5E91] dark:text-sky-300">
                    ${staff.averageTicketPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

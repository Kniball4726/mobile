import React from 'react';
import { BusinessIntelligenceData } from '../../../types/domain.types';
import { Building2, ArrowUpRight, Scale } from 'lucide-react';

interface BiBranchBenchmarkProps {
  data: BusinessIntelligenceData;
}

export const BiBranchBenchmark: React.FC<BiBranchBenchmarkProps> = ({ data }) => {
  const { branchBenchmark, summary } = data;
  const { locales, carreras } = branchBenchmark;

  return (
    <div className="border border-[#80AED8] dark:border-slate-700 bg-white dark:bg-slate-800/90 rounded-sm shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-[#4E8EC2] px-3.5 py-2 text-white flex items-center justify-between text-xs">
        <span className="font-bold flex items-center gap-1.5">
          <Scale className="h-4 w-4" />
          Benchmark de Sucursales (LOCALES vs CARRERAS)
        </span>
        <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded">
          Comparativa de Red
        </span>
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        {/* Barra comparativa de participación */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-[#1B5E91] dark:text-sky-300 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" />
              LOCALES ({locales.sharePercentage}%)
            </span>
            <span className="text-purple-700 dark:text-purple-300 flex items-center gap-1">
              CARRERAS ({carreras.sharePercentage}%)
              <Building2 className="h-3.5 w-3.5" />
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-[#1B5E91] transition-all duration-500"
              style={{ width: `${locales.sharePercentage}%` }}
              title={`LOCALES: ${locales.sharePercentage}%`}
            />
            <div
              className="h-full bg-[#8B5CF6] transition-all duration-500"
              style={{ width: `${carreras.sharePercentage}%` }}
              title={`CARRERAS: ${carreras.sharePercentage}%`}
            />
          </div>
        </div>

        {/* Tarjetas cara a cara */}
        <div className="grid grid-cols-2 gap-3">
          {/* Sucursal LOCALES */}
          <div className="rounded border border-[#80AED8] dark:border-slate-700 bg-[#F5FAFF] dark:bg-slate-900/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#1B5E91] dark:text-sky-300 text-xs flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                LOCALES
              </span>
              <span className="rounded bg-[#DCEAF7] dark:bg-slate-800 text-[10px] font-bold text-[#1B5E91] dark:text-sky-300 px-1.5 py-0.5">
                Principal
              </span>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">Facturación</div>
              <div className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                ${locales.totalPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px] border-t border-slate-200 dark:border-slate-800 pt-1.5">
              <div>
                <span className="text-slate-500 text-[10px] block">Tickets</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {locales.transactions}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Ticket Prom.</span>
                <span className="font-bold text-[#1B5E91] dark:text-sky-300">
                  ${locales.averageTicketPesos.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </div>

          {/* Sucursal CARRERAS */}
          <div className="rounded border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-purple-900 dark:text-purple-300 text-xs flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                CARRERAS
              </span>
              <span className="rounded bg-purple-100 dark:bg-purple-900/60 text-[10px] font-bold text-purple-800 dark:text-purple-300 px-1.5 py-0.5">
                Sucursal
              </span>
            </div>
            <div>
              <div className="text-[10px] text-purple-700/80 dark:text-purple-400">Facturación</div>
              <div className="text-lg font-black text-purple-950 dark:text-purple-200 font-mono">
                ${carreras.totalPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px] border-t border-purple-200 dark:border-purple-900/40 pt-1.5">
              <div>
                <span className="text-purple-700/80 text-[10px] block">Tickets</span>
                <span className="font-bold text-purple-900 dark:text-purple-300">
                  {carreras.transactions}
                </span>
              </div>
              <div>
                <span className="text-purple-700/80 text-[10px] block">Ticket Prom.</span>
                <span className="font-bold text-purple-900 dark:text-purple-300">
                  ${carreras.averageTicketPesos.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

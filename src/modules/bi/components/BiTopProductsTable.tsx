import React from 'react';
import { BusinessIntelligenceData } from '../../../types/domain.types';
import { Package, Award } from 'lucide-react';

interface BiTopProductsTableProps {
  data: BusinessIntelligenceData;
}

export const BiTopProductsTable: React.FC<BiTopProductsTableProps> = ({ data }) => {
  const { topProducts } = data;

  return (
    <div className="border border-[#80AED8] dark:border-slate-700 bg-white dark:bg-slate-800/90 rounded-sm shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-[#4E8EC2] px-3.5 py-2 text-white flex items-center justify-between text-xs">
        <span className="font-bold flex items-center gap-1.5">
          <Award className="h-4 w-4 text-amber-300" />
          Top Suplementos Más Vendidos (Ranking)
        </span>
        <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded">
          Por Ingresos Generados
        </span>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full border-collapse text-xs text-left">
          <thead>
            <tr className="bg-[#DCEAF7] dark:bg-slate-800 text-[#1B5E91] dark:text-sky-300 border-b border-[#80AED8] dark:border-slate-700">
              <th className="py-2 px-3 w-8 text-center">#</th>
              <th className="py-2 px-3">Producto / SKU</th>
              <th className="py-2 px-3 text-center">Unidades</th>
              <th className="py-2 px-3 text-right">Recaudación $</th>
              <th className="py-2 px-3 w-28 text-right">% Facturación</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 px-3 text-center text-slate-400">
                  No hay productos vendidos en este rango.
                </td>
              </tr>
            ) : (
              topProducts.map((p, idx) => (
                <tr
                  key={p.sku}
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
                    <div className="font-bold text-slate-800 dark:text-slate-100 max-w-xs truncate">
                      {p.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      SKU: {p.sku}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center font-extrabold text-slate-800 dark:text-slate-200">
                    {p.unitsSold} u.
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                    ${p.totalRevenuePesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-12 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${Math.min(p.sharePercentage, 100)}%` }}
                        />
                      </div>
                      <span className="font-bold text-[11px] text-[#1B5E91] dark:text-sky-300 w-8">
                        {p.sharePercentage}%
                      </span>
                    </div>
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

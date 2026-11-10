import React from 'react';
import { BusinessIntelligenceData } from '../../../types/domain.types';
import { CreditCard, QrCode, Banknote, Dumbbell, Tag } from 'lucide-react';

interface BiPaymentMixChartProps {
  data: BusinessIntelligenceData;
}

export const BiPaymentMixChart: React.FC<BiPaymentMixChartProps> = ({ data }) => {
  const { paymentMix } = data;

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'MP_QR':
        return <QrCode className="h-4 w-4 text-sky-600 dark:text-sky-400" />;
      case 'EFECTIVO':
        return <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'TARJETA':
        return <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'SPORT_CLUB':
        return <Dumbbell className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Tag className="h-4 w-4 text-slate-500" />;
    }
  };

  const getBarColor = (method: string) => {
    switch (method) {
      case 'MP_QR':
        return 'bg-gradient-to-r from-sky-500 to-blue-600';
      case 'EFECTIVO':
        return 'bg-gradient-to-r from-emerald-500 to-green-600';
      case 'TARJETA':
        return 'bg-gradient-to-r from-purple-500 to-indigo-600';
      case 'SPORT_CLUB':
        return 'bg-gradient-to-r from-amber-500 to-orange-600';
      default:
        return 'bg-gradient-to-r from-slate-400 to-slate-500';
    }
  };

  return (
    <div className="border border-[#80AED8] dark:border-slate-700 bg-white dark:bg-slate-800/90 rounded-sm shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-[#4E8EC2] px-3.5 py-2 text-white flex items-center justify-between text-xs">
        <span className="font-bold flex items-center gap-1.5">
          <CreditCard className="h-4 w-4" />
          Mix de Cobranza & Formas de Pago
        </span>
        <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded">
          {paymentMix.length} canales activos
        </span>
      </div>

      <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-center">
        {paymentMix.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No hay operaciones de cobro en este rango.
          </div>
        ) : (
          paymentMix.map((item) => (
            <div key={item.method} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  {getMethodIcon(item.method)}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    ({item.count} tickets)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    ${item.totalPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="font-bold text-[11px] text-[#1B5E91] dark:text-sky-300 w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>

              {/* Barra de progreso porcentual */}
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getBarColor(item.method)} transition-all duration-500`}
                  style={{ width: `${Math.max(item.percentage, 2)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

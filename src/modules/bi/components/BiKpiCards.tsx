import React from 'react';
import { BusinessIntelligenceData } from '../../../types/domain.types';
import {
  TrendingUp,
  Receipt,
  Wallet,
  Users,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';

interface BiKpiCardsProps {
  data: BusinessIntelligenceData;
}

export const BiKpiCards: React.FC<BiKpiCardsProps> = ({ data }) => {
  const { summary, branchBenchmark, crmInsights } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {/* 1. Facturación Neta Total */}
      <div className="rounded border border-[#80AED8] dark:border-slate-700 bg-gradient-to-br from-[#E8F2FC] to-[#D5E7FA] dark:from-slate-800 dark:to-slate-900 p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Facturación Neta
          </span>
          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 p-1 text-emerald-700 dark:text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          ${summary.totalRevenuePesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 border-t border-[#B4D6F5] dark:border-slate-700/60 pt-1.5">
          <span>{summary.totalTransactions} tickets cerrados</span>
          <span className="font-semibold text-[#1B5E91] dark:text-sky-300">
            {summary.totalItemsSold} u. vendidas
          </span>
        </div>
      </div>

      {/* 2. Ticket Promedio (AOV) */}
      <div className="rounded border border-[#80AED8] dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Ticket Promedio (AOV)
          </span>
          <span className="rounded-full bg-blue-100 dark:bg-blue-950/80 p-1 text-[#1B5E91] dark:text-sky-400">
            <Receipt className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2 text-2xl font-black text-[#1B5E91] dark:text-sky-400 tracking-tight">
          ${summary.averageTicketPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-1.5">
          <span>Promedio por venta</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {summary.totalTransactions > 0
              ? (summary.totalItemsSold / summary.totalTransactions).toFixed(1)
              : 0}{' '}
            art/ticket
          </span>
        </div>
      </div>

      {/* 3. Margen Operativo en Mostrador (Ingresos - Gastos) */}
      <div className="rounded border border-[#80AED8] dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Flujo Operativo Neto
          </span>
          <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 p-1 text-emerald-800 dark:text-emerald-400">
            <Wallet className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2 text-2xl font-black text-emerald-800 dark:text-emerald-400 tracking-tight">
          ${summary.operatingCashFlowPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-1.5">
          <span className="text-amber-700 dark:text-amber-400 font-medium">
            Gastos: -${summary.totalExpensesPesos.toLocaleString('es-AR')}
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
            {summary.totalRevenuePesos > 0
              ? `${((summary.operatingCashFlowPesos / summary.totalRevenuePesos) * 100).toFixed(0)}% neto`
              : '100%'}
          </span>
        </div>
      </div>

      {/* 4. Fidelización CRM y Descuentos */}
      <div className="rounded border border-[#80AED8] dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Adopción CRM (Fidelización)
          </span>
          <span className="rounded-full bg-purple-100 dark:bg-purple-950/80 p-1 text-purple-700 dark:text-purple-400">
            <Users className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2 text-2xl font-black text-purple-900 dark:text-purple-300 tracking-tight">
          {crmInsights.crmAdoptionRate}%
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-1.5">
          <span>{crmInsights.crmSalesCount} con descuento</span>
          <span className="font-semibold text-purple-700 dark:text-purple-400">
            -${crmInsights.totalCrmDiscountPesos.toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      {/* 5. Ratio de Cobros Digitales / Bancarizados */}
      <div className="rounded border border-[#80AED8] dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Cobro Digital (QR/Tarjetas)
          </span>
          <span className="rounded-full bg-sky-100 dark:bg-sky-950/80 p-1 text-[#1B5E91] dark:text-sky-300">
            <CreditCard className="h-4 w-4" />
          </span>
        </div>
        <div className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {summary.digitalPaymentRatio}%
        </div>
        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/60 pt-1.5">
          <span>Mercado Pago & Tarjetas</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
            {100 - summary.digitalPaymentRatio}% Efectivo
          </span>
        </div>
      </div>
    </div>
  );
};

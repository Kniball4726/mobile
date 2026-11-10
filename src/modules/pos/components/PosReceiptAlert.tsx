import React from 'react';
import { CheckCircle2, WifiOff } from 'lucide-react';

interface PosReceiptAlertProps {
  lastReceipt: {
    receiptNumber: string;
    totalPesos: number;
    discountApplied: number;
    cardPlan?: string;
    isOffline?: boolean;
  } | null;
}

export const PosReceiptAlert: React.FC<PosReceiptAlertProps> = ({
  lastReceipt,
}) => {
  if (!lastReceipt) return null;

  if (lastReceipt.isOffline) {
    return (
      <div className="p-3 rounded border border-amber-400 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 text-xs flex items-start sm:items-center gap-2.5 shadow-sm">
        <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0 animate-pulse" />
        <div>
          <span className="font-bold uppercase tracking-wider text-[11px] text-amber-800 dark:text-amber-300">
            [Modo Offline Parcial] Venta Guardada en Dispositivo:
          </span>{' '}
          Comprobante provisional{' '}
          <span className="font-mono font-bold bg-amber-200/80 dark:bg-amber-900 px-1 py-0.5 rounded">
            {lastReceipt.receiptNumber}
          </span>{' '}
          por{' '}
          <strong className="font-bold">
            ${lastReceipt.totalPesos.toLocaleString('es-AR')}
          </strong>
          {lastReceipt.discountApplied > 0 &&
            ` (Descuento ${lastReceipt.discountApplied}% aplicado)`}
          {lastReceipt.cardPlan && ` • Plan: ${lastReceipt.cardPlan}`}.{' '}
          <span className="italic text-amber-700 dark:text-amber-300">
            Se sincronizará automáticamente con MongoDB Atlas en cuanto se restablezca la conexión a internet.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="justi-alert-success flex items-start sm:items-center gap-2">
      <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5 sm:mt-0" />
      <span>
        <strong>Venta Registrada (ACID):</strong> Comprobante{' '}
        <span className="font-mono font-bold">
          {lastReceipt.receiptNumber}
        </span>{' '}
        por{' '}
        <strong>
          ${lastReceipt.totalPesos.toLocaleString('es-AR')}
        </strong>
        {lastReceipt.discountApplied > 0 &&
          ` (Descuento CRM ${lastReceipt.discountApplied}% consumido automáticamente)`}
        {lastReceipt.cardPlan && (
          <>
            {' '}• <strong>Plan Tarjeta:</strong> {lastReceipt.cardPlan}
          </>
        )}
        .
      </span>
    </div>
  );
};

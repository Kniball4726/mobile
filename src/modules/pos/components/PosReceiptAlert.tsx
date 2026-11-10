import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface PosReceiptAlertProps {
  lastReceipt: {
    receiptNumber: string;
    totalPesos: number;
    discountApplied: number;
    cardPlan?: string;
  } | null;
}

export const PosReceiptAlert: React.FC<PosReceiptAlertProps> = ({
  lastReceipt,
}) => {
  if (!lastReceipt) return null;

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

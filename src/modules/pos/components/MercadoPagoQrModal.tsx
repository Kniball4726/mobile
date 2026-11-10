import React, { useEffect, useState } from 'react';
import { QrCode, RefreshCw, CheckCircle2, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { SalesApi } from '../../../services/api.service';

interface MercadoPagoQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  totalPesos: number;
  onPaymentApproved: (paymentDetails: { paymentId?: string; reference: string }) => void;
}

export const MercadoPagoQrModal: React.FC<MercadoPagoQrModalProps> = ({
  isOpen,
  onClose,
  token,
  totalPesos,
  onPaymentApproved,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [initPoint, setInitPoint] = useState<string | null>(null);
  const [externalReference, setExternalReference] = useState<string>('');
  const [isApproved, setIsApproved] = useState(false);
  const [polling, setPolling] = useState(false);
  const [approvedDetails, setApprovedDetails] = useState<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setQrImageUrl(null);
      setInitPoint(null);
      setExternalReference('');
      setIsApproved(false);
      setPolling(false);
      setError(null);
      setApprovedDetails(null);
      return;
    }

    const generateOrder = async () => {
      setLoading(true);
      setError(null);
      const extRef = `MP-POS-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      setExternalReference(extRef);

      try {
        const res = await SalesApi.createMercadoPagoQr(token, {
          totalPesos,
          title: `Suplementos JustiMobile ($${totalPesos.toLocaleString('es-AR')})`,
          externalReference: extRef,
        });

        if (!res.isAvailable) {
          setError(
            res.message ||
              'Mercado Pago no está habilitado o no tiene credenciales configuradas por el usuario MASTER.',
          );
          setLoading(false);
          return;
        }

        setQrImageUrl(res.qrImageUrl || null);
        setInitPoint(res.initPoint || null);
        setPolling(true);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : 'Error al contactar pasarela de Mercado Pago.',
        );
      } finally {
        setLoading(false);
      }
    };

    generateOrder();
  }, [isOpen, token, totalPesos]);

  // Polling del estado de pago cada 3.5 segundos mientras esté pendiente
  useEffect(() => {
    if (!polling || !externalReference || isApproved) return;

    const interval = setInterval(async () => {
      try {
        const statusRes = await SalesApi.checkMercadoPagoStatus(
          token,
          externalReference,
        );
        if (statusRes.isPaid && statusRes.status === 'approved') {
          setIsApproved(true);
          setPolling(false);
          setApprovedDetails(statusRes);
        }
      } catch {
        // Ignorar errores transitorios de polling
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [polling, externalReference, isApproved, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm rounded-lg border border-[#009EE3] bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col transition-colors">
        {/* Cabecera Mercado Pago */}
        <div className="bg-[#009EE3] text-white px-4 py-3 flex items-center justify-between font-bold text-sm">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            <span>Cobro QR Mercado Pago</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 flex flex-col items-center text-center space-y-3.5">
          <div className="w-full bg-[#EBF7FD] dark:bg-sky-950/40 border border-[#BCE4FA] dark:border-sky-800 rounded p-2.5">
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Monto total a cobrar:
            </p>
            <p className="text-2xl font-black text-[#009EE3] tracking-tight">
              ${totalPesos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
              Ref: {externalReference}
            </p>
          </div>

          {loading && (
            <div className="py-8 flex flex-col items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <RefreshCw className="h-7 w-7 text-[#009EE3] animate-spin" />
              <span>Generando código QR interoperable con Mercado Pago...</span>
            </div>
          )}

          {error && (
            <div className="justi-alert-error text-left text-xs w-full">
              <p className="font-bold mb-1">Aviso de Configuración:</p>
              <p>{error}</p>
              <p className="text-[10px] mt-2 italic text-slate-600 dark:text-slate-400">
                Puede confirmar el pago manualmente si el cliente ya abonó en el mostrador mediante QR estático o transferencia.
              </p>
            </div>
          )}

          {!loading && !error && qrImageUrl && !isApproved && (
            <div className="flex flex-col items-center space-y-2">
              <div className="p-2.5 rounded-lg border-2 border-[#009EE3] bg-white shadow-md">
                <img
                  src={qrImageUrl}
                  alt="QR Mercado Pago"
                  className="h-52 w-52 object-contain"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 animate-pulse">
                <RefreshCw className="h-3.5 w-3.5 text-[#009EE3] animate-spin" />
                <span>Esperando escaneo y pago del cliente...</span>
              </div>

              {initPoint && (
                <a
                  href={initPoint}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#009EE3] hover:underline"
                >
                  Abrir link de pago directo en Mercado Pago
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {isApproved && (
            <div className="w-full p-4 rounded-lg border border-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 flex flex-col items-center gap-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-bounce" />
              <p className="font-black text-sm">¡Pago Aprobado en Mercado Pago!</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-mono">
                ID Pago: {approvedDetails?.paymentId || 'Aprobado'}
              </p>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="w-full flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            {isApproved ? (
              <button
                type="button"
                onClick={() =>
                  onPaymentApproved({
                    paymentId: approvedDetails?.paymentId,
                    reference: `QR MP Aprobado (${approvedDetails?.paymentId || externalReference})`,
                  })
                }
                className="w-full py-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition active:scale-98 flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Confirmar y Finalizar Venta</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() =>
                    onPaymentApproved({
                      reference: `QR MP Mostrador (${externalReference})`,
                    })
                  }
                  className="w-full py-2 rounded border border-[#009EE3] text-[#009EE3] hover:bg-[#009EE3]/10 font-bold text-xs shadow-sm transition active:scale-98"
                >
                  Confirmar Cobro Manual (Visto en App MP)
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium"
                >
                  Cancelar / Cambiar forma de pago
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

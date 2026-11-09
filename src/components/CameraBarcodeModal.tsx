import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, Barcode, Sparkles } from 'lucide-react';

interface CameraBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (barcode: string) => void;
}

const SAMPLE_ULTRATECH_BARCODES = [
  { code: '7798139070010', label: 'Whey Protein 1 Kg (Cód: 103)' },
  { code: '7798139074520', label: 'Tri Protein 1 Kg (Cód: 235)' },
  { code: '7798139074186', label: 'Pastillero Ultra Tech (Cód: 214)' },
  { code: '7798139070270', label: 'Creatina Micronizada 300g (Cód: 120)' },
];

export const CameraBarcodeModal: React.FC<CameraBarcodeModalProps> = ({
  isOpen,
  onClose,
  onDetected,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    let stream: MediaStream | null = null;
    let animationFrameId: number | null = null;
    let isCancelled = false;

    async function startCamera() {
      setCameraError(null);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (videoRef.current && !isCancelled) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Uso de BarcodeDetector nativo en Chrome Android / Safari iOS moderno
        const AnyWindow = window as unknown as {
          BarcodeDetector?: new (opts: { formats: string[] }) => {
            detect: (
              video: HTMLVideoElement,
            ) => Promise<Array<{ rawValue: string }>>;
          };
        };

        if (AnyWindow.BarcodeDetector) {
          const detector = new AnyWindow.BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a'],
          });

          const scanLoop = async () => {
            if (isCancelled || !videoRef.current) return;
            try {
              if (videoRef.current.readyState >= 2) {
                const results = await detector.detect(videoRef.current);
                if (results && results.length > 0 && results[0].rawValue) {
                  onDetected(results[0].rawValue);
                  onClose();
                  return;
                }
              }
            } catch {
              // Ignorar fotogramas intermedios
            }
            animationFrameId = requestAnimationFrame(scanLoop);
          };

          animationFrameId = requestAnimationFrame(scanLoop);
        }
      } catch {
        setCameraError(
          'No se pudo acceder a la cámara o el permiso fue denegado. Puedes usar los códigos de prueba o ingresar el EAN-13 manualmente.',
        );
      }
    }

    startCamera();

    return () => {
      isCancelled = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, onClose, onDetected]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md overflow-hidden rounded border border-[#4E8EC2] bg-[#E8F2FC] shadow-2xl">
        {/* Cabecera estilo Justi */}
        <div className="flex items-center justify-between bg-[#4E8EC2] px-4 py-2.5 text-white">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Camera className="h-4 w-4" />
            <span>Lector de Código de Barras (Cámara / EAN-13)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Visor de cámara */}
          <div className="relative aspect-video w-full overflow-hidden rounded border border-[#80AED8] bg-slate-900">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
            />
            {/* Guía láser */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="h-28 w-3/4 rounded border-2 border-emerald-400/80 relative">
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444]" />
              </div>
              <span className="mt-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">
                Apunta al código EAN-13 del suplemento Ultra Tech
              </span>
            </div>
          </div>

          {cameraError && (
            <div className="justi-alert-error text-xs">{cameraError}</div>
          )}

          {/* Entrada manual o rápida */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualCode.trim()) {
                onDetected(manualCode.trim());
                onClose();
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Ej: 7798139070010 o SKU 103..."
              className="justi-input flex-1"
              autoFocus
            />
            <button type="submit" className="justi-btn-primary">
              <Barcode className="mr-1 h-4 w-4" />
              Cargar
            </button>
          </form>

          {/* Simulador rápido con productos reales de ultratechrun.xlsx */}
          <div className="rounded border border-[#B8D4EC] bg-white p-2.5">
            <div className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#1B5E91]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Simular lectura rápida (Catálogo Ultra Tech):</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {SAMPLE_ULTRATECH_BARCODES.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    onDetected(item.code);
                    onClose();
                  }}
                  className="flex items-center justify-between rounded border border-[#9CC2E5] bg-[#E8F2FC] px-2.5 py-1.5 text-left text-xs hover:bg-[#D3E7F8]"
                >
                  <span className="font-semibold text-[#1B5E91]">
                    {item.label}
                  </span>
                  <span className="font-mono text-[11px] text-slate-600">
                    {item.code}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

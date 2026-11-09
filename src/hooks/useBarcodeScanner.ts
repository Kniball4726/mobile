import { useEffect, useRef } from 'react';

interface UseBarcodeScannerOptions {
  onScan: (code: string) => void;
  enabled?: boolean;
}

/**
 * Detecta ráfagas rápidas de teclas provenientes de lectores de código de barras
 * físicos (USB HID o Bluetooth HID) que terminan con Enter.
 */
export function useBarcodeScanner({
  onScan,
  enabled = true,
}: UseBarcodeScannerOptions) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT');

      // Si el usuario está escribiendo dentro de un input que NO es el de código, no interceptar
      if (isInputFocused && !target.dataset.barcodeInput) {
        return;
      }

      const now = Date.now();
      const elapsed = now - lastKeyTimeRef.current;

      if (elapsed > 85) {
        bufferRef.current = '';
      }

      if (e.key === 'Enter') {
        if (bufferRef.current.trim().length >= 3) {
          e.preventDefault();
          const scanned = bufferRef.current.trim();
          bufferRef.current = '';
          onScan(scanned);
        }
        return;
      }

      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        bufferRef.current += e.key;
        lastKeyTimeRef.current = now;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onScan]);
}

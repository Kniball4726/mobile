import React from 'react';
import { DollarSign, X } from 'lucide-react';
import { ProductItem } from '../../../types/domain.types';

interface ProductQuickPriceModalProps {
  product: ProductItem | null;
  priceValue: string;
  setPriceValue: (val: string) => void;
  costValue: string;
  setCostValue: (val: string) => void;
  saving: boolean;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const ProductQuickPriceModal: React.FC<ProductQuickPriceModalProps> = ({
  product,
  priceValue,
  setPriceValue,
  costValue,
  setCostValue,
  saving,
  onSave,
  onClose,
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3">
      <div className="w-full max-w-sm rounded border border-[#4E8EC2] bg-[#E8F2FC] shadow-2xl overflow-hidden">
        <div className="bg-[#4E8EC2] px-4 py-2.5 text-white flex items-center justify-between">
          <span className="font-bold text-sm flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" />
            Modificar Precio de Venta
          </span>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-white/20 p-1 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSave} className="p-4 space-y-3">
          <div>
            <span className="text-[11px] font-bold text-slate-500 font-mono">
              SKU: {product.sku}
            </span>
            <h4 className="text-sm font-extrabold text-[#1B5E91]">
              {product.name}
            </h4>
          </div>

          <div className="border-t border-slate-300 pt-3 space-y-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Nuevo Precio de Venta ($ ARS) *:
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-sm font-bold text-slate-600">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  autoFocus
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                  placeholder="0.00"
                  className="justi-input w-full pl-7 pr-3 text-right font-black text-lg text-emerald-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Costo de Adquisición ($ ARS) - Opcional:
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-xs text-slate-500">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={costValue}
                  onChange={(e) => setCostValue(e.target.value)}
                  placeholder="0.00"
                  className="justi-input w-full pl-7 pr-3 text-right text-xs"
                />
              </div>
            </div>
          </div>

          <div className="rounded border border-[#9CC2E5] bg-[#DCEAF7] p-2 text-[11px] text-[#1B5E91] leading-snug">
            El nuevo precio impactará de inmediato en el cobro del POS y en
            la base de datos de MongoDB Atlas.
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="justi-btn-primary py-2 font-bold"
            >
              {saving ? 'Guardando...' : 'Guardar Precio'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="justi-btn-primary py-2"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

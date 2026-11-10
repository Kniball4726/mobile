import React from 'react';
import { X } from 'lucide-react';
import { CategoryItem, ProductItem } from '../../../types/domain.types';

interface ProductFormModalProps {
  isOpen: boolean;
  editingProduct: ProductItem | null;
  formName: string;
  setFormName: (val: string) => void;
  formSku: string;
  setFormSku: (val: string) => void;
  formBarcode: string;
  setFormBarcode: (val: string) => void;
  formCategoryId: string;
  setFormCategoryId: (val: string) => void;
  formPrice: string;
  setFormPrice: (val: string) => void;
  formCost: string;
  setFormCost: (val: string) => void;
  formStock: string;
  setFormStock: (val: string) => void;
  formMinStock: string;
  setFormMinStock: (val: string) => void;
  formUnit: 'UNIT' | 'KG' | 'LITER';
  setFormUnit: (val: 'UNIT' | 'KG' | 'LITER') => void;
  categories: CategoryItem[];
  saving: boolean;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  editingProduct,
  formName,
  setFormName,
  formSku,
  setFormSku,
  formBarcode,
  setFormBarcode,
  formCategoryId,
  setFormCategoryId,
  formPrice,
  setFormPrice,
  formCost,
  setFormCost,
  formStock,
  setFormStock,
  formMinStock,
  setFormMinStock,
  formUnit,
  setFormUnit,
  categories,
  saving,
  onSave,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 overflow-y-auto">
      <div className="w-full max-w-lg rounded border border-[#4E8EC2] bg-[#E8F2FC] shadow-2xl overflow-hidden my-4">
        <div className="bg-[#4E8EC2] px-4 py-2.5 text-white flex items-center justify-between">
          <span className="font-bold text-sm">
            {editingProduct
              ? `Editar Producto: ${editingProduct.sku}`
              : 'Nuevo Producto en Catálogo'}
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
            <label className="block text-xs font-bold text-[#1B5E91] mb-1">
              Nombre / Descripción del Artículo *:
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ej: CREATINA MONOHIDRATO 300G"
              className="justi-input w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                Código SKU *:
              </label>
              <input
                type="text"
                required
                value={formSku}
                onChange={(e) => setFormSku(e.target.value)}
                placeholder="Ej: 301 o CREA-300"
                className="justi-input w-full uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                Código de Barras (EAN):
              </label>
              <input
                type="text"
                value={formBarcode}
                onChange={(e) => setFormBarcode(e.target.value)}
                placeholder="7798123456789"
                className="justi-input w-full font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                Categoría *:
              </label>
              <select
                value={formCategoryId}
                onChange={(e) => setFormCategoryId(e.target.value)}
                className="justi-select w-full"
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                Unidad de Medida:
              </label>
              <select
                value={formUnit}
                onChange={(e) =>
                  setFormUnit(e.target.value as 'UNIT' | 'KG' | 'LITER')
                }
                className="justi-select w-full"
              >
                <option value="UNIT">Unidad (UNIT)</option>
                <option value="KG">Kilogramo (KG)</option>
                <option value="LITER">Litro (LITER)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-300">
            <div>
              <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                Precio Venta ($ ARS) *:
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="0.00"
                className="justi-input w-full font-bold text-emerald-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                Costo ($ ARS):
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formCost}
                onChange={(e) => setFormCost(e.target.value)}
                placeholder="0.00"
                className="justi-input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                {editingProduct ? 'Stock Actual:' : 'Stock Inicial:'}
              </label>
              <input
                type="number"
                min="0"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                className="justi-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1B5E91] mb-1">
                Alerta Stock Mínimo:
              </label>
              <input
                type="number"
                min="0"
                value={formMinStock}
                onChange={(e) => setFormMinStock(e.target.value)}
                className="justi-input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3">
            <button
              type="submit"
              disabled={saving}
              className="justi-btn-primary py-2 font-bold"
            >
              {saving ? 'Guardando...' : 'Guardar Producto'}
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

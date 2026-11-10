import React from 'react';
import { X } from 'lucide-react';
import { BranchType, CustomerItem } from '../../../types/domain.types';

interface CustomerModalProps {
  isOpen: boolean;
  editingCustomer: CustomerItem | null;
  formFullName: string;
  setFormFullName: (val: string) => void;
  formEmail: string;
  setFormEmail: (val: string) => void;
  formDiscount: string;
  setFormDiscount: (val: string) => void;
  selectedBranch: BranchType;
  setSelectedBranch: (val: BranchType) => void;
  userBranch: BranchType;
  isBranchLocked: boolean;
  saving: boolean;
  onSave: (e: React.FormEvent) => void;
  onClose: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  editingCustomer,
  formFullName,
  setFormFullName,
  formEmail,
  setFormEmail,
  formDiscount,
  setFormDiscount,
  selectedBranch,
  setSelectedBranch,
  userBranch,
  isBranchLocked,
  saving,
  onSave,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
      <div className="w-full max-w-md overflow-hidden rounded border border-[#4E8EC2] bg-[#E8F2FC] shadow-2xl">
        <div className="flex items-center justify-between bg-[#4E8EC2] px-4 py-2.5 text-white">
          <span className="text-sm font-bold">
            {editingCustomer
              ? 'Actualizar Descuento CRM (1 Uso)'
              : 'Agregar Cliente CRM con Descuento'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSave} className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#1B5E91] mb-1">
              Nombres y Apellidos del Cliente *:
            </label>
            <input
              type="text"
              required
              disabled={Boolean(editingCustomer)}
              value={formFullName}
              onChange={(e) => setFormFullName(e.target.value)}
              placeholder="Ej: Alejandro Briozzo"
              className="justi-input w-full disabled:bg-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B5E91] mb-1">
              Correo Electrónico (Email) *:
            </label>
            <input
              type="email"
              required
              disabled={Boolean(editingCustomer)}
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="cliente@dominio.com"
              className="justi-input w-full disabled:bg-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B5E91] mb-1">
              Sucursal Asignada:
            </label>
            <select
              value={isBranchLocked ? userBranch : selectedBranch}
              disabled={isBranchLocked}
              onChange={(e) =>
                setSelectedBranch(e.target.value as BranchType)
              }
              className="justi-select w-full font-bold disabled:bg-slate-200 disabled:text-slate-700 disabled:cursor-not-allowed"
            >
              <option value="LOCALES">LOCALES</option>
              <option value="CARRERAS">CARRERAS</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1B5E91] mb-1">
              Descuento habilitado de un solo uso (0% a 100%) *:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                step={0.5}
                required
                value={formDiscount}
                onChange={(e) => setFormDiscount(e.target.value)}
                className="justi-input w-28 font-bold text-emerald-800"
              />
              <span className="text-xs text-slate-600">
                % (Se consumirá al cobrar en Caja)
              </span>
            </div>
          </div>

          <div className="rounded border border-[#9CC2E5] bg-[#DCEAF7] p-2 text-[11px] text-[#1B5E91]">
            <strong>Fecha y Hora Automática:</strong> El servidor registrará
            automáticamente el instante exacto de asignación en MongoDB
            Atlas.
          </div>

          <div className="justi-bottom-action-box grid grid-cols-2 gap-2 mt-3">
            <button
              type="submit"
              disabled={saving}
              className="justi-btn-primary py-2 font-bold"
            >
              {saving ? 'Guardando...' : 'Guardar'}
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

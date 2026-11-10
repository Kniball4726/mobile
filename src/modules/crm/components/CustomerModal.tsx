import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, CheckCircle2, Percent, Sparkles, Building2 } from 'lucide-react';
import { BranchType, CustomerItem } from '../../../types/domain.types';

const COMMON_DOMAINS = [
  '@gmail.com',
  '@hotmail.com',
  '@outlook.com',
  '@yahoo.com',
  '@icloud.com',
  '@live.com',
  'OTRO',
] as const;

const QUICK_DISCOUNTS = [5, 10, 15, 20, 25];

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
  const [emailUsername, setEmailUsername] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('@gmail.com');
  const [customDomain, setCustomDomain] = useState('');

  // Sincronizar estado inicial al abrir modal
  useEffect(() => {
    if (!isOpen) return;

    if (editingCustomer) {
      setEmailUsername(editingCustomer.email);
    } else {
      if (formEmail && formEmail.includes('@')) {
        const [u, ...rest] = formEmail.split('@');
        const d = '@' + rest.join('@');
        setEmailUsername(u);
        const match = COMMON_DOMAINS.find(
          (dom) => dom.toLowerCase() === d.toLowerCase(),
        );
        if (match && match !== 'OTRO') {
          setSelectedDomain(match);
        } else {
          setSelectedDomain('OTRO');
          setCustomDomain(d);
        }
      } else {
        setEmailUsername(formEmail || '');
        setSelectedDomain('@gmail.com');
        setCustomDomain('');
        if (formEmail) {
          setFormEmail(`${formEmail}@gmail.com`.toLowerCase());
        }
      }
    }
  }, [isOpen, editingCustomer]);

  const updateUnifiedEmail = (u: string, dom: string, customDom: string) => {
    const trimmedU = u.trim();
    if (!trimmedU) {
      setFormEmail('');
      return;
    }
    if (dom === 'OTRO') {
      const trimmedCustom = customDom.trim();
      if (!trimmedCustom) {
        setFormEmail(trimmedU.toLowerCase());
      } else {
        const fullDom = trimmedCustom.startsWith('@')
          ? trimmedCustom
          : `@${trimmedCustom}`;
        setFormEmail(`${trimmedU}${fullDom}`.toLowerCase());
      }
    } else {
      setFormEmail(`${trimmedU}${dom}`.toLowerCase());
    }
  };

  const handleUsernameChange = (val: string) => {
    // Detección inteligente si el usuario pega un correo completo con @
    if (val.includes('@')) {
      const [u, ...dParts] = val.split('@');
      const d = '@' + dParts.join('@');
      setEmailUsername(u);
      const match = COMMON_DOMAINS.find(
        (dom) => dom.toLowerCase() === d.toLowerCase(),
      );
      if (match && match !== 'OTRO') {
        setSelectedDomain(match);
        setFormEmail(`${u}${match}`.toLowerCase());
      } else {
        setSelectedDomain('OTRO');
        setCustomDomain(d);
        setFormEmail(`${u}${d}`.toLowerCase());
      }
    } else {
      setEmailUsername(val);
      updateUnifiedEmail(val, selectedDomain, customDomain);
    }
  };

  const handleDomainChange = (newDomain: string) => {
    setSelectedDomain(newDomain);
    updateUnifiedEmail(emailUsername, newDomain, customDomain);
  };

  const handleCustomDomainChange = (newCustomDomain: string) => {
    setCustomDomain(newCustomDomain);
    updateUnifiedEmail(emailUsername, 'OTRO', newCustomDomain);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
      <div className="w-full max-w-md overflow-hidden rounded border border-[#4E8EC2] bg-[#E8F2FC] dark:bg-slate-900 shadow-2xl transition-colors">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between bg-[#4E8EC2] px-4 py-2.5 text-white">
          <span className="text-sm font-bold flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-amber-300" />
            {editingCustomer
              ? 'Actualizar Descuento CRM (1 Uso)'
              : 'Agregar Cliente CRM con Descuento'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-white/20 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSave} className="p-4 space-y-3.5">
          {/* Nombres y Apellidos */}
          <div>
            <label className="block text-xs font-bold text-[#1B5E91] dark:text-sky-300 mb-1">
              Nombres y Apellidos del Cliente *:
            </label>
            <input
              type="text"
              required
              disabled={Boolean(editingCustomer)}
              value={formFullName}
              onChange={(e) => setFormFullName(e.target.value)}
              placeholder="Ej: Alejandro Briozzo"
              className="justi-input w-full disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
            />
          </div>

          {/* Campo de Correo con Selector de Dominio Enum y Previsualización Bloqueada */}
          <div>
            <label className="block text-xs font-bold text-[#1B5E91] dark:text-sky-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-[#1B5E91] dark:text-sky-400" />
                Correo Electrónico (Email) *:
              </span>
              {!editingCustomer && (
                <span className="text-[10px] text-slate-500 font-normal">
                  Nombre + Dominio Enum
                </span>
              )}
            </label>

            {editingCustomer ? (
              <input
                type="text"
                disabled
                value={formEmail}
                className="justi-input w-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs cursor-not-allowed"
              />
            ) : (
              <div className="space-y-1.5">
                {/* Fila: Nombre del Correo + Dropdown de Dominios Comunes */}
                <div className="grid grid-cols-12 gap-1.5">
                  <div className="col-span-7">
                    <input
                      type="text"
                      required
                      value={emailUsername}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="Ej: alejandro.briozzo"
                      className="justi-input w-full text-xs font-medium"
                    />
                  </div>
                  <div className="col-span-5">
                    <select
                      value={selectedDomain}
                      onChange={(e) => handleDomainChange(e.target.value)}
                      className="justi-select w-full text-xs font-bold text-[#1B5E91] dark:text-sky-300"
                    >
                      <option value="@gmail.com">@gmail.com</option>
                      <option value="@hotmail.com">@hotmail.com</option>
                      <option value="@outlook.com">@outlook.com</option>
                      <option value="@yahoo.com">@yahoo.com</option>
                      <option value="@icloud.com">@icloud.com</option>
                      <option value="@live.com">@live.com</option>
                      <option value="OTRO">Otro dominio...</option>
                    </select>
                  </div>
                </div>

                {/* Si seleccionó OTRO dominio, input complementario */}
                {selectedDomain === 'OTRO' && (
                  <div>
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => handleCustomDomainChange(e.target.value)}
                      placeholder="Escriba el dominio (ej: @miempresa.com o @arnet.com.ar)"
                      className="justi-input w-full text-xs"
                    />
                  </div>
                )}

                {/* Campo Bloqueado / Read-Only con el Correo Unificado y Concatenado */}
                <div className="rounded border border-[#9CC2E5] dark:border-slate-700 bg-white dark:bg-slate-800/80 p-2 space-y-1 shadow-xs">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3 text-slate-500" />
                      Correo Unificado (Registrado en el Sistema):
                    </span>
                    {isValidEmail(formEmail) && (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-0.5 text-[10px]">
                        <CheckCircle2 className="h-3 w-3" /> Formato Válido
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    readOnly
                    tabIndex={-1}
                    value={formEmail}
                    placeholder="Complete el nombre para ver el correo concatenado..."
                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-xs font-mono font-bold text-[#1B5E91] dark:text-sky-300 cursor-not-allowed select-all"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sucursal Asignada */}
          <div>
            <label className="block text-xs font-bold text-[#1B5E91] dark:text-sky-300 mb-1 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-[#1B5E91] dark:text-sky-400" />
              Sucursal Asignada:
            </label>
            <select
              value={isBranchLocked ? userBranch : selectedBranch}
              disabled={isBranchLocked}
              onChange={(e) => setSelectedBranch(e.target.value as BranchType)}
              className="justi-select w-full font-bold disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-700 dark:disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              <option value="LOCALES">LOCALES</option>
              <option value="CARRERAS">CARRERAS</option>
            </select>
          </div>

          {/* Descuento CRM con Botones de Acceso Rápido (5%, 10%, 15%, 20%, 25%) */}
          <div>
            <label className="block text-xs font-bold text-[#1B5E91] dark:text-sky-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Percent className="h-3.5 w-3.5 text-[#1B5E91] dark:text-sky-400" />
                Descuento de 1 solo uso *:
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                Toque rápido o ingrese valor
              </span>
            </label>

            {/* Fila de Botones Rápidos */}
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {QUICK_DISCOUNTS.map((pct) => {
                const isSelected = Number(formDiscount) === pct;
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setFormDiscount(String(pct))}
                    className={`py-1.5 text-xs font-extrabold rounded border transition active:scale-95 flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#1B5E91] text-white border-[#1B5E91] shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#9CC2E5] dark:border-slate-700 hover:bg-[#DCEAF7] dark:hover:bg-slate-700'
                    }`}
                  >
                    {pct}%
                  </button>
                );
              })}
            </div>

            {/* Input Manual y Detalle */}
            <div className="flex items-center gap-2">
              <div className="relative w-28">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  required
                  value={formDiscount}
                  onChange={(e) => setFormDiscount(e.target.value)}
                  className="justi-input w-full font-bold text-emerald-800 dark:text-emerald-400 pr-6"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  %
                </span>
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Se consumirá al cobrar en mostrador
              </span>
            </div>
          </div>

          {/* Nota Informativa */}
          <div className="rounded border border-[#9CC2E5] dark:border-slate-700 bg-[#DCEAF7] dark:bg-slate-800/60 p-2 text-[11px] text-[#1B5E91] dark:text-sky-300">
            <strong>Fecha y Hora Automática:</strong> El servidor registrará
            automáticamente el instante exacto de asignación en MongoDB Atlas.
          </div>

          {/* Botones de Acción */}
          <div className="justi-bottom-action-box grid grid-cols-2 gap-2 mt-3">
            <button
              type="submit"
              disabled={saving || (!editingCustomer && !isValidEmail(formEmail))}
              className="justi-btn-primary py-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Guardar Cliente'}
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

import React from 'react';
import { Key, Copy, Check } from 'lucide-react';

interface ApiKeyCreateCardProps {
  newKeyName: string;
  setNewKeyName: (val: string) => void;
  selectedScopes: string[];
  toggleScope: (scope: string) => void;
  createdPlaintextKey: string | null;
  copied: boolean;
  onCopyKey: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const AVAILABLE_SCOPES = [
  'crm:read',
  'crm:write',
  'catalog:read',
  'catalog:write',
  'sales:read',
  'sales:write',
];

export const ApiKeyCreateCard: React.FC<ApiKeyCreateCardProps> = ({
  newKeyName,
  setNewKeyName,
  selectedScopes,
  toggleScope,
  createdPlaintextKey,
  copied,
  onCopyKey,
  onSubmit,
}) => {
  return (
    <div className="border border-[#80AED8] bg-[#E8F2FC]">
      <div className="justi-section-header flex items-center gap-1.5">
        <Key className="h-4 w-4" />
        <span>Llaves de Integración Externa (X-API-Key)</span>
      </div>

      <form onSubmit={onSubmit} className="p-3 space-y-3 text-xs">
        <div>
          <label className="block font-bold text-[#1B5E91] mb-1">
            Nombre del Sistema Externo (ERP / E-Commerce / Bot):
          </label>
          <input
            type="text"
            required
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Ej: ERP Central / Tienda Nube"
            className="justi-input w-full"
          />
        </div>

        <div>
          <span className="block font-bold text-[#1B5E91] mb-1">
            Permisos (Scopes):
          </span>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_SCOPES.map((scope) => (
              <label
                key={scope}
                className="inline-flex items-center gap-1 rounded border border-[#9CC2E5] bg-white px-2 py-0.5 text-[11px] cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedScopes.includes(scope)}
                  onChange={() => toggleScope(scope)}
                />
                <span className="font-mono">{scope}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" className="justi-btn-primary">
          Generar Nueva API Key
        </button>

        {createdPlaintextKey && (
          <div className="rounded border border-emerald-500 bg-emerald-50 p-2.5 text-xs">
            <p className="font-bold text-emerald-900 mb-1">
              Copie su X-API-Key ahora (solo se muestra una vez):
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded bg-white p-1.5 font-mono text-[11px] border border-emerald-300">
                {createdPlaintextKey}
              </code>
              <button
                type="button"
                onClick={onCopyKey}
                className="justi-btn-primary"
                title="Copiar al portapapeles"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-700" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

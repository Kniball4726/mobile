import React from 'react';
import { ApiKeyRecord } from '../../../types/domain.types';

interface ApiKeysTableProps {
  apiKeys: ApiKeyRecord[];
  onRevokeKey: (id: string) => void;
}

export const ApiKeysTable: React.FC<ApiKeysTableProps> = ({
  apiKeys,
  onRevokeKey,
}) => {
  return (
    <div className="border border-[#80AED8] bg-white overflow-x-auto">
      <div className="justi-section-header">API Keys Registradas</div>
      <table className="w-full border-collapse text-xs text-left">
        <thead>
          <tr className="bg-[#DCEAF7] text-[#1B5E91] border-b border-[#80AED8]">
            <th className="py-1.5 px-2">Nombre</th>
            <th className="py-1.5 px-2">Prefijo</th>
            <th className="py-1.5 px-2">Scopes</th>
            <th className="py-1.5 px-2">Estado</th>
            <th className="py-1.5 px-2 text-center">Acción</th>
          </tr>
        </thead>
        <tbody>
          {apiKeys.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="py-4 text-center text-slate-500 italic text-xs"
              >
                No hay claves API registradas.
              </td>
            </tr>
          ) : (
            apiKeys.map((k, idx) => {
              const keyId = k._id || k.id || String(idx);
              return (
                <tr
                  key={keyId}
                  className={`border-b border-slate-200 ${
                    idx % 2 === 0
                      ? 'justi-table-row-even'
                      : 'justi-table-row-odd'
                  }`}
                >
                  <td className="py-1.5 px-2 font-bold">{k.name}</td>
                  <td className="py-1.5 px-2 font-mono">{k.keyPrefix}...</td>
                  <td className="py-1.5 px-2 font-mono text-[11px]">
                    {k.scopes.join(', ')}
                  </td>
                  <td className="py-1.5 px-2">
                    {k.isActive !== false ? (
                      <span className="font-bold text-emerald-700">ACTIVA</span>
                    ) : (
                      <span className="font-bold text-red-700">REVOCADA</span>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-center">
                    {k.isActive !== false && (
                      <button
                        type="button"
                        onClick={() => onRevokeKey(keyId)}
                        className="justi-btn-primary text-[11px] py-0.5 px-2"
                      >
                        Revocar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

import React from 'react';
import { AuditLogRecord } from '../../../types/domain.types';
import { ScrollText } from 'lucide-react';

interface AuditLogsTableProps {
  auditLogs: AuditLogRecord[];
}

export const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ auditLogs }) => {
  return (
    <div className="border border-[#80AED8] bg-white overflow-x-auto">
      <div className="justi-section-header flex items-center gap-1.5">
        <ScrollText className="h-4 w-4" />
        <span>Bitácora de Auditoría Inmutable (audit_logs)</span>
      </div>
      <table className="w-full border-collapse text-xs text-left">
        <thead>
          <tr className="bg-[#DCEAF7] text-[#1B5E91] border-b border-[#80AED8]">
            <th className="py-1.5 px-2">Fecha / Hora</th>
            <th className="py-1.5 px-2">Acción</th>
            <th className="py-1.5 px-2">Actor</th>
            <th className="py-1.5 px-2">Colección</th>
          </tr>
        </thead>
        <tbody>
          {auditLogs.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="py-4 text-center text-slate-500 italic text-xs"
              >
                No hay eventos de auditoría registrados.
              </td>
            </tr>
          ) : (
            auditLogs.slice(0, 15).map((log, idx) => (
              <tr
                key={log._id}
                className={`border-b border-slate-200 ${
                  idx % 2 === 0
                    ? 'justi-table-row-even'
                    : 'justi-table-row-odd'
                }`}
              >
                <td className="py-1.5 px-2 font-mono text-[11px]">
                  {new Date(log.createdAt).toLocaleString('es-AR')}
                </td>
                <td className="py-1.5 px-2 font-bold text-[#1B5E91]">
                  {log.action}
                </td>
                <td className="py-1.5 px-2">{log.actorIdentifier}</td>
                <td className="py-1.5 px-2 font-mono">
                  {log.targetCollection || '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

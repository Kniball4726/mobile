import React from 'react';
import { AuditLogRecord } from '../../../types/domain.types';
import { AuditLogsTable } from './AuditLogsTable';

interface AuditTabProps {
  auditLogs: AuditLogRecord[];
}

export const AuditTab: React.FC<AuditTabProps> = ({ auditLogs }) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Bitácora de Auditoría Inmutable */}
      <AuditLogsTable auditLogs={auditLogs} />
    </div>
  );
};

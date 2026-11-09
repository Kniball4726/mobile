import {
  ApiKeyRecord,
  AuditLogRecord,
  GlobalSystemSettings,
} from '../../types/domain.types';
import { request } from './client';

export const MasterApi = {
  getSettings(token: string): Promise<GlobalSystemSettings> {
    return request<GlobalSystemSettings>(
      '/master/settings',
      { method: 'GET' },
      token,
    );
  },

  updateSettings(
    token: string,
    payload: Partial<GlobalSystemSettings>,
  ): Promise<GlobalSystemSettings> {
    return request<GlobalSystemSettings>(
      '/master/settings',
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  listApiKeys(token: string): Promise<ApiKeyRecord[]> {
    return request<ApiKeyRecord[]>('/master/api-keys', { method: 'GET' }, token);
  },

  createApiKey(
    token: string,
    payload: { name: string; scopes: string[]; expiresInDays?: number | null },
  ): Promise<ApiKeyRecord & { warning?: string }> {
    return request(
      '/master/api-keys',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  revokeApiKey(token: string, id: string): Promise<ApiKeyRecord> {
    return request<ApiKeyRecord>(
      `/master/api-keys/${id}/revoke`,
      { method: 'PATCH' },
      token,
    );
  },

  revokeAllSessions(
    token: string,
  ): Promise<{ revokedUsersCount: number; executedAt: string }> {
    return request(
      '/master/security/revoke-all-sessions',
      { method: 'POST' },
      token,
    );
  },

  listAuditLogs(token: string): Promise<AuditLogRecord[]> {
    return request<AuditLogRecord[]>(
      '/master/audit-logs?limit=50',
      { method: 'GET' },
      token,
    );
  },
};

import {
  ApiKeyRecord,
  AuditLogRecord,
  GlobalSystemSettings,
  MaskedAfipSettings,
  MaskedMercadoPagoSettings,
  TestAfipConnectionResult,
  TestMpConnectionResult,
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

  getMercadoPagoSettings(token: string): Promise<MaskedMercadoPagoSettings> {
    return request<MaskedMercadoPagoSettings>(
      '/master/integrations/mercadopago',
      { method: 'GET' },
      token,
    );
  },

  updateMercadoPagoSettings(
    token: string,
    payload: {
      isEnabled: boolean;
      isSandbox: boolean;
      publicKey?: string | null;
      accessToken?: string | null;
      webhookSecret?: string | null;
      posId?: string | null;
      userId?: string | null;
    },
  ): Promise<MaskedMercadoPagoSettings> {
    return request<MaskedMercadoPagoSettings>(
      '/master/integrations/mercadopago',
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  testMercadoPagoConnection(
    token: string,
    accessTokenOverride?: string,
  ): Promise<TestMpConnectionResult> {
    return request<TestMpConnectionResult>(
      '/master/integrations/mercadopago/test-connection',
      {
        method: 'POST',
        body: JSON.stringify({ accessToken: accessTokenOverride }),
      },
      token,
    );
  },

  getAfipSettings(token: string): Promise<MaskedAfipSettings> {
    return request<MaskedAfipSettings>(
      '/master/integrations/afip',
      { method: 'GET' },
      token,
    );
  },

  updateAfipSettings(
    token: string,
    payload: {
      isEnabled: boolean;
      isProduction: boolean;
      cuit?: string | null;
      puntoVenta?: number | null;
      cert?: string | null;
      privateKey?: string | null;
      defaultConcepto?: number;
      defaultCbteTipo?: number;
    },
  ): Promise<MaskedAfipSettings> {
    return request<MaskedAfipSettings>(
      '/master/integrations/afip',
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  testAfipConnection(
    token: string,
    options?: {
      cuitOverride?: string;
      isProductionOverride?: boolean;
    },
  ): Promise<TestAfipConnectionResult> {
    return request<TestAfipConnectionResult>(
      '/master/integrations/afip/test-connection',
      {
        method: 'POST',
        body: JSON.stringify(options || {}),
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
      `/master/api-keys/${encodeURIComponent(id)}/revoke`,
      {
        method: 'PATCH',
        body: JSON.stringify({}),
      },
      token,
    );
  },

  revokeAllSessions(
    token: string,
  ): Promise<{ revokedUsersCount: number; executedAt: string }> {
    return request(
      '/master/security/revoke-all-sessions',
      {
        method: 'POST',
        body: JSON.stringify({}),
      },
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

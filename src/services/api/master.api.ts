import {
  ApiKeyRecord,
  AuditLogRecord,
  CompanyRecord,
  GlobalSystemSettings,
  MaskedAfipSettings,
  MaskedMercadoPagoSettings,
  PublicBrandingInfo,
  TestAfipConnectionResult,
  TestMpConnectionResult,
} from '../../types/domain.types';
import { request } from './client';

export const PublicApi = {
  getBranding(companyId?: string): Promise<PublicBrandingInfo> {
    const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request<PublicBrandingInfo>(`/public/branding${query}`, {
      method: 'GET',
    });
  },
};

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

  getMercadoPagoSettings(
    token: string,
    companyId?: string,
  ): Promise<MaskedMercadoPagoSettings> {
    const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request<MaskedMercadoPagoSettings>(
      `/master/integrations/mercadopago${query}`,
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
    companyId?: string,
  ): Promise<MaskedMercadoPagoSettings> {
    const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request<MaskedMercadoPagoSettings>(
      `/master/integrations/mercadopago${query}`,
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
    companyId?: string,
  ): Promise<TestMpConnectionResult> {
    const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request<TestMpConnectionResult>(
      `/master/integrations/mercadopago/test-connection${query}`,
      {
        method: 'POST',
        body: JSON.stringify({ accessToken: accessTokenOverride }),
      },
      token,
    );
  },

  getAfipSettings(token: string, companyId?: string): Promise<MaskedAfipSettings> {
    const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request<MaskedAfipSettings>(
      `/master/integrations/afip${query}`,
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
    companyId?: string,
  ): Promise<MaskedAfipSettings> {
    const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request<MaskedAfipSettings>(
      `/master/integrations/afip${query}`,
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
    companyId?: string,
  ): Promise<TestAfipConnectionResult> {
    const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request<TestAfipConnectionResult>(
      `/master/integrations/afip/test-connection${query}`,
      {
        method: 'POST',
        body: options ? JSON.stringify(options) : undefined,
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

  listCompanies(token: string): Promise<CompanyRecord[]> {
    return request<CompanyRecord[]>('/master/companies', { method: 'GET' }, token);
  },

  createCompany(
    token: string,
    payload: {
      name: string;
      legalName: string;
      cuit: string;
      email?: string | null;
      phone?: string | null;
      address?: string | null;
      branding?: {
        logoUrl?: string;
        slogan?: string;
        primaryColor?: string;
      };
    },
  ): Promise<CompanyRecord> {
    return request<CompanyRecord>(
      '/master/companies',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  updateCompany(
    token: string,
    id: string,
    payload: Partial<CompanyRecord>,
  ): Promise<CompanyRecord> {
    return request<CompanyRecord>(
      `/master/companies/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  toggleCompanyStatus(token: string, id: string): Promise<CompanyRecord> {
    return request<CompanyRecord>(
      `/master/companies/${encodeURIComponent(id)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({}),
      },
      token,
    );
  },

  updateBranding(
    token: string,
    payload: {
      companyName?: string;
      legalName?: string;
      slogan?: string;
      logoUrl?: string;
      bannerUrl?: string;
      primaryColor?: string;
      customSvg?: string;
    },
    companyId?: string,
  ): Promise<PublicBrandingInfo> {
    const path = companyId
      ? `/master/companies/${encodeURIComponent(companyId)}/branding`
      : '/master/companies/branding';
    return request<PublicBrandingInfo>(
      path,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },
};

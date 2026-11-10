import { BranchType, UserRecord, UserRole } from '../../types/domain.types';
import { request } from './client';

export const UsersApi = {
  listUsers(token: string, companyId?: string): Promise<UserRecord[]> {
    const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
    return request<UserRecord[]>(`/users${query}`, { method: 'GET' }, token);
  },

  createUser(
    token: string,
    payload: {
      fullName: string;
      email: string;
      password: string;
      role: Exclude<UserRole, 'MASTER'>;
      branch: BranchType;
      companyId?: string | null;
    },
  ): Promise<UserRecord> {
    return request<UserRecord>(
      '/users',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  assignBranch(
    token: string,
    userId: string,
    branch: BranchType,
  ): Promise<UserRecord> {
    return request<UserRecord>(
      `/users/${encodeURIComponent(userId)}/branch`,
      {
        method: 'PATCH',
        body: JSON.stringify({ branch }),
      },
      token,
    );
  },
};

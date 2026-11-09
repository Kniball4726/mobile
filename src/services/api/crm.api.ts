import { CustomerItem } from '../../types/domain.types';
import { request } from './client';

export const CrmApi = {
  searchCustomers(
    token: string,
    query = '',
    onlyWithDiscount = false,
  ): Promise<CustomerItem[]> {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (onlyWithDiscount) params.set('onlyWithDiscount', 'true');
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<CustomerItem[]>(
      `/crm/customers/search${qs}`,
      { method: 'GET' },
      token,
    );
  },

  registerOrUpdateCustomer(
    token: string,
    payload: {
      fullName: string;
      email: string;
      discountPercentage: number;
    },
  ): Promise<CustomerItem> {
    return request<CustomerItem>(
      '/crm/customers',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  assignDiscount(
    token: string,
    customerId: string,
    discountPercentage: number,
  ): Promise<CustomerItem> {
    return request<CustomerItem>(
      `/crm/customers/${customerId}/discount`,
      {
        method: 'PATCH',
        body: JSON.stringify({ discountPercentage }),
      },
      token,
    );
  },
};

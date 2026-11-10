import { SalePreviewResponse, SaleRecord } from '../../types/domain.types';
import { request } from './client';

export const SalesApi = {
  previewSale(
    token: string,
    payload: {
      items: Array<{
        productId: string;
        quantity: number;
        customPriceCents?: number;
        discountPercentage?: number;
      }>;
      customerId?: string | null;
      applyCustomerDiscount: boolean;
      discountPercentage?: number;
    },
  ): Promise<SalePreviewResponse> {
    return request<SalePreviewResponse>(
      '/sales/preview',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  createSale(
    token: string,
    idempotencyKey: string,
    payload: {
      items: Array<{
        productId: string;
        quantity: number;
        customPriceCents?: number;
        discountPercentage?: number;
      }>;
      customerId?: string | null;
      applyCustomerDiscount: boolean;
      discountPercentage?: number;
      payments: Array<{
        method: 'CASH' | 'CARD' | 'TRANSFER';
        amountCents: number;
        reference?: string | null;
      }>;
    },
  ): Promise<{
    idempotentReplay: boolean;
    sale: {
      _id: string;
      receiptNumber: string;
      subtotalCents: number;
      discountPercentageApplied: number;
      discountCents: number;
      taxCents: number;
      totalCents: number;
      changeDueCents: number;
      createdAt: string;
    };
  }> {
    return request(
      '/sales',
      {
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          ...payload,
          idempotencyKey,
          deviceTimestamp: new Date().toISOString(),
        }),
      },
      token,
    );
  },

  listSales(
    token: string,
    cashierId?: string,
    limit = 100,
  ): Promise<SaleRecord[]> {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (cashierId && cashierId.trim()) {
      params.set('cashierId', cashierId.trim());
    }
    return request<SaleRecord[]>(
      `/sales?${params.toString()}`,
      { method: 'GET' },
      token,
    );
  },
};

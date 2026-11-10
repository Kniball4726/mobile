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
    activeRegisterOnly?: boolean,
  ): Promise<SaleRecord[]> {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (cashierId && cashierId.trim()) {
      params.set('cashierId', cashierId.trim());
    }
    if (typeof activeRegisterOnly === 'boolean') {
      params.set('activeRegisterOnly', String(activeRegisterOnly));
    }
    return request<SaleRecord[]>(
      `/sales?${params.toString()}`,
      { method: 'GET' },
      token,
    );
  },

  createMercadoPagoQr(
    token: string,
    payload: {
      totalPesos: number;
      title?: string;
      externalReference: string;
    },
  ): Promise<{
    isAvailable: boolean;
    status: 'pending' | 'approved' | 'rejected' | 'disabled';
    externalReference: string;
    initPoint?: string;
    qrData?: string;
    qrImageUrl?: string;
    message?: string;
  }> {
    return request(
      '/sales/mercadopago/create-qr-order',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  checkMercadoPagoStatus(
    token: string,
    externalReference: string,
  ): Promise<{
    isPaid: boolean;
    status: string;
    paymentId?: string;
    paymentMethodId?: string;
    amount?: number;
    message?: string;
  }> {
    return request(
      `/sales/mercadopago/order-status/${encodeURIComponent(externalReference)}`,
      { method: 'GET' },
      token,
    );
  },
};

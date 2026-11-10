import { CartItem, CustomerItem } from '../../types/domain.types';
import { SalesApi } from '../api.service';

export const OFFLINE_QUEUE_STORAGE_KEY = 'justi_offline_sales_queue';
export const OFFLINE_CUSTOMERS_CACHE_KEY = 'justi_offline_customers_cache';

export interface OfflineSaleItem {
  id: string;
  idempotencyKey: string;
  receiptNumber: string;
  createdAt: string;
  payload: {
    items: Array<{
      productId: string;
      quantity: number;
      customPriceCents?: number;
      discountPercentage?: number;
    }>;
    customerId?: string | null;
    applyCustomerDiscount: boolean;
    payments: Array<{
      method: 'CASH' | 'CARD' | 'TRANSFER';
      amountCents: number;
      reference?: string | null;
    }>;
  };
  summary: {
    receiptNumber: string;
    totalPesos: number;
    discountApplied: number;
    cardPlan?: string;
    itemsCount: number;
    customerLabel: string;
    paymentLabel: string;
    branch: 'LOCALES' | 'CARRERAS';
  };
  status: 'PENDING' | 'SYNCING' | 'FAILED' | 'SYNCED';
  syncedReceiptNumber?: string;
  error?: string;
}

export function generateOfflineFolio(branch: 'LOCALES' | 'CARRERAS' = 'LOCALES'): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const randomHex = Math.random().toString(16).slice(2, 8).toUpperCase();
  const prefix = branch === 'CARRERAS' ? 'OFF-CAR' : 'OFF';
  return `${prefix}-${yyyy}${mm}${dd}-${randomHex}`;
}

export function isNetworkError(error: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return (
      msg.includes('failed to fetch') ||
      msg.includes('network') ||
      msg.includes('timeout') ||
      msg.includes('connection') ||
      msg.includes('load failed') ||
      msg.includes('offline') ||
      msg.includes('502') ||
      msg.includes('503') ||
      msg.includes('504')
    );
  }
  return false;
}

export const OfflineSyncService = {
  getQueue(): OfflineSaleItem[] {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as OfflineSaleItem[];
    } catch {
      return [];
    }
  },

  getPendingCount(): number {
    return this.getQueue().filter((item) => item.status === 'PENDING' || item.status === 'FAILED').length;
  },

  saveQueue(queue: OfflineSaleItem[]): void {
    try {
      localStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(queue));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('justi:offline-queue-changed', { detail: { count: queue.length } }));
      }
    } catch {
      // Ignorar error de cuota si ocurre
    }
  },

  enqueueSale(sale: Omit<OfflineSaleItem, 'id' | 'createdAt' | 'status'>): OfflineSaleItem {
    const queue = this.getQueue();
    const newRecord: OfflineSaleItem = {
      ...sale,
      id: `off-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
    };

    queue.push(newRecord);
    this.saveQueue(queue);
    return newRecord;
  },

  updateStatus(id: string, status: OfflineSaleItem['status'], updates?: Partial<OfflineSaleItem>): void {
    const queue = this.getQueue().map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status,
          ...updates,
        };
      }
      return item;
    });
    this.saveQueue(queue);
  },

  removeSale(id: string): void {
    const queue = this.getQueue().filter((item) => item.id !== id);
    this.saveQueue(queue);
  },

  clearSynced(): void {
    const queue = this.getQueue().filter((item) => item.status !== 'SYNCED');
    this.saveQueue(queue);
  },

  cacheRecentCustomer(customer: CustomerItem): void {
    try {
      const raw = localStorage.getItem(OFFLINE_CUSTOMERS_CACHE_KEY);
      const list: CustomerItem[] = raw ? JSON.parse(raw) : [];
      const filtered = list.filter((c) => c._id !== customer._id);
      filtered.unshift(customer);
      localStorage.setItem(OFFLINE_CUSTOMERS_CACHE_KEY, JSON.stringify(filtered.slice(0, 50)));
    } catch {
      // ignore
    }
  },

  getCachedCustomers(query?: string): CustomerItem[] {
    try {
      const raw = localStorage.getItem(OFFLINE_CUSTOMERS_CACHE_KEY);
      if (!raw) return [];
      const list: CustomerItem[] = JSON.parse(raw);
      if (!query || !query.trim()) return list;
      const q = query.toLowerCase().trim();
      return list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.dni && c.dni.includes(q)),
      );
    } catch {
      return [];
    }
  },

  async syncQueue(
    token: string,
    onProgress?: (synced: number, total: number) => void,
  ): Promise<{ synced: number; failed: number; total: number }> {
    const queue = this.getQueue();
    const pendingItems = queue.filter(
      (item) => item.status === 'PENDING' || item.status === 'FAILED',
    );

    if (pendingItems.length === 0) {
      return { synced: 0, failed: 0, total: 0 };
    }

    let synced = 0;
    let failed = 0;

    for (let i = 0; i < pendingItems.length; i++) {
      const item = pendingItems[i];
      this.updateStatus(item.id, 'SYNCING');

      try {
        const response = await SalesApi.createSale(
          token,
          item.idempotencyKey,
          item.payload,
        );

        const officialFolio = response.sale.receiptNumber;
        this.updateStatus(item.id, 'SYNCED', {
          syncedReceiptNumber: officialFolio,
          error: undefined,
        });

        // Opcional: Eliminar los sincronizados para no saturar localStorage
        this.removeSale(item.id);
        synced++;
      } catch (err: unknown) {
        if (isNetworkError(err)) {
          // Si falló por red, volver a dejarlo PENDING para reintento posterior
          this.updateStatus(item.id, 'PENDING', {
            error: 'Sin conexión a internet. Reintentará automáticamente.',
          });
          failed++;
          // Si se perdió la red a mitad de camino, detener el loop para evitar llamadas inútiles
          break;
        } else {
          // Error del servidor (ej. validación)
          const errorMsg =
            err instanceof Error ? err.message : 'Error de sincronización';
          this.updateStatus(item.id, 'FAILED', { error: errorMsg });
          failed++;
        }
      }

      if (onProgress) {
        onProgress(synced, pendingItems.length);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('justi:offline-sync-completed', {
          detail: { synced, failed, total: pendingItems.length },
        }),
      );
    }

    return { synced, failed, total: pendingItems.length };
  },
};

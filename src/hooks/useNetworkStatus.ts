import { useCallback, useEffect, useState } from 'react';
import {
  OfflineSaleItem,
  OfflineSyncService,
} from '../services/offline/offline-sync.service';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [pendingCount, setPendingCount] = useState<number>(() =>
    OfflineSyncService.getPendingCount(),
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  const refreshPendingCount = useCallback(() => {
    setPendingCount(OfflineSyncService.getPendingCount());
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      refreshPendingCount();
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshPendingCount();
    };

    const handleQueueChanged = () => {
      refreshPendingCount();
    };

    const handleSyncCompleted = (e: Event) => {
      const custom = e as CustomEvent<{ synced: number; failed: number; total: number }>;
      refreshPendingCount();
      if (custom.detail) {
        const { synced, failed, total } = custom.detail;
        if (synced > 0 && failed === 0) {
          setSyncStatusMessage(`¡${synced} venta(s) offline sincronizada(s) con éxito!`);
        } else if (failed > 0) {
          setSyncStatusMessage(`${synced} de ${total} sincronizadas. ${failed} pendiente(s).`);
        }
        setTimeout(() => setSyncStatusMessage(null), 4500);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('justi:offline-queue-changed', handleQueueChanged);
    window.addEventListener('justi:offline-sync-completed', handleSyncCompleted);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('justi:offline-queue-changed', handleQueueChanged);
      window.removeEventListener('justi:offline-sync-completed', handleSyncCompleted);
    };
  }, [refreshPendingCount]);

  const syncNow = useCallback(
    async (token: string) => {
      if (!isOnline || isSyncing) return { synced: 0, failed: 0, total: 0 };
      setIsSyncing(true);
      try {
        const result = await OfflineSyncService.syncQueue(token);
        refreshPendingCount();
        return result;
      } finally {
        setIsSyncing(false);
      }
    },
    [isOnline, isSyncing, refreshPendingCount],
  );

  return {
    isOnline,
    pendingCount,
    isSyncing,
    syncStatusMessage,
    syncNow,
    refreshPendingCount,
  };
}

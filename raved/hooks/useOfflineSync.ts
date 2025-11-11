import { useState, useEffect, useCallback } from 'react';
import syncManager from '../services/syncManager';
import offlineQueueService from '../services/offlineQueue';

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime?: Date;
  pendingItems: number;
  failedItems: number;
  conflicts: number;
}

export interface UseOfflineSyncOptions {
  autoSync?: boolean;
  syncInterval?: number;
  onSyncComplete?: (success: boolean, error?: string) => void;
  onConflictDetected?: (conflict: any) => void;
}

export const useOfflineSync = (options: UseOfflineSyncOptions = {}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    isSyncing: false,
    pendingItems: 0,
    failedItems: 0,
    conflicts: 0,
  });

  const [networkState, setNetworkState] = useState<any>(null);

  // Update sync status
  const updateSyncStatus = useCallback(async () => {
    try {
      const stats = await syncManager.getSyncStats();
      const lastSyncStatus = await offlineQueueService.getSyncStatus();

      setSyncStatus({
        isOnline: navigator.onLine,
        isSyncing: stats.syncStatus?.status === 'syncing',
        lastSyncTime: lastSyncStatus?.timestamp ? new Date(lastSyncStatus.timestamp) : undefined,
        pendingItems: stats.queueStats.pending,
        failedItems: stats.queueStats.failed,
        conflicts: 0, // Would need to implement conflict counting
      });
    } catch (error) {
      console.error('Failed to update sync status:', error);
    }
  }, []);

  // Queue an API request
  const queueRequest = useCallback(async (
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    options?: {
      priority?: number;
      headers?: Record<string, string>;
      dependencies?: string[];
      tags?: string[];
    }
  ) => {
    try {
      const requestId = await syncManager.queueRequest(method, url, data, options);
      await updateSyncStatus();
      return requestId;
    } catch (error) {
      console.error('Failed to queue request:', error);
      throw error;
    }
  }, [updateSyncStatus]);

  // Store data offline
  const storeOfflineData = useCallback(async (
    entityType: string,
    entityId: string,
    data: any
  ) => {
    try {
      await syncManager.storeOfflineData(entityType, entityId, data);
      await updateSyncStatus();
    } catch (error) {
      console.error('Failed to store offline data:', error);
      throw error;
    }
  }, [updateSyncStatus]);

  // Get offline data
  const getOfflineData = useCallback(async (
    entityType: string,
    entityId: string
  ) => {
    try {
      return await syncManager.getOfflineData(entityType, entityId);
    } catch (error) {
      console.error('Failed to get offline data:', error);
      throw error;
    }
  }, []);

  // Force sync
  const forceSync = useCallback(async () => {
    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true }));
      await syncManager.forceSync();
      await updateSyncStatus();

      if (options.onSyncComplete) {
        options.onSyncComplete(true);
      }
    } catch (error) {
      console.error('Force sync failed:', error);
      await updateSyncStatus();

      if (options.onSyncComplete) {
        options.onSyncComplete(false, (error as Error).message);
      }
    }
  }, [updateSyncStatus, options.onSyncComplete]);

  // Retry failed items
  const retryFailedItems = useCallback(async () => {
    try {
      await offlineQueueService.retryFailedItems();
      await updateSyncStatus();
    } catch (error) {
      console.error('Failed to retry items:', error);
      throw error;
    }
  }, [updateSyncStatus]);

  // Clear completed items
  const clearCompletedItems = useCallback(async () => {
    try {
      await offlineQueueService.clearCompletedItems();
      await updateSyncStatus();
    } catch (error) {
      console.error('Failed to clear completed items:', error);
      throw error;
    }
  }, [updateSyncStatus]);

  // Handle network changes
  const handleNetworkChange = useCallback((state: any) => {
    setNetworkState(state);
    setSyncStatus(prev => ({
      ...prev,
      isOnline: state?.isConnected ?? navigator.onLine,
    }));

    syncManager.onNetworkChange(state?.isConnected ?? navigator.onLine);
  }, []);

  // Handle app state changes
  const handleAppStateChange = useCallback((nextAppState: string) => {
    const isActive = nextAppState === 'active';
    syncManager.onAppStateChange(isActive);
  }, []);

  // Initialize
  useEffect(() => {
    updateSyncStatus();

    // Set up network monitoring (would use NetInfo in React Native)
    // For web, we rely on navigator.onLine and window events
    const unsubscribe = () => {}; // Placeholder for React Native

    // Set up app state monitoring (React Native)
    // In React Native, you'd use AppState.addEventListener

    // For web, monitor online/offline events
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      syncManager.onNetworkChange(true);
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
      syncManager.onNetworkChange(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up periodic status updates
    const statusInterval = setInterval(updateSyncStatus, 5000);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(statusInterval);
    };
  }, [updateSyncStatus, handleNetworkChange]);

  // Auto-sync effect
  useEffect(() => {
    if (options.autoSync && syncStatus.isOnline && !syncStatus.isSyncing) {
      const autoSyncInterval = setInterval(() => {
        if (syncStatus.pendingItems > 0) {
          forceSync();
        }
      }, options.syncInterval || 30000);

      return () => clearInterval(autoSyncInterval);
    }
  }, [options.autoSync, options.syncInterval, syncStatus, forceSync]);

  return {
    syncStatus,
    networkState,
    queueRequest,
    storeOfflineData,
    getOfflineData,
    forceSync,
    retryFailedItems,
    clearCompletedItems,
    updateSyncStatus,
  };
};

export default useOfflineSync;
import offlineQueueService, { QueueItem } from './offlineQueue';
import api from './api';
import socketService from './socket';
import { Storage } from './storage';

export interface SyncManagerConfig {
  autoSyncInterval: number; // in milliseconds
  maxConcurrentRequests: number;
  retryAttempts: number;
  conflictResolutionStrategy: 'local_wins' | 'server_wins' | 'merge' | 'manual';
}

class SyncManager {
  private config: SyncManagerConfig = {
    autoSyncInterval: 30000, // 30 seconds
    maxConcurrentRequests: 5,
    retryAttempts: 3,
    conflictResolutionStrategy: 'merge',
  };

  private syncInProgress = false;
  private syncTimer: any = null;
  private deviceId: string | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Get or create device ID
    this.deviceId = await Storage.get<string>('deviceId', '');
    if (!this.deviceId) {
      this.deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await Storage.set('deviceId', this.deviceId);
    }

    // Register device with backend
    this.registerDevice();

    // Start auto-sync
    this.startAutoSync();

    // Listen for app state changes
    this.setupAppStateListeners();
  }

  private setupAppStateListeners() {
    // React Native AppState would be used here in a real app
    // For now, we'll simulate with focus/blur events
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseAutoSync();
        } else {
          this.resumeAutoSync();
        }
      });
    }
  }

  private startAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      if (!this.syncInProgress) {
        this.performSync();
      }
    }, this.config.autoSyncInterval);
  }

  private pauseAutoSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  private resumeAutoSync() {
    this.startAutoSync();
  }

  /**
   * Register device with backend for sync tracking
   */
  private async registerDevice() {
    if (!this.deviceId) return;

    try {
      await api.post('/offline-sync/register-device', {
        deviceId: this.deviceId,
        platform: 'web', // or get from device info
        appVersion: '1.0.0',
      });
    } catch (error) {
      console.error('Failed to register device:', error);
    }
  }

  /**
   * Perform synchronization
   */
  async performSync(): Promise<void> {
    if (this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;

    try {
      console.log('Starting sync...');

      // Update device status
      await this.updateDeviceStatus(true);

      // Process offline queue
      await offlineQueueService.processQueue();

      // Perform full sync
      await offlineQueueService.performFullSync();

      // Update sync status
      await this.updateSyncStatus('completed');

      console.log('Sync completed successfully');

    } catch (error) {
      console.error('Sync failed:', error);
      await this.updateSyncStatus('failed', (error as Error).message);
    } finally {
      this.syncInProgress = false;
      await this.updateDeviceStatus(false);
    }
  }

  /**
   * Update device online status
   */
  private async updateDeviceStatus(isSyncing: boolean) {
    if (!this.deviceId) return;

    try {
      await api.post('/offline-sync/device-status', {
        deviceId: this.deviceId,
        isOnline: true,
        isSyncing,
        lastSeen: new Date(),
      });
    } catch (error) {
      console.error('Failed to update device status:', error);
    }
  }

  /**
   * Update sync status
   */
  private async updateSyncStatus(status: string, error?: string) {
    await Storage.set('lastSyncStatus', {
      status,
      timestamp: new Date(),
      error,
    });
  }

  /**
   * Queue an API request for offline handling
   */
  async queueRequest(
    method: QueueItem['method'],
    url: string,
    data?: any,
    options: {
      priority?: number;
      headers?: Record<string, string>;
      dependencies?: string[];
      tags?: string[];
    } = {}
  ): Promise<string> {
    const requestId = await offlineQueueService.addToQueue(method, url, data, options);

    // If we're online, try to process immediately
    if (navigator.onLine) {
      setTimeout(() => offlineQueueService.processQueue(), 100);
    }

    return requestId;
  }

  /**
   * Store data for offline access
   */
  async storeOfflineData(entityType: string, entityId: string, data: any): Promise<void> {
    await offlineQueueService.storeOfflineData(entityType, entityId, data);
  }

  /**
   * Get offline data
   */
  async getOfflineData(entityType: string, entityId: string): Promise<any> {
    // First try to get from offline storage
    const offlineData = await this.getStoredOfflineData(entityType, entityId);
    if (offlineData) {
      return offlineData;
    }

    // If not available offline, try to fetch and store
    try {
      const response = await api.get(`/${entityType}/${entityId}`);
      await this.storeOfflineData(entityType, entityId, response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get stored offline data
   */
  private async getStoredOfflineData(entityType: string, entityId: string): Promise<any> {
    // This would integrate with offline storage
    // For now, return null
    return null;
  }

  /**
   * Force immediate sync
   */
  async forceSync(): Promise<void> {
    await this.performSync();
  }

  /**
   * Get sync statistics
   */
  async getSyncStats(): Promise<any> {
    const queueStats = await offlineQueueService.getQueueStats();
    const syncStatus = await offlineQueueService.getSyncStatus();

    return {
      queueStats,
      syncStatus,
      isOnline: navigator.onLine,
      deviceId: this.deviceId,
    };
  }

  /**
   * Configure sync manager
   */
  updateConfig(newConfig: Partial<SyncManagerConfig>) {
    this.config = { ...this.config, ...newConfig };

    // Restart auto-sync with new interval
    this.startAutoSync();
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.pauseAutoSync();
    socketService.disconnect();
  }

  /**
   * Handle network status changes
   */
  onNetworkChange(isOnline: boolean) {
    if (isOnline) {
      console.log('Network online, starting sync...');
      this.performSync();
    } else {
      console.log('Network offline, queuing requests...');
    }
  }

  /**
   * Handle app background/foreground transitions
   */
  onAppStateChange(isActive: boolean) {
    if (isActive) {
      this.resumeAutoSync();
      this.performSync();
    } else {
      this.pauseAutoSync();
    }
  }
}

export const syncManager = new SyncManager();
export default syncManager;
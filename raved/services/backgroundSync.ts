import syncManager from './syncManager';
import offlineQueueService from './offlineQueue';

export interface BackgroundSyncConfig {
  enabled: boolean;
  syncInterval: number; // in milliseconds
  batchSize: number;
  retryAttempts: number;
  networkTimeout: number;
  backgroundEnabled: boolean;
}

class BackgroundSyncService {
  private config: BackgroundSyncConfig = {
    enabled: true,
    syncInterval: 30000, // 30 seconds
    batchSize: 10,
    retryAttempts: 3,
    networkTimeout: 30000, // 30 seconds
    backgroundEnabled: true,
  };

  private syncTimer: any = null;
  private isRunning = false;
  private lastSyncTime = 0;
  private consecutiveFailures = 0;
  private maxConsecutiveFailures = 5;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Set up background sync
    this.startBackgroundSync();

    // Listen for app visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.onAppBackground();
        } else {
          this.onAppForeground();
        }
      });
    }

    // Set up service worker for background sync (if available)
    this.registerServiceWorker();
  }

  /**
   * Start background synchronization
   */
  private startBackgroundSync() {
    if (!this.config.enabled || this.syncTimer) {
      return;
    }

    this.syncTimer = setInterval(() => {
      this.performBackgroundSync();
    }, this.config.syncInterval);
  }

  /**
   * Stop background synchronization
   */
  stopBackgroundSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Perform background sync operation
   */
  private async performBackgroundSync() {
    if (this.isRunning || !navigator.onLine) {
      return;
    }

    // Check if enough time has passed since last sync
    const now = Date.now();
    if (now - this.lastSyncTime < this.config.syncInterval) {
      return;
    }

    this.isRunning = true;

    try {
      console.log('Performing background sync...');

      // Check if there are pending items to sync
      const stats = await offlineQueueService.getQueueStats();

      if (stats.pending > 0 || stats.failed > 0) {
        await syncManager.performSync();
        this.lastSyncTime = now;
        this.consecutiveFailures = 0;
        console.log('Background sync completed successfully');
      }

    } catch (error) {
      console.error('Background sync failed:', error);
      this.consecutiveFailures++;

      // If too many consecutive failures, increase interval
      if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
        this.increaseSyncInterval();
      }
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Increase sync interval after consecutive failures
   */
  private increaseSyncInterval() {
    this.config.syncInterval = Math.min(
      this.config.syncInterval * 2,
      300000 // Max 5 minutes
    );

    console.log(`Increased sync interval to ${this.config.syncInterval}ms due to failures`);

    // Restart with new interval
    this.stopBackgroundSync();
    this.startBackgroundSync();
  }

  /**
   * Handle app going to background
   */
  private onAppBackground() {
    if (this.config.backgroundEnabled) {
      // Continue sync but less frequently
      this.stopBackgroundSync();
      this.syncTimer = setInterval(() => {
        this.performBackgroundSync();
      }, this.config.syncInterval * 2); // Double interval when in background
    }
  }

  /**
   * Handle app coming to foreground
   */
  private onAppForeground() {
    // Reset to normal sync interval
    this.stopBackgroundSync();
    this.startBackgroundSync();

    // Perform immediate sync
    setTimeout(() => {
      this.performBackgroundSync();
    }, 1000);
  }

  /**
   * Register service worker for background sync
   */
  private async registerServiceWorker() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;

        // Register for background sync
        await (registration as any).sync.register('background-sync');

        console.log('Background sync registered with service worker');
      } catch (error) {
        console.error('Failed to register background sync:', error);
      }
    }
  }

  /**
   * Force immediate background sync
   */
  async forceSyncNow(): Promise<void> {
    await this.performBackgroundSync();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<BackgroundSyncConfig>) {
    this.config = { ...this.config, ...newConfig };

    // Restart sync with new config
    this.stopBackgroundSync();
    this.startBackgroundSync();
  }

  /**
   * Get current sync status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastSyncTime: this.lastSyncTime,
      consecutiveFailures: this.consecutiveFailures,
      syncInterval: this.config.syncInterval,
      enabled: this.config.enabled,
    };
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopBackgroundSync();
  }

  /**
   * Handle network status changes
   */
  onNetworkChange(isOnline: boolean) {
    if (isOnline) {
      // Network back online, perform immediate sync
      setTimeout(() => {
        this.performBackgroundSync();
      }, 1000);
    }
  }

  /**
   * Handle battery status changes (if available)
   */
  onBatteryChange(isLowBattery: boolean) {
    if (isLowBattery) {
      // Reduce sync frequency on low battery
      this.updateConfig({
        syncInterval: this.config.syncInterval * 4, // 4x less frequent
      });
    } else {
      // Reset to normal frequency
      this.updateConfig({
        syncInterval: 30000, // Reset to 30 seconds
      });
    }
  }

  /**
   * Handle storage quota changes
   */
  onStorageQuotaChange(isLowStorage: boolean) {
    if (isLowStorage) {
      // Reduce stored data and sync frequency
      this.updateConfig({
        syncInterval: this.config.syncInterval * 2,
      });

      // Trigger cleanup
      this.performCleanup();
    }
  }

  /**
   * Perform cleanup operations
   */
  private async performCleanup() {
    try {
      // Clear old completed items
      await offlineQueueService.clearCompletedItems();

      console.log('Cleanup completed');
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }

  /**
   * Schedule sync for specific time
   */
  scheduleSync(delay: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        await this.performBackgroundSync();
        resolve();
      }, delay);
    });
  }

  /**
   * Check if background sync is supported
   */
  static isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'sync' in window.ServiceWorkerRegistration.prototype
    );
  }

  /**
   * Get recommended sync interval based on conditions
   */
  private getRecommendedInterval(): number {
    let interval = 30000; // Base 30 seconds

    // Adjust based on network conditions
    const connection = (navigator as any).connection;
    if (connection) {
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        interval *= 4; // 2 minutes
      } else if (connection.effectiveType === '3g') {
        interval *= 2; // 1 minute
      }
    }

    // Adjust based on battery
    const getBattery = (navigator as any).getBattery;
    if (getBattery) {
      getBattery().then((battery: any) => {
        if (battery.level < 0.2) {
          interval *= 4; // 2 minutes when battery low
        }
      });
    }

    return Math.min(interval, 300000); // Max 5 minutes
  }
}

export const backgroundSyncService = new BackgroundSyncService();
export default backgroundSyncService;
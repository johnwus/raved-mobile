import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { v4 as uuidv4 } from 'uuid';
import api from './api';
import socketService from './socket';

export interface QueueItem {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  priority: number;
  maxRetries: number;
  retryCount: number;
  createdAt: Date;
  scheduledAt?: Date;
  dependencies?: string[];
  tags?: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorMessage?: string;
}

export interface SyncConflict {
  id: string;
  entityType: string;
  entityId: string;
  localVersion: number;
  serverVersion: number;
  localData: any;
  serverData: any;
  resolvedData?: any;
  resolutionStrategy?: 'local_wins' | 'server_wins' | 'merge' | 'manual';
  status: 'pending' | 'resolved';
  createdAt: Date;
}

class OfflineQueueService {
  private static readonly QUEUE_KEY = 'offline_queue';
  private static readonly CONFLICTS_KEY = 'sync_conflicts';
  private static readonly SYNC_STATUS_KEY = 'sync_status';
  private static readonly BATCH_SIZE = 10;
  private static readonly MAX_RETRIES = 3;

  private queueKey = OfflineQueueService.QUEUE_KEY;
  private conflictsKey = OfflineQueueService.CONFLICTS_KEY;
  private syncStatusKey = OfflineQueueService.SYNC_STATUS_KEY;
  private batchSize = OfflineQueueService.BATCH_SIZE;
  private maxRetries = OfflineQueueService.MAX_RETRIES;

  private isOnline = false;
  private isProcessing = false;
  private syncInProgress = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    // Monitor network status
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (!wasOnline && this.isOnline) {
        // Came back online, start processing queue
        this.processQueue();
      }
    });

    // Get initial network status
    const netInfo = await NetInfo.fetch();
    this.isOnline = netInfo.isConnected ?? false;

    // Set up socket listeners for sync events
    this.setupSocketListeners();

    // Start background sync
    this.startBackgroundSync();
  }

  private setupSocketListeners() {
    socketService.on('sync_job_completed', (data) => {
      console.log('Sync job completed:', data);
      this.onSyncCompleted(data);
    });

    socketService.on('sync_job_failed', (data) => {
      console.log('Sync job failed:', data);
      this.onSyncFailed(data);
    });

    socketService.on('force_sync_request', (data) => {
      console.log('Force sync requested:', data);
      this.performFullSync();
    });

    socketService.on('device_status_update', (data) => {
      console.log('Device status update:', data);
    });
  }

  private startBackgroundSync() {
    // Sync every 30 seconds when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.processQueue();
      }
    }, 30000);

    // Full sync every 5 minutes
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.performFullSync();
      }
    }, 300000);
  }

  /**
   * Add a request to the offline queue
   */
  async addToQueue(
    method: QueueItem['method'],
    url: string,
    data?: any,
    options: {
      priority?: number;
      maxRetries?: number;
      headers?: Record<string, string>;
      dependencies?: string[];
      tags?: string[];
      scheduledAt?: Date;
    } = {}
  ): Promise<string> {
    const queueItem: QueueItem = {
      id: uuidv4(),
      method,
      url,
      data,
      headers: options.headers,
      priority: options.priority || 0,
      maxRetries: options.maxRetries || this.maxRetries,
      retryCount: 0,
      createdAt: new Date(),
      scheduledAt: options.scheduledAt,
      dependencies: options.dependencies,
      tags: options.tags,
      status: 'pending',
    };

    const queue = await this.getQueue();
    queue.push(queueItem);
    await this.saveQueue(queue);

    // If online, try to process immediately
    if (this.isOnline && !this.isProcessing) {
      this.processQueue();
    }

    return queueItem.id;
  }

  /**
   * Process pending queue items
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || !this.isOnline) {
      return;
    }

    this.isProcessing = true;

    try {
      const queue = await this.getQueue();
      const pendingItems = queue
        .filter(item => item.status === 'pending')
        .sort((a, b) => b.priority - a.priority || a.createdAt.getTime() - b.createdAt.getTime())
        .slice(0, this.batchSize);

      for (const item of pendingItems) {
        await this.processQueueItem(item);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single queue item
   */
  private async processQueueItem(item: QueueItem): Promise<void> {
    if (!this.isOnline) {
      return;
    }

    item.status = 'processing';
    await this.updateQueueItem(item);

    try {
      // Check dependencies
      if (item.dependencies && item.dependencies.length > 0) {
        const unresolvedDeps = await this.checkDependencies(item.dependencies);
        if (unresolvedDeps.length > 0) {
          item.status = 'pending';
          await this.updateQueueItem(item);
          return;
        }
      }

      // Execute the request
      const response = await this.executeRequest(item);

      // Mark as completed
      item.status = 'completed';
      await this.updateQueueItem(item);

      // Process dependent items
      if (item.dependencies) {
        await this.processDependentItems(item.id);
      }

    } catch (error: any) {
      await this.handleQueueError(item, error);
    }
  }

  /**
   * Execute HTTP request
   */
  private async executeRequest(item: QueueItem): Promise<any> {
    const config = {
      method: item.method,
      url: item.url,
      data: item.data,
      headers: {
        ...item.headers,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    };

    const response = await api.request(config);
    return response;
  }

  /**
   * Handle queue processing errors
   */
  private async handleQueueError(item: QueueItem, error: any): Promise<void> {
    item.retryCount++;
    item.errorMessage = error.message;

    if (item.retryCount >= item.maxRetries) {
      item.status = 'failed';
    } else {
      item.status = 'pending';
      // Exponential backoff
      item.scheduledAt = new Date(Date.now() + Math.min(1000 * Math.pow(2, item.retryCount), 300000));
    }

    await this.updateQueueItem(item);
  }

  /**
   * Check if dependencies are resolved
   */
  private async checkDependencies(dependencies: string[]): Promise<string[]> {
    const queue = await this.getQueue();
    const unresolved: string[] = [];

    for (const depId of dependencies) {
      const depItem = queue.find(item => item.id === depId);
      if (!depItem || depItem.status !== 'completed') {
        unresolved.push(depId);
      }
    }

    return unresolved;
  }

  /**
   * Process items that depend on completed item
   */
  private async processDependentItems(completedId: string): Promise<void> {
    const queue = await this.getQueue();

    for (const item of queue) {
      if (item.dependencies?.includes(completedId) && item.status === 'pending') {
        const unresolvedDeps = await this.checkDependencies(item.dependencies);
        if (unresolvedDeps.length === 0) {
          // All dependencies resolved, can process this item
          await this.processQueueItem(item);
        }
      }
    }

    await this.saveQueue(queue);
  }

  /**
   * Perform full synchronization
   */
  async performFullSync(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;

    try {
      // Process queue first
      await this.processQueue();

      // Sync offline data
      await this.syncOfflineData();

      // Resolve conflicts
      await this.resolveConflicts();

      // Update sync status
      await this.updateSyncStatus({
        lastSync: new Date(),
        status: 'completed',
      });

    } catch (error) {
      console.error('Full sync failed:', error);
      await this.updateSyncStatus({
        lastSync: new Date(),
        status: 'failed',
        error: (error as Error).message,
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Sync offline data with server
   */
  private async syncOfflineData(): Promise<void> {
    try {
      const offlineData = await this.getOfflineData();

      for (const data of offlineData) {
        if (data.syncStatus === 'pending') {
          await this.syncDataItem(data);
        }
      }
    } catch (error) {
      console.error('Offline data sync failed:', error);
    }
  }

  /**
   * Sync a single data item
   */
  private async syncDataItem(data: any): Promise<void> {
    try {
      // Check for version conflicts
      const serverVersion = await this.getServerVersion(data.entityType, data.entityId);

      if (serverVersion > data.version) {
        // Conflict detected
        await this.createConflict(data, serverVersion);
        return;
      }

      // No conflict, sync to server
      await api.post('/offline-sync/sync-data', {
        entityType: data.entityType,
        entityId: data.entityId,
        data: data.data,
        version: data.version,
      });

      // Mark as synced
      data.syncStatus = 'synced';
      await this.updateOfflineDataItem(data);

    } catch (error) {
      console.error('Data sync failed:', error);
      data.syncStatus = 'error';
      await this.updateOfflineDataItem(data);
    }
  }

  /**
   * Get server version for entity
   */
  private async getServerVersion(entityType: string, entityId: string): Promise<number> {
    try {
      const response = await api.get(`/offline-sync/version/${entityType}/${entityId}`);
      return response.data.version || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Create a sync conflict
   */
  private async createConflict(localData: any, serverVersion: number): Promise<void> {
    const conflict: SyncConflict = {
      id: uuidv4(),
      entityType: localData.entityType,
      entityId: localData.entityId,
      localVersion: localData.version,
      serverVersion,
      localData: localData.data,
      serverData: null, // Will be fetched when resolving
      status: 'pending',
      createdAt: new Date(),
    };

    const conflicts = await this.getConflicts();
    conflicts.push(conflict);
    await this.saveConflicts(conflicts);

    // Notify about conflict
    this.notifyConflict(conflict);
  }

  /**
   * Resolve sync conflicts
   */
  private async resolveConflicts(): Promise<void> {
    const conflicts = await this.getConflicts();
    const unresolvedConflicts = conflicts.filter(c => c.status === 'pending');

    for (const conflict of unresolvedConflicts) {
      await this.resolveConflict(conflict);
    }
  }

  /**
   * Resolve a single conflict
   */
  private async resolveConflict(conflict: SyncConflict): Promise<void> {
    try {
      // Get server data if not already fetched
      if (!conflict.serverData) {
        const response = await api.get(`/offline-sync/data/${conflict.entityType}/${conflict.entityId}`);
        conflict.serverData = response.data;
      }

      // Auto-resolve using merge strategy
      conflict.resolutionStrategy = 'merge';
      conflict.resolvedData = this.mergeData(conflict.localData, conflict.serverData);
      conflict.status = 'resolved';

      // Send resolution to server
      await api.post('/offline-sync/resolve-conflict', {
        conflictId: conflict.id,
        resolution: {
          strategy: conflict.resolutionStrategy,
          resolvedData: conflict.resolvedData,
        },
      });

      // Update local data
      await this.updateOfflineDataItem({
        entityType: conflict.entityType,
        entityId: conflict.entityId,
        data: conflict.resolvedData,
        syncStatus: 'synced',
      });

      await this.updateConflict(conflict);

    } catch (error) {
      console.error('Conflict resolution failed:', error);
    }
  }

  /**
   * Merge local and server data
   */
  private mergeData(localData: any, serverData: any): any {
    if (!localData || !serverData) {
      return localData || serverData;
    }

    if (typeof localData !== 'object' || typeof serverData !== 'object') {
      // For primitive values, prefer server data
      return serverData;
    }

    const merged = { ...serverData };

    // Merge local data, preferring local for conflicts
    for (const key in localData) {
      if (!(key in serverData)) {
        merged[key] = localData[key];
      } else if (this.isObject(localData[key]) && this.isObject(serverData[key])) {
        merged[key] = this.mergeData(localData[key], serverData[key]);
      }
      // Keep server value for primitive conflicts
    }

    return merged;
  }

  private isObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Store data for offline access
   */
  async storeOfflineData(entityType: string, entityId: string, data: any): Promise<void> {
    const offlineData = await this.getOfflineData();
    const existingIndex = offlineData.findIndex(
      item => item.entityType === entityType && item.entityId === entityId
    );

    const dataItem = {
      entityType,
      entityId,
      data,
      version: (offlineData[existingIndex]?.version || 0) + 1,
      lastModified: new Date(),
      syncStatus: 'pending',
    };

    if (existingIndex >= 0) {
      offlineData[existingIndex] = dataItem;
    } else {
      offlineData.push(dataItem);
    }

    await this.saveOfflineData(offlineData);
  }

  /**
   * Get offline data
   */
  private async getOfflineData(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem('offline_data');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save offline data
   */
  private async saveOfflineData(data: any[]): Promise<void> {
    await AsyncStorage.setItem('offline_data', JSON.stringify(data));
  }

  /**
   * Update offline data item
   */
  private async updateOfflineDataItem(updatedItem: any): Promise<void> {
    const data = await this.getOfflineData();
    const index = data.findIndex(
      item => item.entityType === updatedItem.entityType && item.entityId === updatedItem.entityId
    );

    if (index >= 0) {
      data[index] = { ...data[index], ...updatedItem };
      await this.saveOfflineData(data);
    }
  }

  /**
   * Get queue from storage
   */
  private async getQueue(): Promise<QueueItem[]> {
    try {
      const queue = await AsyncStorage.getItem(this.queueKey);
      const parsed = queue ? JSON.parse(queue) : [];
      // Convert date strings back to Date objects
      return parsed.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        scheduledAt: item.scheduledAt ? new Date(item.scheduledAt) : undefined,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(queue: QueueItem[]): Promise<void> {
    await AsyncStorage.setItem(this.queueKey, JSON.stringify(queue));
  }

  /**
   * Update queue item
   */
  private async updateQueueItem(updatedItem: QueueItem): Promise<void> {
    const queue = await this.getQueue();
    const index = queue.findIndex(item => item.id === updatedItem.id);

    if (index >= 0) {
      queue[index] = updatedItem;
      await this.saveQueue(queue);
    }
  }

  /**
   * Get conflicts from storage
   */
  private async getConflicts(): Promise<SyncConflict[]> {
    try {
      const conflicts = await AsyncStorage.getItem(this.conflictsKey);
      const parsed = conflicts ? JSON.parse(conflicts) : [];
      return parsed.map((conflict: any) => ({
        ...conflict,
        createdAt: new Date(conflict.createdAt),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Save conflicts to storage
   */
  private async saveConflicts(conflicts: SyncConflict[]): Promise<void> {
    await AsyncStorage.setItem(this.conflictsKey, JSON.stringify(conflicts));
  }

  /**
   * Update conflict
   */
  private async updateConflict(updatedConflict: SyncConflict): Promise<void> {
    const conflicts = await this.getConflicts();
    const index = conflicts.findIndex(conflict => conflict.id === updatedConflict.id);

    if (index >= 0) {
      conflicts[index] = updatedConflict;
      await this.saveConflicts(conflicts);
    }
  }

  /**
   * Update sync status
   */
  private async updateSyncStatus(status: any): Promise<void> {
    await AsyncStorage.setItem(this.syncStatusKey, JSON.stringify({
      ...status,
      timestamp: new Date(),
    }));
  }

  /**
   * Get sync status
   */
  async getSyncStatus(): Promise<any> {
    try {
      const status = await AsyncStorage.getItem(this.syncStatusKey);
      return status ? JSON.parse(status) : { status: 'unknown' };
    } catch {
      return { status: 'unknown' };
    }
  }

  /**
   * Notify about conflict
   */
  private notifyConflict(conflict: SyncConflict): void {
    // Emit event for UI to handle
    // This could be integrated with a global event system
    console.log('Sync conflict detected:', conflict);
  }

  /**
   * Handle sync completion
   */
  private onSyncCompleted(data: any): void {
    console.log('Sync completed successfully');
    this.syncInProgress = false;
  }

  /**
   * Handle sync failure
   */
  private onSyncFailed(data: any): void {
    console.error('Sync failed:', data.errorMessage);
    this.syncInProgress = false;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    total: number;
  }> {
    const queue = await this.getQueue();
    const stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      total: queue.length,
    };

    queue.forEach(item => {
      stats[item.status]++;
    });

    return stats;
  }

  /**
   * Clear completed items
   */
  async clearCompletedItems(): Promise<void> {
    const queue = await this.getQueue();
    const filteredQueue = queue.filter(item => item.status !== 'completed');
    await this.saveQueue(filteredQueue);
  }

  /**
   * Retry failed items
   */
  async retryFailedItems(): Promise<void> {
    const queue = await this.getQueue();
    const failedItems = queue.filter(item => item.status === 'failed' && item.retryCount < item.maxRetries);

    for (const item of failedItems) {
      item.status = 'pending';
      item.retryCount = 0;
      item.errorMessage = undefined;
      item.scheduledAt = new Date();
    }

    await this.saveQueue(queue);
  }
}

export const offlineQueueService = new OfflineQueueService();
export default offlineQueueService;
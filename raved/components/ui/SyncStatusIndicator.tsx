import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { Badge } from './Badge';
import { Button } from './Button';

interface SyncStatusIndicatorProps {
  showDetails?: boolean;
  onPress?: () => void;
  style?: any;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  showDetails = false,
  onPress,
  style,
}) => {
  const { syncStatus, forceSync, retryFailedItems } = useOfflineSync({
    autoSync: true,
    syncInterval: 30000,
  });

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return '#ff6b6b';
    if (syncStatus.isSyncing) return '#ffd93d';
    if (syncStatus.failedItems > 0) return '#ff8c42';
    return '#51cf66';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.isSyncing) return 'Syncing...';
    if (syncStatus.failedItems > 0) return 'Sync Issues';
    return 'Synced';
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return '📴';
    if (syncStatus.isSyncing) return '🔄';
    if (syncStatus.failedItems > 0) return '⚠️';
    return '✅';
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.statusRow}>
        <View style={styles.statusIndicator}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor() }
            ]}
          />
        </View>

        <View style={styles.statusInfo}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
          {syncStatus.lastSyncTime && (
            <Text style={styles.lastSyncText}>
              Last sync: {syncStatus.lastSyncTime.toLocaleTimeString()}
            </Text>
          )}
        </View>

        {(syncStatus.pendingItems > 0 || syncStatus.failedItems > 0) && (
          <Badge
            text={`${syncStatus.pendingItems + syncStatus.failedItems}`}
            variant={syncStatus.failedItems > 0 ? 'error' : 'warning'}
          />
        )}
      </View>

      {showDetails && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Pending:</Text>
            <Text style={styles.detailValue}>{syncStatus.pendingItems}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Failed:</Text>
            <Text style={styles.detailValue}>{syncStatus.failedItems}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Conflicts:</Text>
            <Text style={styles.detailValue}>{syncStatus.conflicts}</Text>
          </View>

          <View style={styles.actionButtons}>
            <Button
              title="Sync Now"
              onPress={forceSync}
              disabled={!syncStatus.isOnline || syncStatus.isSyncing}
              size="small"
              variant="primary"
            />

            {syncStatus.failedItems > 0 && (
              <Button
                title="Retry Failed"
                onPress={retryFailedItems}
                disabled={!syncStatus.isOnline || syncStatus.isSyncing}
                size="small"
                variant="secondary"
              />
            )}
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  detailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
});

export default SyncStatusIndicator;
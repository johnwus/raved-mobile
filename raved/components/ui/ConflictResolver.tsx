import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';

interface ConflictData {
  id: string;
  entityType: string;
  entityId: string;
  localVersion: number;
  serverVersion: number;
  localData: any;
  serverData: any;
  status: 'pending' | 'resolved';
}

interface ConflictResolverProps {
  visible: boolean;
  onResolve?: () => void;
  onCancel?: () => void;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({
  visible,
  onResolve,
  onCancel,
}) => {
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [resolving, setResolving] = useState<string | null>(null);
  useOfflineSync();

  useEffect(() => {
    if (visible) {
      loadConflicts();
    }
  }, [visible]);

  const loadConflicts = async () => {
    // In a real implementation, this would fetch conflicts from the sync service
    // For now, we'll simulate some conflicts
    const mockConflicts: ConflictData[] = [
      {
        id: 'conflict_1',
        entityType: 'post',
        entityId: 'post_123',
        localVersion: 2,
        serverVersion: 3,
        localData: { title: 'My Local Title', content: 'Local content' },
        serverData: { title: 'Server Title', content: 'Server content updated' },
        status: 'pending',
      },
      {
        id: 'conflict_2',
        entityType: 'profile',
        entityId: 'user_456',
        localVersion: 1,
        serverVersion: 2,
        localData: { name: 'John Local', bio: 'Local bio' },
        serverData: { name: 'John Server', bio: 'Server bio updated' },
        status: 'pending',
      },
    ];

    setConflicts(mockConflicts);
  };

  const resolveConflict = async (
    conflictId: string,
    strategy: 'local_wins' | 'server_wins' | 'merge' | 'manual',
    _mergedData?: any
  ) => {
    setResolving(conflictId);

    try {
      // In a real implementation, this would call the backend API
      console.log(`Resolving conflict ${conflictId} with strategy: ${strategy}`);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      setConflicts(prev =>
        prev.map(conflict =>
          conflict.id === conflictId
            ? { ...conflict, status: 'resolved' as const }
            : conflict
        )
      );

      Alert.alert('Success', 'Conflict resolved successfully');

    } catch {
      Alert.alert('Error', 'Failed to resolve conflict');
    } finally {
      setResolving(null);
    }
  };

  const renderConflictCard = (conflict: ConflictData) => {
    const renderDataComparison = (label: string, localData: any, serverData: any) => (
      <View style={styles.dataComparison}>
        <Text style={styles.dataLabel}>{label}</Text>
        <View style={styles.dataColumns}>
          <View style={styles.dataColumn}>
            <Text style={styles.columnHeader}>Local (v{conflict.localVersion})</Text>
            <ScrollView style={styles.dataContent}>
              <Text style={styles.dataText}>
                {JSON.stringify(localData, null, 2)}
              </Text>
            </ScrollView>
          </View>

          <View style={styles.dataColumn}>
            <Text style={styles.columnHeader}>Server (v{conflict.serverVersion})</Text>
            <ScrollView style={styles.dataContent}>
              <Text style={styles.dataText}>
                {JSON.stringify(serverData, null, 2)}
              </Text>
            </ScrollView>
          </View>
        </View>
      </View>
    );

    return (
      <Card key={conflict.id} style={styles.conflictCard}>
        <View style={styles.conflictHeader}>
          <View>
            <Text style={styles.conflictTitle}>
              {conflict.entityType} Conflict
            </Text>
            <Text style={styles.conflictSubtitle}>
              ID: {conflict.entityId}
            </Text>
          </View>
          <Badge
            text={conflict.status}
            variant={conflict.status === 'resolved' ? 'success' : 'warning'}
          />
        </View>

        {conflict.status === 'pending' && (
          <>
            {renderDataComparison('Data Comparison', conflict.localData, conflict.serverData)}

            <View style={styles.resolutionOptions}>
              <Text style={styles.optionsTitle}>Resolution Options:</Text>

              <View style={styles.buttonRow}>
                <Button
                  title="Keep Local"
                  onPress={() => resolveConflict(conflict.id, 'local_wins')}
                  disabled={resolving === conflict.id}
                  size="small"
                  variant="secondary"
                />

                <Button
                  title="Use Server"
                  onPress={() => resolveConflict(conflict.id, 'server_wins')}
                  disabled={resolving === conflict.id}
                  size="small"
                  variant="secondary"
                />
              </View>

              <View style={styles.buttonRow}>
                <Button
                  title="Merge Data"
                  onPress={() => resolveConflict(conflict.id, 'merge')}
                  disabled={resolving === conflict.id}
                  size="small"
                  variant="primary"
                />

                <Button
                  title="Manual Resolve"
                  onPress={() => {
                    // In a real app, this would open a merge editor
                    Alert.alert('Manual Resolution', 'Manual resolution not implemented in demo');
                  }}
                  disabled={resolving === conflict.id}
                  size="small"
                  variant="outline"
                />
              </View>
            </View>
          </>
        )}

        {conflict.status === 'resolved' && (
          <View style={styles.resolvedMessage}>
            <Text style={styles.resolvedText}>✓ Conflict resolved</Text>
          </View>
        )}
      </Card>
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sync Conflicts</Text>
        <Text style={styles.subtitle}>
          {conflicts.filter(c => c.status === 'pending').length} pending conflicts
        </Text>
      </View>

      <ScrollView style={styles.conflictsList}>
        {conflicts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No conflicts to resolve</Text>
          </View>
        ) : (
          conflicts.map(renderConflictCard)
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Close"
          onPress={onCancel || (() => {})}
          variant="outline"
          style={styles.closeButton}
        />

        {conflicts.some(c => c.status === 'resolved') && (
          <Button
            title="Apply Changes"
            onPress={onResolve || (() => {})}
            variant="primary"
            style={styles.applyButton}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  conflictsList: {
    flex: 1,
    padding: 16,
  },
  conflictCard: {
    marginBottom: 16,
  },
  conflictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  conflictTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  conflictSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  dataComparison: {
    marginBottom: 16,
  },
  dataLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  dataColumns: {
    flexDirection: 'row',
    gap: 12,
  },
  dataColumn: {
    flex: 1,
  },
  columnHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
    textAlign: 'center',
  },
  dataContent: {
    maxHeight: 150,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    padding: 8,
  },
  dataText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333333',
  },
  resolutionOptions: {
    marginTop: 16,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  resolvedMessage: {
    alignItems: 'center',
    padding: 16,
  },
  resolvedText: {
    fontSize: 16,
    color: '#51cf66',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 12,
  },
  closeButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});

export default ConflictResolver;
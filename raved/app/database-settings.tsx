import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export default function DatabaseSettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handle} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Database Configuration</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Hybrid Database Architecture</Text>
          <Text style={styles.infoText}>
            Raved uses a hybrid database approach with PostgreSQL and MongoDB for optimal performance and flexibility.
          </Text>
        </View>

        {/* PostgreSQL Configuration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="server" size={20} color="#2563EB" />
            <Text style={styles.sectionTitle}>PostgreSQL</Text>
          </View>
          
          <View style={styles.configCard}>
            <Text style={styles.configLabel}>Connection Status</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Connected</Text>
            </View>
          </View>

          <View style={styles.configCard}>
            <Text style={styles.configLabel}>Database</Text>
            <Text style={styles.configValue}>raved_app</Text>
          </View>

          <View style={styles.configCard}>
            <Text style={styles.configLabel}>Entities</Text>
            <View style={styles.entitiesList}>
              {['Users', 'Communities', 'Marketplace', 'Events'].map((entity) => (
                <View key={entity} style={styles.entityItem}>
                  <Text style={styles.entityName}>{entity}</Text>
                  <View style={styles.entityBadge}>
                    <Text style={styles.entityBadgeText}>Core Data</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* MongoDB Configuration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="leaf" size={20} color="#16A34A" />
            <Text style={styles.sectionTitle}>MongoDB</Text>
          </View>
          
          <View style={styles.configCard}>
            <Text style={styles.configLabel}>Connection Status</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Connected</Text>
            </View>
          </View>

          <View style={styles.configCard}>
            <Text style={styles.configLabel}>Database</Text>
            <Text style={styles.configValue}>raved_app</Text>
          </View>

          <View style={styles.configCard}>
            <Text style={styles.configLabel}>Collections</Text>
            <View style={styles.entitiesList}>
              {['Posts', 'Stories', 'Messages', 'Notifications', 'Analytics'].map((collection) => (
                <View key={collection} style={styles.entityItem}>
                  <Text style={styles.entityName}>{collection}</Text>
                  <View style={[styles.entityBadge, styles.entityBadgeGreen]}>
                    <Text style={[styles.entityBadgeText, styles.entityBadgeTextGreen]}>
                      Content
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[3],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: theme.spacing[2],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
  },
  headerTitle: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  closeButton: {
    padding: theme.spacing[1],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  infoCard: {
    backgroundColor: '#DBEAFE',
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#1E40AF',
    marginBottom: theme.spacing[2],
  },
  infoText: {
    fontSize: theme.typography.fontSize[14],
    color: '#1E3A8A',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#F9FAFB',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#374151',
  },
  configCard: {
    backgroundColor: '#FFFFFF',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
  },
  configLabel: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#374151',
    marginBottom: theme.spacing[1],
  },
  configValue: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: theme.typography.fontSize[14],
    color: '#059669',
    fontWeight: theme.typography.fontWeight.medium,
  },
  entitiesList: {
    gap: theme.spacing[2],
  },
  entityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entityName: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  entityBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  entityBadgeGreen: {
    backgroundColor: '#D1FAE5',
  },
  entityBadgeText: {
    fontSize: theme.typography.fontSize[10],
    color: '#2563EB',
    fontWeight: theme.typography.fontWeight.medium,
  },
  entityBadgeTextGreen: {
    color: '#059669',
  },
});


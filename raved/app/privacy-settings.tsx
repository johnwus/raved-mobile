import React, { useState } from 'react';
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
import { Toggle } from '../components/ui/Toggle';
import { useAuth } from '../hooks/useAuth';

export default function PrivacySettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [privateAccount, setPrivateAccount] = useState(user?.isPrivate || false);
  const [showActivity, setShowActivity] = useState(user?.showActivity ?? true);
  const [readReceipts, setReadReceipts] = useState(user?.readReceipts ?? true);
  const [allowDownloads, setAllowDownloads] = useState(user?.allowDownloads || false);
  const [allowStorySharing, setAllowStorySharing] = useState(user?.allowStorySharing ?? true);
  const [analytics, setAnalytics] = useState(user?.analytics ?? true);
  const [personalizedAds, setPersonalizedAds] = useState(user?.personalizedAds ?? true);

  const SettingSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const ToggleItem = ({
    label,
    description,
    value,
    onValueChange,
  }: {
    label: string;
    description?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.toggleItem}>
      <View style={styles.toggleItemLeft}>
        <View style={styles.toggleItemText}>
          <Text style={styles.toggleItemLabel}>{label}</Text>
          {description && (
            <Text style={styles.toggleItemDescription}>{description}</Text>
          )}
        </View>
      </View>
      <Toggle value={value} onValueChange={onValueChange} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Privacy Settings</Text>
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
        <SettingSection title="Account Privacy">
          <ToggleItem
            label="Private Account"
            description="Only approved followers can see your posts"
            value={privateAccount}
            onValueChange={setPrivateAccount}
          />
        </SettingSection>

        <SettingSection title="Activity Privacy">
          <ToggleItem
            label="Show Activity Status"
            description="Let others see when you're active"
            value={showActivity}
            onValueChange={setShowActivity}
          />
          <ToggleItem
            label="Read Receipts"
            description="Show when you've read messages"
            value={readReceipts}
            onValueChange={setReadReceipts}
          />
        </SettingSection>

        <SettingSection title="Content Privacy">
          <ToggleItem
            label="Allow Downloads"
            description="Let others download your photos"
            value={allowDownloads}
            onValueChange={setAllowDownloads}
          />
          <ToggleItem
            label="Story Sharing"
            description="Allow others to share your stories"
            value={allowStorySharing}
            onValueChange={setAllowStorySharing}
          />
        </SettingSection>

        <SettingSection title="Data & Analytics">
          <ToggleItem
            label="Analytics Tracking"
            description="Help improve Raved with usage data"
            value={analytics}
            onValueChange={setAnalytics}
          />
          <ToggleItem
            label="Personalized Ads"
            description="Show ads based on your interests"
            value={personalizedAds}
            onValueChange={setPersonalizedAds}
          />
        </SettingSection>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Blocked Accounts</Text>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Ionicons name="person-remove-outline" size={20} color="#6B7280" />
              <Text style={styles.settingItemLabel}>Manage Blocked Users</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>0</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
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
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[3],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  section: {
    backgroundColor: '#F9FAFB',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#374151',
    marginBottom: theme.spacing[1],
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[3],
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing[1],
  },
  toggleItemLeft: {
    flex: 1,
  },
  toggleItemText: {
    flex: 1,
  },
  toggleItemLabel: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#374151',
  },
  toggleItemDescription: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
    marginTop: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[3],
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
  },
  settingItemLabel: {
    fontSize: theme.typography.fontSize[14],
    color: '#374151',
    flex: 1,
  },
  badge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  badgeText: {
    fontSize: theme.typography.fontSize[12],
    color: '#DC2626',
    fontWeight: theme.typography.fontWeight.medium,
  },
});


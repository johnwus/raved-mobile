import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { Toggle } from '../components/ui/Toggle';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';

export default function ProfileSettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { isDark, toggleDarkMode } = useTheme();
  
  const [privateAccount, setPrivateAccount] = useState(user?.isPrivate || false);
  const [showActivity, setShowActivity] = useState(user?.showActivity ?? true);
  const [readReceipts, setReadReceipts] = useState(user?.readReceipts ?? true);
  const [allowDownloads, setAllowDownloads] = useState(user?.allowDownloads || false);
  const [allowStorySharing, setAllowStorySharing] = useState(user?.allowStorySharing ?? true);
  const [analytics, setAnalytics] = useState(user?.analytics ?? true);
  const [personalizedAds, setPersonalizedAds] = useState(user?.personalizedAds ?? true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login' as any);
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you absolutely sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          },
        },
      ]
    );
  };

  const SettingSection = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={20} color={theme.colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const SettingItem = ({ 
    icon, 
    label, 
    onPress, 
    rightElement,
    badge,
  }: { 
    icon: string; 
    label: string; 
    onPress?: () => void;
    rightElement?: React.ReactNode;
    badge?: string;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons name={icon as any} size={20} color="#6B7280" />
        <Text style={styles.settingItemLabel}>{label}</Text>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      {rightElement || (onPress && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      ))}
    </TouchableOpacity>
  );

  const ToggleItem = ({
    icon,
    label,
    description,
    value,
    onValueChange,
  }: {
    icon: string;
    label: string;
    description?: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => (
    <View style={styles.toggleItem}>
      <View style={styles.toggleItemLeft}>
        <Ionicons name={icon as any} size={20} color="#6B7280" />
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Settings</Text>
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
        {/* Account Settings */}
        <SettingSection title="Account" icon="person-circle-outline">
          <SettingItem
            icon="create-outline"
            label="Edit Profile"
            onPress={() => router.push('/edit-profile' as any)}
          />
          <SettingItem
            icon="camera-outline"
            label="Change Avatar"
            onPress={() => router.push('/avatar-picker' as any)}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            label="Privacy Settings"
            onPress={() => router.push('/privacy-settings' as any)}
          />
        </SettingSection>

        {/* Appearance Settings */}
        <SettingSection title="Appearance" icon="color-palette-outline">
          <View style={styles.toggleItem}>
            <View style={styles.toggleItemLeft}>
              <Ionicons name="moon-outline" size={20} color="#6B7280" />
              <Text style={styles.toggleItemLabel}>Dark Mode</Text>
            </View>
            <Toggle value={isDark} onValueChange={toggleDarkMode} />
          </View>
          <SettingItem
            icon="brush-outline"
            label="Theme Colors"
            badge="Raved Classic"
            onPress={() => router.push('/themes' as any)}
          />
          <SettingItem
            icon="language-outline"
            label="Language"
            badge="English"
            onPress={() => router.push('/language-settings' as any)}
          />
        </SettingSection>

        {/* Developer Settings */}
        <SettingSection title="Developer" icon="code-outline">
          <SettingItem
            icon="server-outline"
            label="Database Configuration"
            badge="Hybrid"
            onPress={() => router.push('/database-settings' as any)}
          />
          <SettingItem
            icon="cloud-outline"
            label="API Settings"
            onPress={() => router.push('/api-settings' as any)}
          />
        </SettingSection>

        {/* Premium Settings */}
        <View style={styles.premiumSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={styles.premiumSectionTitle}>Premium</Text>
          </View>
          <SettingItem
            icon="star-outline"
            label="Manage Subscription"
            onPress={() => router.push('/subscription' as any)}
          />
          <SettingItem
            icon="storefront-outline"
            label="Seller Dashboard"
            onPress={() => router.push('/seller-dashboard' as any)}
          />
        </View>

        {/* Support & Info */}
        <SettingSection title="Support & Info" icon="help-circle-outline">
          <SettingItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => router.push('/help' as any)}
          />
          <SettingItem
            icon="information-circle-outline"
            label="About Raved"
            onPress={() => router.push('/about' as any)}
          />
          <SettingItem
            icon="document-text-outline"
            label="Terms & Privacy"
            onPress={() => {}}
          />
        </SettingSection>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning-outline" size={20} color="#EF4444" />
            <Text style={styles.dangerSectionTitle}>Account Actions</Text>
          </View>
          <SettingItem
            icon="log-out-outline"
            label="Sign Out"
            onPress={handleSignOut}
          />
          <SettingItem
            icon="trash-outline"
            label="Delete Account"
            onPress={handleDeleteAccount}
          />
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[1],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#374151',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[3],
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing[1],
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
    backgroundColor: '#EFF6FF',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  badgeText: {
    fontSize: theme.typography.fontSize[12],
    color: '#2563EB',
    fontWeight: theme.typography.fontWeight.medium,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
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
  premiumSection: {
    backgroundColor: '#FFFBEB',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  premiumSectionTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#92400E',
  },
  dangerSection: {
    backgroundColor: '#FEF2F2',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerSectionTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#991B1B',
  },
});


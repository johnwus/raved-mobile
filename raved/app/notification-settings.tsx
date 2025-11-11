import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

interface NotificationPreferences {
  pushEnabled: boolean;
  likes: boolean;
  comments: boolean;
  follows: boolean;
  mentions: boolean;
  messages: boolean;
  events: boolean;
  sales: boolean;
  marketing: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const defaultPreferences: NotificationPreferences = {
  pushEnabled: true,
  likes: true,
  comments: true,
  follows: true,
  mentions: true,
  messages: true,
  events: true,
  sales: true,
  marketing: false,
  soundEnabled: true,
  vibrationEnabled: true,
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await api.get('/users/notification-preferences');
      if (response.data.preferences) {
        setPreferences({ ...defaultPreferences, ...response.data.preferences });
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      // Use defaults if API fails
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    try {
      setLoading(true);
      await api.put('/users/notification-preferences', {
        preferences: newPreferences,
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      // Revert on error
      setPreferences(preferences);
    } finally {
      setLoading(false);
    }
  };

  const notificationSections = [
    {
      title: 'General',
      items: [
        {
          key: 'pushEnabled' as keyof NotificationPreferences,
          label: 'Push Notifications',
          description: 'Receive push notifications on your device',
        },
        {
          key: 'soundEnabled' as keyof NotificationPreferences,
          label: 'Sound',
          description: 'Play sound for notifications',
        },
        {
          key: 'vibrationEnabled' as keyof NotificationPreferences,
          label: 'Vibration',
          description: 'Vibrate device for notifications',
        },
      ],
    },
    {
      title: 'Activity',
      items: [
        {
          key: 'likes' as keyof NotificationPreferences,
          label: 'Likes',
          description: 'When someone likes your posts',
        },
        {
          key: 'comments' as keyof NotificationPreferences,
          label: 'Comments',
          description: 'When someone comments on your posts',
        },
        {
          key: 'follows' as keyof NotificationPreferences,
          label: 'Follows',
          description: 'When someone follows you',
        },
        {
          key: 'mentions' as keyof NotificationPreferences,
          label: 'Mentions',
          description: 'When someone mentions you',
        },
      ],
    },
    {
      title: 'Communication',
      items: [
        {
          key: 'messages' as keyof NotificationPreferences,
          label: 'Messages',
          description: 'New messages and replies',
        },
        {
          key: 'events' as keyof NotificationPreferences,
          label: 'Events',
          description: 'Event invitations and updates',
        },
      ],
    },
    {
      title: 'Business',
      items: [
        {
          key: 'sales' as keyof NotificationPreferences,
          label: 'Sales',
          description: 'When your items are purchased',
        },
        {
          key: 'marketing' as keyof NotificationPreferences,
          label: 'Marketing',
          description: 'Promotional offers and updates',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handle} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {notificationSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.settingItem}>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingDescription}>{item.description}</Text>
                </View>
                <Switch
                  value={preferences[item.key]}
                  onValueChange={(value) => updatePreference(item.key, value)}
                  disabled={loading}
                  trackColor={{ false: '#D1D5DB', true: theme.colors.primary + '80' }}
                  thumbColor={preferences[item.key] ? theme.colors.primary : '#F9FAFB'}
                />
              </View>
            ))}
          </View>
        ))}

        {/* Test Notification Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={async () => {
              try {
                const response = await api.post('/notifications/test', {
                  userId: user?.id,
                  message: 'This is a test notification to verify your settings are working.',
                });
                alert('Test notification sent! Check your device.');
              } catch (error) {
                console.error('Error sending test notification:', error);
                alert('Failed to send test notification. Please try again.');
              }
            }}
          >
            <Ionicons name="notifications" size={20} color={theme.colors.primary} />
            <Text style={styles.testButtonText}>Send Test Notification</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
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
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    marginBottom: theme.spacing[3],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingContent: {
    flex: 1,
    marginRight: theme.spacing[3],
  },
  settingLabel: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
    lineHeight: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing[2],
  },
  testButtonText: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
  },
});
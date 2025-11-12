import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';

interface ThemeAnalytics {
  themeDistribution: {
    theme_preference: string;
    count: number;
    dark_mode_users: number;
    light_mode_users: number;
  }[];
  dailyChanges: {
    date: string;
    changes: number;
  }[];
  period: string;
}

interface ThemeUsageStats {
  totalUsers: number;
  usersWithThemes: number;
  darkModeUsers: number;
  themeBreakdown: {
    theme_preference: string;
    count: number;
  }[];
  adoptionRate: number;
}

export default function AdminThemesScreen() {
  const router = useRouter();
  const { currentColors } = useTheme();
  const [analytics, setAnalytics] = useState<ThemeAnalytics | null>(null);
  const [usageStats, setUsageStats] = useState<ThemeUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = React.useCallback(async () => {
    // Implement token retrieval logic
    return 'your-auth-token';
  }, []);

  const loadThemeData = React.useCallback(async () => {
    try {
      setError(null);
      const [analyticsResponse, statsResponse] = await Promise.all([
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/themes/admin/analytics`, {
          headers: {
            'Authorization': `Bearer ${await getAuthToken()}`,
          },
        }),
        fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/themes/admin/usage`, {
          headers: {
            'Authorization': `Bearer ${await getAuthToken()}`,
          },
        }),
      ]);

      if (!analyticsResponse.ok || !statsResponse.ok) {
        throw new Error('Failed to load theme data');
      }

      const analyticsData = await analyticsResponse.json();
      const statsData = await statsResponse.json();

      setAnalytics(analyticsData.analytics);
      setUsageStats(statsData.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load theme data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    loadThemeData();
  }, [loadThemeData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadThemeData();
  };

  const setDefaultTheme = async (themeId: string, darkMode: boolean) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/themes/admin/default`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({ themeId, darkMode }),
      });

      if (!response.ok) {
        throw new Error('Failed to set default theme');
      }

      Alert.alert('Success', 'Default theme updated successfully');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to set default theme');
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState title="Failed to Load Theme Data" message={error} onRetry={loadThemeData} />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handle} />
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>🎨 Theme Management</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={currentColors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Usage Statistics */}
        {usageStats && (
          <Card style={styles.statsCard}>
            <Text style={[styles.cardTitle, { color: currentColors.text }]}>📊 Usage Statistics</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: currentColors.primary }]}>{usageStats.totalUsers}</Text>
                <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>Total Users</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: currentColors.primary }]}>{usageStats.usersWithThemes}</Text>
                <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>With Themes</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: currentColors.primary }]}>{usageStats.darkModeUsers}</Text>
                <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>Dark Mode</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: currentColors.primary }]}>
                  {(usageStats.adoptionRate * 100).toFixed(1)}%
                </Text>
                <Text style={[styles.statLabel, { color: currentColors.textSecondary }]}>Adoption Rate</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Theme Distribution */}
        {analytics && (
          <Card style={styles.distributionCard}>
            <Text style={[styles.cardTitle, { color: currentColors.text }]}>🎨 Theme Distribution</Text>

            {analytics.themeDistribution.map((theme) => (
              <View key={theme.theme_preference} style={styles.themeRow}>
                <View style={styles.themeInfo}>
                  <Text style={[styles.themeName, { color: currentColors.text }]}>
                    {theme.theme_preference}
                  </Text>
                  <Text style={[styles.themeCount, { color: currentColors.textSecondary }]}>
                    {theme.count} users
                  </Text>
                </View>

                <View style={styles.modeBreakdown}>
                  <View style={styles.modeItem}>
                    <Ionicons name="sunny" size={16} color="#F59E0B" />
                    <Text style={[styles.modeCount, { color: currentColors.textSecondary }]}>
                      {theme.light_mode_users}
                    </Text>
                  </View>

                  <View style={styles.modeItem}>
                    <Ionicons name="moon" size={16} color="#6366F1" />
                    <Text style={[styles.modeCount, { color: currentColors.textSecondary }]}>
                      {theme.dark_mode_users}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Daily Changes */}
        {analytics && analytics.dailyChanges.length > 0 && (
          <Card style={styles.changesCard}>
            <Text style={[styles.cardTitle, { color: currentColors.text }]}>📈 Daily Changes</Text>

            {analytics.dailyChanges.slice(0, 7).map((change) => (
              <View key={change.date} style={styles.changeRow}>
                <Text style={[styles.changeDate, { color: currentColors.text }]}>
                  {new Date(change.date).toLocaleDateString()}
                </Text>
                <Text style={[styles.changeCount, { color: currentColors.primary }]}>
                  {change.changes} changes
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* Admin Actions */}
        <Card style={styles.actionsCard}>
          <Text style={[styles.cardTitle, { color: currentColors.text }]}>⚙️ Admin Actions</Text>

          <View style={styles.actionButtons}>
            <Button
              title="Set Default Theme"
              onPress={() => {
                Alert.alert(
                  'Set Default Theme',
                  'Choose default theme for new users',
                  [
                    { text: 'Default Light', onPress: () => setDefaultTheme('default', false) },
                    { text: 'Default Dark', onPress: () => setDefaultTheme('default', true) },
                    { text: 'Cancel', style: 'cancel' },
                  ]
                );
              }}
              variant="secondary"
              size="small"
              style={styles.actionButton}
            />

            <Button
              title="Export Analytics"
              onPress={() => {
                // Implement export functionality
                Alert.alert('Export', 'Analytics export feature coming soon!');
              }}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  distributionCard: {
    marginBottom: 16,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  themeCount: {
    fontSize: 14,
  },
  modeBreakdown: {
    flexDirection: 'row',
    gap: 16,
  },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modeCount: {
    fontSize: 14,
  },
  changesCard: {
    marginBottom: 16,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  changeDate: {
    fontSize: 14,
  },
  changeCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionsCard: {
    marginBottom: 16,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    width: '100%',
  },
});
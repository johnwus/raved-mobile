import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { mockUsers } from '../utils/mockData';

type ConnectionType = 'all' | 'following' | 'followers' | 'requests' | 'suggested';

interface Connection {
  id: string;
  user: typeof mockUsers[0];
  type: 'following' | 'follower' | 'mutual' | 'pending' | 'suggested';
  mutualFriends?: number;
  reason?: string;
}

const mockConnections: Connection[] = [
  {
    id: 'c1',
    user: mockUsers[0],
    type: 'following',
    mutualFriends: 12,
  },
  {
    id: 'c2',
    user: mockUsers[1],
    type: 'follower',
    mutualFriends: 8,
  },
  {
    id: 'c3',
    user: mockUsers[2],
    type: 'mutual',
    mutualFriends: 20,
  },
  {
    id: 'c4',
    user: mockUsers[3],
    type: 'pending',
    mutualFriends: 7,
  },
  {
    id: 'c5',
    user: mockUsers[4],
    type: 'suggested',
    mutualFriends: 25,
    reason: 'Same faculty',
  },
  {
    id: 'c6',
    user: mockUsers[5],
    type: 'suggested',
    mutualFriends: 15,
    reason: 'Mutual friends',
  },
];

const connectionFilters: { id: ConnectionType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'following', label: 'Following' },
  { id: 'followers', label: 'Followers' },
  { id: 'requests', label: 'Requests' },
  { id: 'suggested', label: 'Suggested' },
];

export default function ConnectionsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<ConnectionType>('all');

  const filteredConnections = mockConnections.filter(conn => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'requests') return conn.type === 'pending';
    if (activeFilter === 'suggested') return conn.type === 'suggested';
    return conn.type === activeFilter;
  });

  const totalConnections = mockConnections.length;

  const getActionButton = (connection: Connection) => {
    switch (connection.type) {
      case 'following':
        return (
          <Button
            title="Following"
            onPress={() => {}}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
        );
      case 'follower':
        return (
          <Button
            title="Follow Back"
            onPress={() => {}}
            variant="primary"
            size="small"
            style={styles.actionButton}
          />
        );
      case 'mutual':
        return (
          <Button
            title="Message"
            onPress={() => {
              // Navigate to chat - in a real app, this would create/find a chat with this user
              router.push('/chat' as any);
            }}
            variant="primary"
            size="small"
            style={styles.actionButton}
          />
        );
      case 'pending':
        return (
          <View style={styles.pendingActions}>
            <Button
              title="Accept"
              onPress={() => {}}
              variant="primary"
              size="small"
              style={styles.actionButton}
            />
            <Button
              title="Decline"
              onPress={() => {}}
              variant="outline"
              size="small"
              style={styles.actionButton}
            />
          </View>
        );
      case 'suggested':
        return (
          <Button
            title="Follow"
            onPress={() => {}}
            variant="primary"
            size="small"
            style={styles.actionButton}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handle} />
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>Connections</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalConnections}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Connection Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          {connectionFilters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterPill,
                activeFilter === filter.id && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === filter.id && styles.filterPillTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Connections List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredConnections.length > 0 ? (
          <FlatList
            data={filteredConnections}
            renderItem={({ item }) => (
              <View style={styles.connectionCard}>
                <View style={styles.connectionInfo}>
                  <View style={styles.avatarContainer}>
                    <Avatar uri={item.user.avatar} size={48} />
                    {item.type === 'mutual' && (
                      <View style={styles.mutualBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                      </View>
                    )}
                  </View>
                  <View style={styles.connectionDetails}>
                    <Text style={styles.connectionName}>{item.user.name}</Text>
                    <Text style={styles.connectionFaculty}>{item.user.faculty}</Text>
                    {item.mutualFriends && (
                      <Text style={styles.mutualText}>
                        {item.mutualFriends} mutual friends
                      </Text>
                    )}
                    {item.reason && (
                      <Text style={styles.reasonText}>{item.reason}</Text>
                    )}
                  </View>
                </View>
                {getActionButton(item)}
              </View>
            )}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => (
              <View style={{ height: 1, backgroundColor: '#F3F4F6' }} />
            )}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <EmptyState
            icon="people-outline"
            title="No connections to show"
          />
        )}
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
    marginBottom: theme.spacing[3],
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  headerTitle: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  badge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: theme.typography.fontSize[10],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  filtersScroll: {
    marginHorizontal: theme.spacing[4],
  },
  filtersContent: {
    gap: theme.spacing[2],
  },
  filterPill: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#F3F4F6',
  },
  filterPillActive: {
    backgroundColor: theme.colors.primary,
  },
  filterPillText: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#374151',
  },
  filterPillTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  listContent: {
    padding: theme.spacing[4],
  },
  connectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[4],
    gap: theme.spacing[3],
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  mutualBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  connectionDetails: {
    flex: 1,
  },
  connectionName: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    marginBottom: 2,
  },
  connectionFaculty: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
    marginBottom: 2,
  },
  mutualText: {
    fontSize: theme.typography.fontSize[11],
    color: '#9CA3AF',
  },
  reasonText: {
    fontSize: theme.typography.fontSize[11],
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
  actionButton: {
    minWidth: 100,
  },
  pendingActions: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing[12],
    gap: theme.spacing[3],
  },
  emptyText: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
  },
});


import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { EmptyState } from '../components/ui/EmptyState';
import { userApi } from '../services/userApi';
import { connectionsApi } from '../services/connectionsApi';
import { useAuth } from '../hooks/useAuth';

type ConnectionType = 'all' | 'following' | 'followers' | 'requests' | 'suggested';

interface Connection {
  id: string;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    name: string;
    avatarUrl?: string;
    avatar?: string;
    faculty: string;
  };
  type: 'following' | 'follower' | 'mutual' | 'pending' | 'suggested';
  isMutual?: boolean;
  isFollowing?: boolean;
  mutualFriends?: number;
  reason?: string;
}

const connectionFilters: { id: ConnectionType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'following', label: 'Following' },
  { id: 'followers', label: 'Followers' },
  { id: 'requests', label: 'Requests' },
  { id: 'suggested', label: 'Suggested' },
];

export default function ConnectionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<ConnectionType>('all');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [_pendingRequests, _setPendingRequests] = useState<any[]>([]);
  const [_loading, _setLoading] = useState(true);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        _setLoading(true);
        const type = activeFilter === 'following' ? 'following' : activeFilter === 'followers' ? 'followers' : undefined;
        const response = await userApi.getConnections(undefined, type as any);
        
        if (response.success) {
          const allConnections: Connection[] = [];
          
          // Add following
          if (response.following) {
            response.following.forEach((conn: any) => {
              allConnections.push({
                id: conn.id,
                user: {
                  id: conn.id,
                  username: conn.username,
                  firstName: conn.firstName,
                  lastName: conn.lastName,
                  name: conn.name,
                  avatarUrl: conn.avatarUrl,
                  avatar: conn.avatarUrl,
                  faculty: conn.faculty || '',
                },
                type: 'following',
                isMutual: conn.isMutual,
                isFollowing: true,
              });
            });
          }
          
          // Add followers
          if (response.followers) {
            response.followers.forEach((conn: any) => {
              allConnections.push({
                id: conn.id,
                user: {
                  id: conn.id,
                  username: conn.username,
                  firstName: conn.firstName,
                  lastName: conn.lastName,
                  name: conn.name,
                  avatarUrl: conn.avatarUrl,
                  avatar: conn.avatarUrl,
                  faculty: conn.faculty || '',
                },
                type: conn.isMutual ? 'mutual' : 'follower',
                isMutual: conn.isMutual,
                isFollowing: conn.isFollowing,
              });
            });
          }
          
          setConnections(allConnections);
        }

        // Fetch pending requests
        if (activeFilter === 'requests' || activeFilter === 'all') {
          try {
            const requestsResponse = await connectionsApi.getPendingFollowRequests();
            if (requestsResponse.success && requestsResponse.requests) {
              _setPendingRequests(requestsResponse.requests);
              // Add pending requests to connections
              requestsResponse.requests.forEach((req: any) => {
                setConnections(prev => [...prev, {
                  id: req.id || req.request_id,
                  user: {
                    id: req.id,
                    username: req.username,
                    firstName: req.first_name || req.firstName,
                    lastName: req.last_name || req.lastName,
                    name: `${req.first_name || req.firstName} ${req.last_name || req.lastName}`,
                    avatarUrl: req.avatar_url || req.avatarUrl,
                    avatar: req.avatar_url || req.avatarUrl,
                    faculty: req.faculty || '',
                  },
                  type: 'pending',
                }]);
              });
            }
          } catch (error) {
            console.error('Failed to fetch pending requests:', error);
          }
        }
      } catch (error) {
      console.error('Failed to fetch connections:', error);
    } finally {
      _setLoading(false);
    }
    };

    if (user) {
      fetchConnections();
    }
  }, [activeFilter, user]);

  const filteredConnections = connections.filter(conn => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'requests') return conn.type === 'pending';
    if (activeFilter === 'suggested') return conn.type === 'suggested';
    return conn.type === activeFilter;
  });

  const totalConnections = connections.length;

  const handleFollow = async (userId: string) => {
    try {
      await userApi.followUser(userId);
      // Refresh connections
      const response = await userApi.getConnections(undefined, activeFilter === 'following' ? 'following' : undefined as any);
      if (response.success) {
        // Update connections state
        setConnections(prev => prev.map(conn => 
          conn.user.id === userId ? { ...conn, type: 'following' as const, isFollowing: true } : conn
        ));
      }
    } catch (error) {
      console.error('Failed to follow user:', error);
      Alert.alert('Error', 'Failed to follow user');
    }
  };

  const handleUnfollow = async (userId: string) => {
    try {
      await userApi.unfollowUser(userId);
      // Remove from connections
      setConnections(prev => prev.filter(conn => conn.user.id !== userId));
    } catch (error) {
      console.error('Failed to unfollow user:', error);
      Alert.alert('Error', 'Failed to unfollow user');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await connectionsApi.approveFollowRequest(requestId);
      // Remove from pending and add to connections
      _setPendingRequests(prev => prev.filter(req => (req.id || req.request_id) !== requestId));
      setConnections(prev => prev.filter(conn => conn.id !== requestId));
    } catch (error) {
      console.error('Failed to accept request:', error);
      Alert.alert('Error', 'Failed to accept follow request');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await connectionsApi.rejectFollowRequest(requestId);
      // Remove from pending
      _setPendingRequests(prev => prev.filter(req => (req.id || req.request_id) !== requestId));
      setConnections(prev => prev.filter(conn => conn.id !== requestId));
    } catch (error) {
      console.error('Failed to reject request:', error);
      Alert.alert('Error', 'Failed to reject follow request');
    }
  };

  const handleStartChat = async (userId: string) => {
    try {
      const chatApi = (await import('../services/chatApi')).default;
      const response = await chatApi.startChat(userId);
      if (response.success && response.conversation) {
        router.push(`/chat/${response.conversation.id}` as any);
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const getActionButton = (connection: Connection) => {
    switch (connection.type) {
      case 'following':
        return (
          <Button
            title="Following"
            onPress={() => handleUnfollow(connection.user.id)}
            variant="outline"
            size="small"
            style={styles.actionButton}
          />
        );
      case 'follower':
        return (
          <Button
            title="Follow Back"
            onPress={() => handleFollow(connection.user.id)}
            variant="primary"
            size="small"
            style={styles.actionButton}
          />
        );
      case 'mutual':
        return (
          <Button
            title="Message"
            onPress={() => handleStartChat(connection.user.id)}
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
              onPress={() => handleAcceptRequest(connection.id)}
              variant="primary"
              size="small"
              style={styles.actionButton}
            />
            <Button
              title="Decline"
              onPress={() => handleRejectRequest(connection.id)}
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
            onPress={() => handleFollow(connection.user.id)}
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
                    {item.isMutual && (
                      <Text style={styles.mutualText}>
                        {item.mutualFriends || 0} mutual connections
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


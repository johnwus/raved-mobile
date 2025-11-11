import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import { usePosts } from '../../hooks/usePosts';
import { usePostsStore } from '../../store/postsStore';
import { Post } from '../../types';

type ProfileTab = 'posts' | 'comments' | 'liked' | 'saved';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { posts } = usePosts();
  const { likedPosts, savedPosts } = usePostsStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Please log in to view your profile</Text>
          <Button
            title="Go to Login"
            onPress={() => router.push('/(auth)/login' as any)}
            variant="primary"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Filter posts based on active tab
  const userPosts = posts.filter(p => p.user.id === user.id);
  const likedPostsList = posts.filter(p => likedPosts.has(p.id));
  const savedPostsList = posts.filter(p => savedPosts.has(p.id));

  const getTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return userPosts;
      case 'liked':
        return likedPostsList;
      case 'saved':
        return savedPostsList;
      case 'comments':
        return []; // Comments would need separate data structure
      default:
        return [];
    }
  };

  const renderPostGrid = (posts: Post[]) => {
    if (posts.length === 0) {
      const emptyConfig: Record<ProfileTab, { icon: keyof typeof Ionicons.glyphMap; text: string; action?: string }> = {
        posts: { icon: 'camera-outline', text: 'No posts yet', action: 'Create Your First Post' },
        comments: { icon: 'chatbubble-outline', text: 'No comments yet' },
        liked: { icon: 'heart-outline', text: 'No liked posts yet' },
        saved: { icon: 'bookmark-outline', text: 'No saved posts yet' },
      };
      const config = emptyConfig[activeTab];

      return (
        <EmptyState
          icon={config.icon}
          title={config.text}
          actionLabel={config.action}
          onAction={config.action && activeTab === 'posts' ? () => router.push('/(tabs)/create' as any) : undefined}
        />
      );
    }

    return (
      <FlatList
        data={posts}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postThumbnail}
            onPress={() => router.push(`/post/${item.id}` as any)}
          >
            <Image
              source={{ uri: item.media.url || item.media.items?.[0] || item.media.thumbnail || '' }}
              style={styles.thumbnailImage}
            />
            {item.media.type === 'video' && (
              <View style={styles.videoOverlay}>
                <Ionicons name="play" size={16} color="white" />
              </View>
            )}
            {item.media.type === 'carousel' && (
              <View style={styles.carouselOverlay}>
                <Ionicons name="copy" size={12} color="white" />
              </View>
            )}
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ width: 2 }} />}
        columnWrapperStyle={styles.postRow}
      />
    );
  };

  const renderComments = () => {
    return (
      <EmptyState
        icon="chatbubble-outline"
        title="No comments yet"
      />
    );
  };

  // Calculate total likes from user's posts
  const totalLikes = userPosts.reduce((sum, post) => sum + post.likes, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Avatar uri={user.avatar} size={80} />
                <TouchableOpacity 
                  style={styles.changeAvatarButton}
                  onPress={() => router.push('/avatar-picker' as any)}
                >
                  <Ionicons name="camera" size={12} color="white" />
                </TouchableOpacity>
                {/* Premium Badge placeholder - would show if user is premium */}
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.username}>@{user.username}</Text>
                <Text style={styles.bio}>{user.bio || 'No bio yet'}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={12} color="#9CA3AF" />
                  <Text style={styles.location}>
                    {user.location || 'No location'} • Joined May 2023
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.settingsButton}
              onPress={() => router.push('/profile-settings' as any)}
            >
              <Ionicons name="settings" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userPosts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalLikes}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="Edit Profile"
              onPress={() => {}}
              variant="primary"
              size="medium"
              leftIcon={<Ionicons name="create" size={16} color="white" />}
              style={styles.editButton}
            />
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Subscription Status Card */}
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionContent}>
              <View>
                <Text style={styles.subscriptionTitle}>Free Trial</Text>
                <Text style={styles.subscriptionSubtitle}>6 days remaining</Text>
              </View>
              <Button
                title="Upgrade"
                onPress={() => {}}
                variant="primary"
                size="small"
                leftIcon={<Ionicons name="diamond" size={12} color="white" />}
                style={styles.upgradeButton}
              />
            </View>
          </View>
        </View>

        {/* Profile Tabs */}
        <View style={styles.tabsContainer}>
          <View style={styles.tabsHeader}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
              onPress={() => setActiveTab('posts')}
            >
              <Ionicons
                name="grid"
                size={16}
                color={activeTab === 'posts' ? theme.colors.primary : '#6B7280'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'posts' && styles.tabTextActive,
                ]}
              >
                Posts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'comments' && styles.tabActive]}
              onPress={() => setActiveTab('comments')}
            >
              <Ionicons
                name="chatbubbles"
                size={16}
                color={activeTab === 'comments' ? theme.colors.primary : '#6B7280'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'comments' && styles.tabTextActive,
                ]}
              >
                Comments
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'liked' && styles.tabActive]}
              onPress={() => setActiveTab('liked')}
            >
              <Ionicons
                name="heart"
                size={16}
                color={activeTab === 'liked' ? theme.colors.primary : '#6B7280'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'liked' && styles.tabTextActive,
                ]}
              >
                Liked
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
              onPress={() => setActiveTab('saved')}
            >
              <Ionicons
                name="bookmark"
                size={16}
                color={activeTab === 'saved' ? theme.colors.primary : '#6B7280'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'saved' && styles.tabTextActive,
                ]}
              >
                Saved
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.tabContent}>
            {activeTab === 'comments' ? renderComments() : renderPostGrid(getTabContent())}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: theme.spacing[4],
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[4],
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
    marginBottom: 2,
  },
  username: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  bio: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: theme.typography.fontSize[12],
    color: '#9CA3AF',
  },
  settingsButton: {
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#F3F4F6',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing[4],
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: theme.typography.fontSize[10],
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  editButton: {
    flex: 1,
  },
  shareButton: {
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.xl,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
  },
  subscriptionCard: {
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#FCD34D',
    backgroundColor: '#FEF9C3',
  },
  subscriptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subscriptionTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#92400E',
    marginBottom: 2,
  },
  subscriptionSubtitle: {
    fontSize: theme.typography.fontSize[12],
    color: '#A16207',
  },
  upgradeButton: {
    minWidth: 100,
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    marginTop: theme.spacing[2],
  },
  tabsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[1],
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#6B7280',
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  tabContent: {
    padding: theme.spacing[4],
    minHeight: 300,
  },
  postRow: {
    gap: 2,
  },
  postThumbnail: {
    flex: 1,
    aspectRatio: 1,
    margin: 0.5,
    borderRadius: theme.borderRadius.base,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 4,
  },
  carouselOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 4,
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
  emptyActionButton: {
    marginTop: theme.spacing[2],
  },
});

import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Post } from '../../../types';
import { EmptyState } from '../../../components/ui/EmptyState';

interface PostsGridTabProps {
  posts: Post[];
  activeTab: 'posts' | 'liked';
}

export const PostsGridTab = ({ posts, activeTab }: PostsGridTabProps) => {
  const router = useRouter();

  if (posts.length === 0) {
    const emptyConfig: Record<'posts' | 'liked', { icon: keyof typeof Ionicons.glyphMap; text: string; action?: string }> = {
      posts: { icon: 'camera-outline', text: 'No posts yet', action: 'Create Your First Post' },
      liked: { icon: 'heart-outline', text: 'No liked posts yet' },
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
      key={`posts-grid-${activeTab}`}
      scrollEnabled={false}
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
      keyExtractor={(item, index) => `grid-${activeTab}-post-${String(item.id)}-${String(index)}`}
      ItemSeparatorComponent={() => <View style={{ width: 2 }} />}
      columnWrapperStyle={styles.postRow}
    />
  );
};

const styles = StyleSheet.create({
  postThumbnail: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postRow: {
    justifyContent: 'space-between',
  },
});

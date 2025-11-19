import React, { useEffect, useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { postsApi } from '../../services/postsApi';
import { theme } from '../../theme';
import { Avatar } from '../../components/ui/Avatar';
import { usePostsStore } from '../../store/postsStore';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { VideoView, useVideoPlayer } from 'expo-video';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { likePost, unlikePost, savePost, unsavePost } = usePostsStore();

  // Create video player only for video posts
  const videoUrl = useMemo(() => {
    return post?.media?.type === 'video' ? (post.media.url || post.media.thumbnail || '') : '';
  }, [post?.media]);

  const videoPlayer = useVideoPlayer(videoUrl, (player) => {
    if (videoUrl) {
      player.loop = false;
      player.muted = false;
    }
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await postsApi.getPost(String(id));
        setPost(res.post || res);
      } catch (e) {
        console.error('Failed to load post', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading || !post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ padding: theme.spacing[4], gap: theme.spacing[3] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <SkeletonLoader height={36} width={36} borderRadius={18} />
            <View style={{ flex: 1 }}>
              <SkeletonLoader height={12} style={{ width: '50%' }} />
              <SkeletonLoader height={10} style={{ width: '30%', marginTop: 6 }} />
            </View>
          </View>
          <SkeletonLoader height={320} />
          <SkeletonLoader height={12} style={{ width: '60%' }} />
        </View>
      </SafeAreaView>
    );
  }

  const handleLike = () => {
    if (post.liked) unlikePost(post.id); else likePost(post.id);
    setPost({ ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 });
  };

  const handleSave = () => {
    if (post.saved) unsavePost(post.id); else savePost(post.id);
    setPost({ ...post, saved: !post.saved });
  };

  const renderMedia = () => {
    if (post.media?.type === 'image') {
      return (
        <Image source={{ uri: post.media.url }} style={styles.media} resizeMode="cover" />
      );
    }
    if (post.media?.type === 'video') {
      return (
        <View style={styles.videoContainer}>
          {videoPlayer && (
            <VideoView
              style={styles.media}
              player={videoPlayer}
              nativeControls={true}
            />
          )}
        </View>
      );
    }
    if (post.media?.type === 'carousel') {
      const items = post.media.items || [];
      return (
        <FlatList
          data={items}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.mediaCarousel} resizeMode="cover" />
          )}
        />
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.card}>
          <View style={styles.postHeader}>
            <Avatar uri={post.user?.avatar || ''} size={40} />
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{post.user?.name || 'User'}</Text>
              <Text style={styles.timeAgo}>{post.timeAgo || ''}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {post.caption ? (
            <Text style={styles.caption}>{post.caption}</Text>
          ) : null}

          {renderMedia()}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.action} onPress={handleLike}>
              <Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={24} color={post.liked ? theme.colors.accent : '#6B7280'} />
              <Text style={styles.actionText}>{post.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={() => router.push(`/comments?postId=${post.id}` as any)}>
              <Ionicons name="chatbubble-outline" size={22} color="#6B7280" />
              <Text style={styles.actionText}>{post.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={handleSave}>
              <Ionicons name={post.saved ? 'bookmark' : 'bookmark-outline'} size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[3], borderBottomWidth: 1, borderBottomColor: '#E5E7EB', backgroundColor: '#FFFFFF'
  },
  headerTitle: { fontSize: theme.typography.fontSize[18], fontWeight: theme.typography.fontWeight.bold, color: '#111827' },
  card: { backgroundColor: '#FFFFFF', margin: theme.spacing[4], borderRadius: theme.borderRadius['2xl'], overflow: 'hidden' },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3], padding: theme.spacing[3] },
  userName: { fontSize: theme.typography.fontSize[14], fontWeight: theme.typography.fontWeight.semibold, color: '#111827' },
  timeAgo: { fontSize: theme.typography.fontSize[10], color: '#6B7280' },
  caption: { fontSize: theme.typography.fontSize[14], paddingHorizontal: theme.spacing[3], paddingBottom: theme.spacing[3], color: '#111827' },
  media: { width: '100%', aspectRatio: 1 },
  mediaCarousel: { width: 360, height: 360 },
  videoContainer: { position: 'relative' },
  videoOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.05)' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[4], padding: theme.spacing[3] },
  action: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[1] },
  actionText: { fontSize: theme.typography.fontSize[12], color: '#6B7280', fontWeight: theme.typography.fontWeight.medium },
});

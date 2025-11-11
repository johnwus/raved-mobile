import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Post } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { usePostsStore } from '../../store/postsStore';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const router = useRouter();
  const { likePost, unlikePost, savePost, unsavePost } = usePostsStore();

  const handleLike = async () => {
    try {
      if (post.liked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleSave = () => {
    if (post.saved) {
      unsavePost(post.id);
    } else {
      savePost(post.id);
    }
  };

  const renderMedia = () => {
    if (post.media.type === 'image') {
      return (
        <TouchableOpacity onPress={() => router.push(`/post/${post.id}` as any)}>
          <Image 
            source={{ uri: post.media.url }} 
            style={styles.postImage}
            resizeMode="cover"
          />
          {post.forSale && (
            <View style={[styles.priceTag, { backgroundColor: theme.colors.success }]}>
              <Text style={styles.priceText}>₵{post.price}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    if (post.media.type === 'video') {
      return (
        <TouchableOpacity onPress={() => router.push(`/post/${post.id}` as any)}>
          <View style={styles.videoContainer}>
            <Image 
              source={{ uri: post.media.thumbnail }} 
              style={styles.postImage}
              resizeMode="cover"
            />
            <View style={styles.videoOverlay}>
              <Ionicons name="play-circle" size={48} color="white" />
            </View>
            <View style={styles.videoBadge}>
              <Text style={styles.videoBadgeText}>Video</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    if (post.media.type === 'carousel') {
      return (
        <View style={styles.carouselContainer}>
          <FlatList
            horizontal
            pagingEnabled
            data={post.media.items}
            renderItem={({ item }) => (
              <Image 
                source={{ uri: item }} 
                style={styles.postImage}
                resizeMode="cover"
              />
            )}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
          />
          <View style={styles.carouselBadge}>
            <Ionicons name="copy" size={12} color="white" />
            <Text style={styles.carouselBadgeText}>{post.media.items?.length}</Text>
          </View>
        </View>
      );
    }
  };

  return (
    <View style={styles.postCard}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.postUser}>
          <Avatar uri={post.user.avatar || ''} size={36} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{post.user.name}</Text>
            <View style={styles.postMeta}>
              <Badge text={post.user.faculty} variant="primary" size="small" />
              <Text style={styles.timeAgo}>• {post.timeAgo}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      {post.caption && (
        <Text style={styles.postCaption} numberOfLines={2}>
          {post.caption}
        </Text>
      )}

      {/* Media */}
      {renderMedia()}

      {/* For Sale Badge */}
      {post.forSale && (
        <View style={[styles.saleBadge, { backgroundColor: theme.colors.success }]}>
          <Ionicons name="pricetag" size={12} color="white" />
          <Text style={styles.saleBadgeText}>For Sale</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity style={styles.postAction} onPress={handleLike}>
            <Ionicons
              name={post.liked ? "heart" : "heart-outline"}
              size={24}
              color={post.liked ? theme.colors.accent : '#6B7280'}
            />
            <Text style={styles.actionCount}>{post.likes}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.postAction}
            onPress={() => router.push(`/comments?postId=${post.id}` as any)}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#6B7280" />
            <Text style={styles.actionCount}>{post.comments}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.postAction}>
            <Ionicons name="paper-plane-outline" size={22} color="#6B7280" />
            <Text style={styles.actionCount}>{post.shares}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.postActionsRight}>
          {post.forSale && (
            <TouchableOpacity style={styles.cartButton}>
              <Ionicons name="cart-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.postAction} onPress={handleSave}>
            <Ionicons
              name={post.saved ? "bookmark" : "bookmark-outline"}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.postAction}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius['2xl'],
    marginBottom: theme.spacing[4],
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing[3],
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
    marginTop: 2,
  },
  timeAgo: {
    fontSize: theme.typography.fontSize[10],
    color: '#6B7280',
  },
  postCaption: {
    fontSize: theme.typography.fontSize[14],
    paddingHorizontal: theme.spacing[3],
    paddingBottom: theme.spacing[3],
    lineHeight: 18,
    color: '#111827',
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
  },
  priceTag: {
    position: 'absolute',
    bottom: theme.spacing[3],
    left: theme.spacing[3],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1.5],
    borderRadius: theme.borderRadius.xl,
  },
  priceText: {
    color: 'white',
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  videoBadge: {
    position: 'absolute',
    top: theme.spacing[3],
    left: theme.spacing[3],
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.base,
  },
  videoBadgeText: {
    color: 'white',
    fontSize: theme.typography.fontSize[10],
    fontWeight: theme.typography.fontWeight.medium,
  },
  carouselContainer: {
    position: 'relative',
  },
  carouselBadge: {
    position: 'absolute',
    top: theme.spacing[3],
    right: theme.spacing[3],
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.base,
  },
  carouselBadgeText: {
    color: 'white',
    fontSize: theme.typography.fontSize[10],
    fontWeight: theme.typography.fontWeight.medium,
  },
  saleBadge: {
    position: 'absolute',
    top: theme.spacing[3],
    right: theme.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1.5],
    borderRadius: theme.borderRadius.xl,
  },
  saleBadgeText: {
    color: 'white',
    fontSize: theme.typography.fontSize[11],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing[3],
  },
  postActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
  },
  postActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  actionCount: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#6B7280',
  },
  cartButton: {
    padding: theme.spacing[1],
  },
});


// import React, { useState, useMemo } from 'react';
// import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, NativeScrollEvent, NativeSyntheticEvent, Dimensions, Modal } from 'react-native';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { theme } from '@/theme';
// import { Post } from '@/types';
// import { Avatar } from '@/components/ui/Avatar';
// import { Badge } from '@/components/ui/Badge';
// import { MediaContainer } from '@/components/media/MediaContainer';
// import { usePostsStore } from '@/store/postsStore';
// import { useToastStore } from '@/store/toastStore';
// import { VideoView, useVideoPlayer } from 'expo-video';

// interface PostCardProps {
//   post: Post;
// }

// export const PostCard: React.FC<PostCardProps> = ({ post }) => {
//   const router = useRouter();
//   const { likePost, unlikePost, savePost, unsavePost } = usePostsStore();
//   const [carouselIndex, setCarouselIndex] = useState(0);
//   const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

//   // Create video player only for video posts
//   const videoUrl = useMemo(() => {
//     return post.media?.type === 'video' ? (post.media.url || post.media.thumbnail || '') : '';
//   }, [post.media]);

//   const videoPlayer = useVideoPlayer(videoUrl, (player) => {
//     if (videoUrl) {
//       player.loop = false;
//       player.muted = true;
//     }
//   });

//   const handleLike = async () => {
//     try {
//       if (post.liked) {
//         await unlikePost(post.id);
//       } else {
//         await likePost(post.id);
//       }
//     } catch (error) {
//       console.error('Failed to toggle like:', error);
//     }
//   };

//   const handleSave = () => {
//     if (post.saved) {
//       unsavePost(post.id);
//     } else {
//       savePost(post.id);
//     }
//   };

//   const { showToast } = useToastStore();

//   const handleShare = async () => {
//     try {
//       const postsApi = (await import('../../services/postsApi')).default;
//       await postsApi.sharePost(post.id);
//       // Optimistically bump share count
//       usePostsStore.setState((state) => ({
//         posts: state.posts.map(p => p.id === post.id ? { ...p, shares: (p.shares || 0) + 1 } : p)
//       }));
//       showToast('Post shared', 'success');
//     } catch (error) {
//       console.error('Failed to share post:', error);
//     }
//   };

//   const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
//     const { contentOffset, layoutMeasurement } = e.nativeEvent;
//     const idx = Math.round(contentOffset.x / layoutMeasurement.width);
//     if (idx !== carouselIndex) setCarouselIndex(idx);
//   };

//   const renderMedia = () => {
//     // Safety check: ensure media exists and has required properties
//     if (!post.media?.type) {
//       return null;
//     }

//     if (post.media.type === 'image') {
//       return (
//         <TouchableOpacity onPress={() => router.push(`/post/${post.id}` as any)} activeOpacity={0.95}>
//           <MediaContainer uri={post.media.url || ''} type="image" />
//           {post.forSale && (
//             <View style={[styles.priceTag, { backgroundColor: theme.colors.success }]}>
//               <Text style={styles.priceText}>₵{post.price}</Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       );
//     }

//     if (post.media.type === 'video') {
//       return (
//         <View style={styles.mediaContainer}>
//           <TouchableOpacity onPress={() => router.push(`/post/${post.id}` as any)}>
//             <View style={styles.videoContainer}>
//               {videoPlayer && (
//                 <VideoView
//                   style={styles.postImage}
//                   player={videoPlayer}
//                   nativeControls={false}
//                 />
//               )}
//               {/* Play overlay */}
//               <View style={styles.videoOverlay}>
//                 <Ionicons name="play-circle" size={48} color="white" />
//               </View>
//               <View style={styles.videoBadge}>
//                 <Text style={styles.videoBadgeText}>Video</Text>
//               </View>
//             </View>
//           </TouchableOpacity>
//         </View>
//       );
//     }

//     if (post.media.type === 'carousel') {
//       const items = post.media.items || [];

//       // Debug logging for carousel
//       console.log('🎠 Carousel post:', post.id);
//       console.log('🎠 Carousel items:', items);
//       console.log('🎠 Carousel items length:', items.length);

//       // If no items, show the main URL as fallback
//       if (items.length === 0 && post.media.url) {
//         return (
//           <TouchableOpacity onPress={() => router.push(`/post/${post.id}` as any)}>
//             <MediaContainer uri={post.media.url} type="image" />
//             {post.forSale && (
//               <View style={[styles.priceTag, { backgroundColor: theme.colors.success }]}>
//                 <Text style={styles.priceText}>₵{post.price}</Text>
//               </View>
//             )}
//           </TouchableOpacity>
//         );
//       }

//       return (
//         <View style={styles.carouselContainer}>
//           <FlatList
//             horizontal
//             pagingEnabled
//             data={items}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 onPress={() => setFullScreenImage(item)}
//                 activeOpacity={0.9}
//                 style={{ width: Dimensions.get('window').width - 8 }}
//               >
//                 <MediaContainer uri={item} type="carousel" />
//               </TouchableOpacity>
//             )}
//             onScroll={onCarouselScroll}
//             scrollEventThrottle={16}
//             showsHorizontalScrollIndicator={false}
//             keyExtractor={(item, index) => `${item}-${index}`}
//             contentContainerStyle={styles.carouselList}
//             scrollEnabled={items.length > 1}
//           />
//           <View style={styles.carouselBadge}>
//             <Ionicons name="copy" size={12} color="white" />
//             <Text style={styles.carouselBadgeText}>{items.length}</Text>
//           </View>
//           {items.length > 1 && (
//             <View style={styles.carouselDots}>
//               {items.map((_item, idx) => (
//                 <View 
//                   key={`dot-${idx}`} 
//                   style={[
//                     styles.carouselDot, 
//                     idx === carouselIndex ? styles.carouselDotActive : undefined
//                   ]} 
//                 />
//               ))}
//             </View>
//           )}
//           {post.forSale && (
//             <View style={[styles.priceTag, { backgroundColor: theme.colors.success }]}>
//               <Text style={styles.priceText}>₵{post.price}</Text>
//             </View>
//           )}
//         </View>
//       );
//     }

//     // For text posts or unknown types, return null
//     return null;
//   };

//   return (
//     <>
//       <View style={styles.postCard}>
//         {/* Post Header */}
//         <View style={styles.postHeader}>
//           <View style={styles.postUser}>
//             <Avatar uri={post.user?.avatar || ''} size={36} />
//             <View style={styles.userInfo}>
//               <Text style={styles.userName} numberOfLines={1}>{post.user?.name || 'Unknown User'}</Text>
//               <View style={styles.postMeta}>
//                 <Badge text={post.user?.faculty || 'Unknown'} variant="primary" size="small" />
//                 <Text style={styles.timeAgo}>• {post.timeAgo}</Text>
//               </View>
//             </View>
//           </View>
//           <View style={styles.headerRight}>
//             <TouchableOpacity style={styles.moreButton}>
//               <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Media */}
//         {renderMedia()}

//         {/* For Sale Badge */}
//         {post.forSale && post.media?.type !== 'carousel' && (
//           <View style={[styles.saleBadge, { backgroundColor: theme.colors.success }]}>
//             <Ionicons name="pricetag" size={12} color="white" />
//             <Text style={styles.saleBadgeText}>For Sale</Text>
//           </View>
//         )}

//         {/* Caption */}
//         {!!post.caption && (
//           <Text style={styles.postCaption} numberOfLines={2}>
//             {post.caption}
//           </Text>
//         )}

//         {/* Tags */}
//         {!!post.tags?.length && (
//           <View style={styles.tagsRow}>
//             {post.tags.slice(0, 4).map((t: string, idx: number) => (
//               <TouchableOpacity key={t ?? `tag-${idx}`}>
//                 <Text style={styles.tagText}>#{t}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}

//         {/* Actions */}
//         <View style={styles.postActions}>
//           <View style={styles.postActionsLeft}>
//             <TouchableOpacity style={styles.postAction} onPress={handleLike}>
//               <Ionicons
//                 name={post.liked ? "heart" : "heart-outline"}
//                 size={24}
//                 color={post.liked ? theme.colors.accent : '#6B7280'}
//               />
//               <Text style={styles.actionCount}>{post.likes}</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.postAction}
//               onPress={() => {
//                 console.log('💬 Comment button pressed for post:', post.id);
//                 router.push(`/comments?postId=${post.id}` as any);
//               }}
//             >
//               <Ionicons name="chatbubble-outline" size={22} color="#6B7280" />
//               <Text style={styles.actionCount}>{post.comments}</Text>
//             </TouchableOpacity>

//             <TouchableOpacity style={styles.postAction} onPress={handleShare}>
//               <Ionicons name="paper-plane-outline" size={22} color="#6B7280" />
//               <Text style={styles.actionCount}>{post.shares}</Text>
//             </TouchableOpacity>
//           </View>

//           <View style={styles.postActionsRight}>
//             {post.forSale && (
//               <TouchableOpacity style={styles.cartButton} onPress={async () => {
//                 try {
//                   const directId = (post as any).saleDetails?.storeItemId;
//                   if (directId) {
//                     router.push(`/product/${directId}` as any);
//                     return;
//                   }
//                   useToastStore.getState().showToast('Product not available', 'error');
//                 } catch (e) {
//                   console.error('Open store item failed', e);
//                   useToastStore.getState().showToast('Could not open product', 'error');
//                 }
//               }}>
//                 <Ionicons name="cart-outline" size={20} color={theme.colors.primary} />
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity style={styles.postAction} onPress={handleSave}>
//               <Ionicons
//                 name={post.saved ? "bookmark" : "bookmark-outline"}
//                 size={20}
//                 color={post.saved ? '#F59E0B' : '#6B7280'}
//               />
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.postAction} onPress={() => {
//               // TODO: Implement more menu with options like report, hide, etc.
//               console.log('More menu pressed');
//             }}>
//               <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>

//       {/* Full Screen Image Modal - Recommendation #4 */}
//       <Modal
//         visible={!!fullScreenImage}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setFullScreenImage(null)}
//       >
//         <View style={styles.fullScreenContainer}>
//           <TouchableOpacity 
//             style={styles.closeButton}
//             onPress={() => setFullScreenImage(null)}
//           >
//             <Ionicons name="close" size={28} color="white" />
//           </TouchableOpacity>
//           {fullScreenImage && (
//             <Image
//               source={{ uri: fullScreenImage }}
//               style={styles.fullScreenImage}
//               resizeMode="contain"
//             />
//           )}
//         </View>
//       </Modal>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   postCard: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: theme.borderRadius['2xl'],
//     marginHorizontal: theme.spacing[1],
//     marginVertical: theme.spacing[2],
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   postHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: theme.spacing[3],
//     paddingVertical: theme.spacing[3],
//     gap: theme.spacing[3],
//   },
//   postUser: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: theme.spacing[3],
//     flex: 1,
//   },
//   userInfo: {
//     justifyContent: 'center',
//     flex: 1,
//   },
//   userName: {
//     fontSize: theme.typography.fontSize[14],
//     fontWeight: theme.typography.fontWeight.semibold,
//     color: '#111827',
//   },
//   postMeta: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: theme.spacing[2],
//     marginTop: 2,
//   },
//   timeAgo: {
//     fontSize: theme.typography.fontSize[11],
//     color: '#6B7280',
//   },
//   postCaption: {
//     fontSize: theme.typography.fontSize[14],
//     paddingHorizontal: theme.spacing[3],
//     paddingTop: theme.spacing[2],
//     paddingBottom: theme.spacing[1],
//     lineHeight: 18,
//     color: '#111827',
//   },
//   postImage: {
//     width: '100%',
//     aspectRatio: 1.1,
//     backgroundColor: '#f3f4f6',
//   },
//   priceTag: {
//     position: 'absolute',
//     bottom: theme.spacing[3],
//     left: theme.spacing[3],
//     paddingHorizontal: theme.spacing[3],
//     paddingVertical: theme.spacing[1.5],
//     borderRadius: theme.borderRadius.xl,
//   },
//   priceText: {
//     color: 'white',
//     fontSize: theme.typography.fontSize[12],
//     fontWeight: theme.typography.fontWeight.semibold,
//   },
//   videoContainer: {
//     position: 'relative',
//   },
//   videoOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.3)',
//   },
//   videoBadge: {
//     position: 'absolute',
//     top: theme.spacing[3],
//     left: theme.spacing[3],
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     paddingHorizontal: theme.spacing[2],
//     paddingVertical: theme.spacing[1],
//     borderRadius: theme.borderRadius.base,
//   },
//   videoBadgeText: {
//     color: 'white',
//     fontSize: theme.typography.fontSize[10],
//     fontWeight: theme.typography.fontWeight.medium,
//   },
//   carouselContainer: {
//     position: 'relative',
//     marginHorizontal: 0,
//     marginVertical: 0,
//     borderRadius: 0,
//     overflow: 'hidden',
//   },
//   carouselItemContainer: {
//     marginHorizontal: 0,
//     borderRadius: 0,
//     overflow: 'hidden',
//   },
//   carouselList: {
//     paddingHorizontal: 0,
//   },
//   carouselBadge: {
//     position: 'absolute',
//     top: theme.spacing[3],
//     right: theme.spacing[3],
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: theme.spacing[1],
//     paddingHorizontal: theme.spacing[2],
//     paddingVertical: theme.spacing[1],
//     borderRadius: theme.borderRadius.base,
//   },
//   carouselDots: {
//     position: 'absolute',
//     bottom: theme.spacing[3],
//     alignSelf: 'center',
//     flexDirection: 'row',
//     gap: theme.spacing[1],
//   },
//   carouselDot: {
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: 'rgba(255,255,255,0.5)',
//   },
//   carouselDotActive: {
//     backgroundColor: '#FFFFFF',
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//   },
//   carouselBadgeText: {
//     color: 'white',
//     fontSize: theme.typography.fontSize[10],
//     fontWeight: theme.typography.fontWeight.medium,
//   },
//   saleBadge: {
//     position: 'absolute',
//     top: theme.spacing[3],
//     right: theme.spacing[3],
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: theme.spacing[1],
//     paddingHorizontal: theme.spacing[3],
//     paddingVertical: theme.spacing[1.5],
//     borderRadius: theme.borderRadius.xl,
//   },
//   saleBadgeText: {
//     color: 'white',
//     fontSize: theme.typography.fontSize[11],
//     fontWeight: theme.typography.fontWeight.semibold,
//   },
//   tagsRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: theme.spacing[1.5],
//     paddingHorizontal: theme.spacing[3],
//     paddingVertical: theme.spacing[1],
//   },
//   tagText: {
//     fontSize: theme.typography.fontSize[12],
//     color: '#6B7280',
//   },
//   postActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: theme.spacing[3],
//     paddingVertical: theme.spacing[3],
//   },
//   postActionsLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: theme.spacing[4],
//   },
//   postActionsRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: theme.spacing[3],
//   },
//   postAction: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: theme.spacing[1],
//   },
//   actionCount: {
//     fontSize: theme.typography.fontSize[12],
//     fontWeight: theme.typography.fontWeight.medium,
//     color: '#6B7280',
//   },
//   cartButton: {
//     padding: theme.spacing[1],
//   },
//   headerRight: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: theme.spacing[1],
//     flexShrink: 0,
//   },
//   moreButton: {
//     padding: theme.spacing[1],
//   },
//   mediaContainer: {
//     marginHorizontal: 0,
//     marginVertical: 0,
//     borderRadius: 0,
//     overflow: 'hidden',
//   },
//   // Full screen modal styles - Recommendation #4
//   fullScreenContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   fullScreenImage: {
//     width: '100%',
//     height: '100%',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: theme.spacing[4],
//     right: theme.spacing[4],
//     zIndex: 10,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     padding: theme.spacing[2],
//     borderRadius: theme.borderRadius.full,
//   },
// });




import React, { useState, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, FlatList, NativeScrollEvent, NativeSyntheticEvent, Dimensions, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/theme';
import { Post } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { MediaContainer } from '@/components/media/MediaContainer';
import { usePostsStore } from '@/store/postsStore';
import { useToastStore } from '@/store/toastStore';
import { VideoView, useVideoPlayer } from 'expo-video';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const router = useRouter();
  const { likePost, unlikePost, savePost, unsavePost } = usePostsStore();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const videoUrl = useMemo(() => {
    return post.media?.type === 'video' ? (post.media.url || post.media.thumbnail || '') : '';
  }, [post.media]);

  const videoPlayer = useVideoPlayer(videoUrl, (player) => {
    if (videoUrl) {
      player.loop = false;
      player.muted = true;
    }
  });

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

  const { showToast } = useToastStore();

  const handleShare = async () => {
    try {
      const postsApi = (await import('../../services/postsApi')).default;
      await postsApi.sharePost(post.id);
      usePostsStore.setState((state) => ({
        posts: state.posts.map(p => p.id === post.id ? { ...p, shares: (p.shares || 0) + 1 } : p)
      }));
      showToast('Post shared', 'success');
    } catch (error) {
      console.error('Failed to share post:', error);
    }
  };

  const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = e.nativeEvent;
    const idx = Math.round(contentOffset.x / layoutMeasurement.width);
    if (idx !== carouselIndex) setCarouselIndex(idx);
  };

  const renderMedia = () => {
    if (!post.media?.type) {
      return null;
    }

    if (post.media.type === 'image') {
      return (
        <TouchableOpacity onPress={() => router.push(`/post/${post.id}` as any)} activeOpacity={0.95}>
          <MediaContainer uri={post.media.url || ''} type="image" />
          {post.forSale && (
            <View style={styles.priceTag}>
              <Ionicons name="pricetag" size={14} color="white" />
              <Text style={styles.priceText}>₵{post.price}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    if (post.media.type === 'video') {
      return (
        <View style={styles.mediaContainer}>
          <TouchableOpacity onPress={() => router.push(`/post/${post.id}` as any)}>
            <View style={styles.videoContainer}>
              {videoPlayer && (
                <VideoView
                  style={styles.postImage}
                  player={videoPlayer}
                  nativeControls={false}
                />
              )}
              <View style={styles.videoOverlay}>
                <View style={styles.playButton}>
                  <Ionicons name="play" size={28} color="white" />
                </View>
              </View>
              <View style={styles.videoBadge}>
                <Ionicons name="videocam" size={12} color="white" />
                <Text style={styles.videoBadgeText}>Video</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    }

    if (post.media.type === 'carousel') {
      const items = post.media.items || [];

      if (items.length === 0 && post.media.url) {
        return (
          <TouchableOpacity onPress={() => router.push(`/post/${post.id}` as any)}>
            <MediaContainer uri={post.media.url} type="image" />
            {post.forSale && (
              <View style={styles.priceTag}>
                <Ionicons name="pricetag" size={14} color="white" />
                <Text style={styles.priceText}>₵{post.price}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      }

      return (
        <View style={styles.carouselContainer}>
          <FlatList
            horizontal
            pagingEnabled
            data={items}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setFullScreenImage(item)}
                activeOpacity={0.9}
                style={{ width: Dimensions.get('window').width }}
              >
                <MediaContainer uri={item} type="carousel" />
              </TouchableOpacity>
            )}
            onScroll={onCarouselScroll}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `${item}-${index}`}
            scrollEnabled={items.length > 1}
          />
          <View style={styles.carouselBadge}>
            <Ionicons name="images" size={12} color="white" />
            <Text style={styles.carouselBadgeText}>{items.length}</Text>
          </View>
          {items.length > 1 && (
            <View style={styles.carouselDots}>
              {items.map((_item, idx) => (
                <View 
                  key={`dot-${idx}`} 
                  style={[
                    styles.carouselDot, 
                    idx === carouselIndex && styles.carouselDotActive
                  ]} 
                />
              ))}
            </View>
          )}
          {post.forSale && (
            <View style={styles.priceTag}>
              <Ionicons name="pricetag" size={14} color="white" />
              <Text style={styles.priceText}>₵{post.price}</Text>
            </View>
          )}
        </View>
      );
    }

    return null;
  };

  return (
    <>
      <View style={styles.postCard}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity 
            style={styles.postUser}
            onPress={() => router.push(`/profile/${post.user?.id}` as any)}
          >
            <Avatar uri={post.user?.avatar || ''} size={40} />
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>{post.user?.name || 'Unknown User'}</Text>
              <View style={styles.postMeta}>
                <Badge text={post.user?.faculty || 'Unknown'} variant="primary" size="small" />
                <Text style={styles.timeAgo}>• {post.timeAgo}</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Caption - Before Media */}
        {!!post.caption && (
          <TouchableOpacity 
            style={styles.captionContainer}
            onPress={() => router.push(`/post/${post.id}` as any)}
            activeOpacity={0.9}
          >
            <Text style={styles.postCaption} numberOfLines={3}>
              {post.caption}
            </Text>
          </TouchableOpacity>
        )}

        {/* Media */}
        {renderMedia()}

        {/* For Sale Badge */}
        {post.forSale && (
          <View style={styles.saleInfoBar}>
            <View style={styles.saleInfo}>
              <Ionicons name="pricetag" size={14} color={theme.colors.success} />
              <Text style={styles.saleText}>Available for purchase</Text>
            </View>
            <TouchableOpacity 
              style={styles.buyNowButton}
              onPress={async () => {
                try {
                  const directId = (post as any).saleDetails?.storeItemId;
                  if (directId) {
                    router.push(`/product/${directId}` as any);
                    return;
                  }
                  useToastStore.getState().showToast('Product not available', 'error');
                } catch (e) {
                  console.error('Open store item failed', e);
                  useToastStore.getState().showToast('Could not open product', 'error');
                }
              }}
            >
              <Text style={styles.buyNowText}>Buy Now</Text>
              <Ionicons name="arrow-forward" size={14} color={theme.colors.success} />
            </TouchableOpacity>
          </View>
        )}

        {/* Tags */}
        {!!post.tags?.length && (
          <View style={styles.tagsRow}>
            {post.tags.slice(0, 5).map((t: string, idx: number) => (
              <TouchableOpacity key={t ?? `tag-${idx}`} style={styles.tag}>
                <Text style={styles.tagText}>#{t}</Text>
              </TouchableOpacity>
            ))}
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
              <Text style={[styles.actionCount, post.liked && styles.actionCountActive]}>
                {post.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.postAction}
              onPress={() => {
                console.log('💬 Comment button pressed for post:', post.id);
                router.push(`/comments?postId=${post.id}` as any);
              }}
            >
              <Ionicons name="chatbubble-outline" size={22} color="#6B7280" />
              <Text style={styles.actionCount}>{post.comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.postAction} onPress={handleShare}>
              <Ionicons name="paper-plane-outline" size={22} color="#6B7280" />
              <Text style={styles.actionCount}>{post.shares}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.postActionsRight}>
            <TouchableOpacity style={styles.postAction} onPress={handleSave}>
              <Ionicons
                name={post.saved ? "bookmark" : "bookmark-outline"}
                size={22}
                color={post.saved ? '#F59E0B' : '#6B7280'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Full Screen Image Modal */}
      <Modal
        visible={!!fullScreenImage}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenImage(null)}
      >
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setFullScreenImage(null)}
          >
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          {fullScreenImage && (
            <Image
              source={{ uri: fullScreenImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 8,
    borderBottomColor: '#F3F4F6',
    marginHorizontal: 0,
    width: '100%',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  userInfo: {
    justifyContent: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeAgo: {
    fontSize: 12,
    color: '#6B7280',
  },
  captionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  postCaption: {
    fontSize: 15,
    lineHeight: 22,
    color: '#111827',
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f3f4f6',
  },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  videoBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  carouselContainer: {
    position: 'relative',
  },
  carouselBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  carouselDots: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  carouselDotActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
  carouselBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  saleInfoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F0FDF4',
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
  },
  saleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#15803D',
  },
  buyNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  buyNowText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.success,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  postActionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  postActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  actionCountActive: {
    color: theme.colors.accent,
  },
  moreButton: {
    padding: 4,
  },
  mediaContainer: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    borderRadius: 24,
  },
});
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//     View,
//     Text,
//     ScrollView,
//     TouchableOpacity,
//     StyleSheet,
//     TextInput,
//     KeyboardAvoidingView,
//     Platform,
//     Image,
//     Animated,
//     LayoutAnimation,
//     UIManager,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
// import type { PanGestureHandlerGestureEvent, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
// import { theme } from '../theme';
// import { Avatar } from '../components/ui/Avatar';
// import { useAuth } from '../hooks/useAuth';
// import { postsApi } from '../services/postsApi';
// import { SkeletonLoader } from '../components/ui/SkeletonLoader';
//
// // Enable LayoutAnimation on Android
// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//     UIManager.setLayoutAnimationEnabledExperimental(true);
// }
//
// interface LocalComment {
//     id: string;
//     user: {
//         id: string;
//         name: string;
//         avatar: string;
//     };
//     text: string;
//     timeAgo: string;
//     likes: number;
//     liked: boolean;
//     replies?: LocalComment[];
// }
//
// interface PostPreview {
//     id: string;
//     caption: string;
//     media: {
//         url: string;
//         type: string;
//     };
//     user: {
//         name: string;
//     };
// }
//
// export default function CommentsScreen() {
//     const router = useRouter();
//     const searchParams = useLocalSearchParams<{ postId?: string }>();
//     const postId = Array.isArray(searchParams.postId) ? searchParams.postId[0] : searchParams.postId;
//     const { user } = useAuth();
//     const [comments, setComments] = useState<LocalComment[]>([]);
//     const [commentText, setCommentText] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [postPreview, setPostPreview] = useState<PostPreview | null>(null);
//     const [error, setError] = useState<string | null>(null);
//     const scrollViewRef = useRef<ScrollView>(null);
//     const [replyingTo, setReplyingTo] = useState<string | null>(null);
//     const [replyText, setReplyText] = useState('');
//     const inputRef = useRef<TextInput>(null);
//
//     const loadComments = useCallback(async () => {
//         if (!postId || !user) {
//             setError('Invalid request');
//             return;
//         }
//
//         try {
//             setLoading(true);
//             setError(null);
//
//             const [commentsResponse, postResponse] = await Promise.all([
//                 postsApi.getPostComments(postId),
//                 postsApi.getPost(postId),
//             ]);
//
//             const formattedComments = commentsResponse.comments.map((comment: any) => ({
//                 id: comment.id,
//                 user: {
//                     id: comment.user.id,
//                     name: comment.user.name,
//                     avatar: comment.user.avatarUrl || comment.user.avatar,
//                 },
//                 text: comment.text,
//                 timeAgo: comment.timeAgo,
//                 likes: comment.likes || 0,
//                 liked: comment.liked || false,
//                 replies: comment.replies?.map((reply: any) => ({
//                     id: reply.id,
//                     user: {
//                         id: reply.user.id,
//                         name: reply.user.name,
//                         avatar: reply.user.avatarUrl || reply.user.avatar,
//                     },
//                     text: reply.text,
//                     timeAgo: reply.timeAgo,
//                     likes: reply.likes || 0,
//                     liked: reply.liked || false,
//                 })) || [],
//             }));
//
//             setComments(formattedComments);
//
//             if (postResponse.post) {
//                 setPostPreview({
//                     id: postResponse.post.id,
//                     caption: postResponse.post.caption || '',
//                     media: {
//                         url: postResponse.post.media?.url || '',
//                         type: postResponse.post.media?.type || 'image'
//                     },
//                     user: {
//                         name: postResponse.post.user?.name || 'User'
//                     }
//                 });
//             }
//         } catch (error: any) {
//             console.error('Failed to load comments:', error);
//             setError(error?.response?.data?.error || 'Failed to load comments');
//         } finally {
//             setLoading(false);
//         }
//     }, [postId, user]);
//
//     useEffect(() => {
//         if (postId) {
//             loadComments();
//         }
//     }, [postId, loadComments]);
//
//     const handleSend = async () => {
//         if (!commentText.trim() || !user || !postId) return;
//
//         try {
//             const response = await postsApi.commentOnPost(postId, {
//                 text: commentText.trim(),
//             });
//
//             const newComment: LocalComment = {
//                 id: response.comment.id,
//                 user: {
//                     id: user.id,
//                     name: user.name,
//                     avatar: user.avatar || '',
//                 },
//                 text: commentText.trim(),
//                 timeAgo: 'now',
//                 likes: 0,
//                 liked: false,
//                 replies: [],
//             };
//
//             LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//             setComments(prev => [newComment, ...prev]); // Add to top
//             setCommentText('');
//
//             setTimeout(() => {
//                 scrollViewRef.current?.scrollTo({ y: 0, animated: true });
//             }, 100);
//         } catch (error) {
//             console.error('Failed to post comment:', error);
//         }
//     };
//
//     const handleSendReply = async () => {
//         if (!replyText.trim() || !user || !postId || !replyingTo) return;
//
//         try {
//             const response = await postsApi.commentOnPost(postId, {
//                 text: replyText.trim(),
//                 parentCommentId: replyingTo,
//             });
//
//             const newReply: LocalComment = {
//                 id: response.comment.id,
//                 user: {
//                     id: user.id,
//                     name: user.name,
//                     avatar: user.avatar || '',
//                 },
//                 text: replyText.trim(),
//                 timeAgo: 'now',
//                 likes: 0,
//                 liked: false,
//             };
//
//             const updateReplies = (items: LocalComment[]): LocalComment[] => {
//                 return items.map(item => {
//                     if (item.id === replyingTo) {
//                         return {
//                             ...item,
//                             replies: [newReply, ...(item.replies || [])], // Add to top of replies
//                         };
//                     }
//                     if (item.replies && item.replies.length > 0) {
//                         return {
//                             ...item,
//                             replies: updateReplies(item.replies),
//                         };
//                     }
//                     return item;
//                 });
//             };
//
//             LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//             setComments(prev => updateReplies(prev));
//             setReplyingTo(null);
//             setReplyText('');
//         } catch (error) {
//             console.error('Failed to post reply:', error);
//         }
//     };
//
//     const handleLike = async (commentId: string) => {
//         if (!postId) return;
//
//         const toggleLike = (items: LocalComment[]): LocalComment[] => {
//             return items.map(item => {
//                 if (item.id === commentId) {
//                     return {
//                         ...item,
//                         liked: !item.liked,
//                         likes: item.liked ? item.likes - 1 : item.likes + 1,
//                     };
//                 }
//                 if (item.replies && item.replies.length > 0) {
//                     return {
//                         ...item,
//                         replies: toggleLike(item.replies),
//                     };
//                 }
//                 return item;
//             });
//         };
//
//         try {
//             setComments(prev => toggleLike(prev));
//             await postsApi.likeComment(postId, commentId);
//         } catch (error) {
//             console.error('Failed to like comment:', error);
//             setComments(prev => toggleLike(prev));
//         }
//     };
//
//     const findCommentById = (commentId: string): LocalComment | undefined => {
//         const search = (items: LocalComment[]): LocalComment | undefined => {
//             for (const item of items) {
//                 if (item.id === commentId) return item;
//                 if (item.replies) {
//                     const found = search(item.replies);
//                     if (found) return found;
//                 }
//             }
//             return undefined;
//         };
//         return search(comments);
//     };
//
//     const handleReply = (commentId: string) => {
//         LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//         setReplyingTo(commentId);
//         setReplyText('');
//         setTimeout(() => inputRef.current?.focus(), 100);
//     };
//
//     return (
//         <GestureHandlerRootView style={{ flex: 1 }}>
//             <KeyboardAvoidingView
//                 style={styles.container}
//                 behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//                 keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
//             >
//                 <SafeAreaView style={styles.container} edges={['top']}>
//                     {/* Header */}
//                     <View style={styles.header}>
//                         <View style={styles.handle} />
//                         <View style={styles.headerContent}>
//                             <Text style={styles.headerTitle}>Comments</Text>
//                             <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
//                                 <Ionicons name="close" size={28} color="#374151" />
//                             </TouchableOpacity>
//                         </View>
//
//                         {/* Post Preview */}
//                         {postPreview && (
//                             <TouchableOpacity
//                                 style={styles.postPreview}
//                                 onPress={() => router.push(`/post/${postPreview.id}` as any)}
//                                 activeOpacity={0.7}
//                             >
//                                 <View style={styles.postPreviewMedia}>
//                                     {postPreview.media.type === 'video' ? (
//                                         <View style={styles.postPreviewVideo}>
//                                             <Ionicons name="play-circle" size={24} color="white" />
//                                         </View>
//                                     ) : (
//                                         <Image source={{ uri: postPreview.media.url }} style={styles.postPreviewImage} />
//                                     )}
//                                 </View>
//                                 <View style={styles.postPreviewText}>
//                                     <Text style={styles.postPreviewUser}>{postPreview.user.name}</Text>
//                                     <Text style={styles.postPreviewCaption} numberOfLines={2}>
//                                         {postPreview.caption || 'View post'}
//                                     </Text>
//                                 </View>
//                                 <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
//                             </TouchableOpacity>
//                         )}
//                     </View>
//
//                     {/* Comments List */}
//                     <ScrollView
//                         ref={scrollViewRef}
//                         style={styles.commentsContainer}
//                         contentContainerStyle={styles.commentsContent}
//                         showsVerticalScrollIndicator={false}
//                         keyboardShouldPersistTaps="handled"
//                     >
//                         {error ? (
//                             <View style={styles.errorState}>
//                                 <Ionicons name="alert-circle" size={56} color="#DC2626" />
//                                 <Text style={styles.errorText}>Oops!</Text>
//                                 <Text style={styles.errorSubtext}>{error}</Text>
//                             </View>
//                         ) : loading ? (
//                             <View style={{ gap: 12 }}>
//                                 {[0, 1, 2, 3, 4].map(i => (
//                                     <View key={i} style={styles.skeletonComment}>
//                                         <SkeletonLoader height={40} width={40} borderRadius={20} />
//                                         <View style={{ flex: 1, gap: 8 }}>
//                                             <SkeletonLoader height={14} style={{ width: '30%' }} />
//                                             <SkeletonLoader height={12} style={{ width: '90%' }} />
//                                             <SkeletonLoader height={12} style={{ width: '70%' }} />
//                                         </View>
//                                     </View>
//                                 ))}
//                             </View>
//                         ) : comments.length === 0 ? (
//                             <View style={styles.emptyState}>
//                                 <View style={styles.emptyIconContainer}>
//                                     <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
//                                 </View>
//                                 <Text style={styles.emptyText}>No comments yet</Text>
//                                 <Text style={styles.emptySubtext}>Be the first to share your thoughts!</Text>
//                             </View>
//                         ) : (
//                             <View style={styles.commentsList}>
//                                 {comments.map(comment => (
//                                     <CommentCard
//                                         key={comment.id}
//                                         comment={comment}
//                                         onLike={handleLike}
//                                         onReply={handleReply}
//                                         depth={0}
//                                     />
//                                 ))}
//                             </View>
//                         )}
//                     </ScrollView>
//
//                     {/* Reply Bar */}
//                     {replyingTo && (
//                         <View style={styles.replyBar}>
//                             <View style={styles.replyHeader}>
//                                 <View style={styles.replyIndicator}>
//                                     <Ionicons name="return-down-forward" size={16} color={theme.colors.primary} />
//                                     <Text style={styles.replyingToText}>
//                                         Replying to <Text style={styles.replyingToName}>{findCommentById(replyingTo)?.user.name}</Text>
//                                     </Text>
//                                 </View>
//                                 <TouchableOpacity onPress={() => setReplyingTo(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
//                                     <Ionicons name="close" size={22} color="#6B7280" />
//                                 </TouchableOpacity>
//                             </View>
//                         </View>
//                     )}
//
//                     {/* Input Bar */}
//                     <View style={styles.inputBar}>
//                         {user && <Avatar uri={user.avatar} size={36} />}
//                         <TextInput
//                             ref={inputRef}
//                             style={styles.input}
//                             value={replyingTo ? replyText : commentText}
//                             onChangeText={replyingTo ? setReplyText : setCommentText}
//                             placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
//                             placeholderTextColor="#9CA3AF"
//                             multiline
//                             maxLength={500}
//                         />
//                         <TouchableOpacity
//                             style={[
//                                 styles.sendButton,
//                                 (replyingTo ? !replyText.trim() : !commentText.trim()) && styles.sendButtonDisabled
//                             ]}
//                             onPress={replyingTo ? handleSendReply : handleSend}
//                             disabled={replyingTo ? !replyText.trim() : !commentText.trim()}
//                         >
//                             <Ionicons
//                                 name="send"
//                                 size={20}
//                                 color={(replyingTo ? !replyText.trim() : !commentText.trim()) ? '#9CA3AF' : 'white'}
//                             />
//                         </TouchableOpacity>
//                     </View>
//                 </SafeAreaView>
//             </KeyboardAvoidingView>
//         </GestureHandlerRootView>
//     );
// }
//
// // Separate CommentCard component with gestures
// interface CommentCardProps {
//     comment: LocalComment;
//     onLike: (id: string) => void;
//     onReply: (id: string) => void;
//     depth: number;
// }
//
// const CommentCard: React.FC<CommentCardProps> = ({ comment, onLike, onReply, depth }) => {
//     const translateX = useRef(new Animated.Value(0)).current;
//     const scaleAnim = useRef(new Animated.Value(1)).current;
//     const [lastTap, setLastTap] = useState<number>(0);
//
//     const handleDoubleTap = () => {
//         const now = Date.now();
//         if (now - lastTap < 300) {
//             // Double tap detected - animate and like
//             Animated.sequence([
//                 Animated.timing(scaleAnim, {
//                     toValue: 0.95,
//                     duration: 100,
//                     useNativeDriver: true,
//                 }),
//                 Animated.spring(scaleAnim, {
//                     toValue: 1,
//                     friction: 3,
//                     useNativeDriver: true,
//                 }),
//             ]).start();
//             onLike(comment.id);
//             setLastTap(0);
//         } else {
//             setLastTap(now);
//         }
//     };
//
//     const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
//         const { translationX } = event.nativeEvent;
//         const clampedValue = Math.max(0, Math.min(translationX, 100));
//         translateX.setValue(clampedValue);
//     };
//
//     const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
//         const { state, translationX } = event.nativeEvent;
//
//         if (state === State.END) {
//             if (translationX > 50) {
//                 // Trigger reply
//                 Animated.spring(translateX, {
//                     toValue: 100,
//                     useNativeDriver: true,
//                     speed: 20,
//                 }).start(() => {
//                     onReply(comment.id);
//                     Animated.spring(translateX, {
//                         toValue: 0,
//                         useNativeDriver: true,
//                     }).start();
//                 });
//             } else {
//                 // Snap back
//                 Animated.spring(translateX, {
//                     toValue: 0,
//                     useNativeDriver: true,
//                     friction: 8,
//                 }).start();
//             }
//         }
//     };
//
//     const replyIconOpacity = translateX.interpolate({
//         inputRange: [0, 100],
//         outputRange: [0, 1],
//     });
//
//     const isNested = depth > 0;
//
//     return (
//         <View style={[styles.commentWrapper, isNested && styles.nestedComment]}>
//             <PanGestureHandler
//                 onGestureEvent={onGestureEvent}
//                 onHandlerStateChange={onHandlerStateChange}
//                 activeOffsetX={[-1000, 10]}
//             >
//                 <Animated.View style={{ transform: [{ translateX }] }}>
//                     <TouchableOpacity
//                         activeOpacity={0.9}
//                         onPress={handleDoubleTap}
//                         style={styles.commentCard}
//                     >
//                         {/* Reply indicator (shown when swiping) */}
//                         <Animated.View style={[styles.swipeReplyIndicator, { opacity: replyIconOpacity }]}>
//                             <Ionicons name="arrow-undo" size={20} color={theme.colors.primary} />
//                         </Animated.View>
//
//                         <Animated.View style={[styles.commentInner, { transform: [{ scale: scaleAnim }] }]}>
//                             <Avatar uri={comment.user.avatar} size={isNested ? 32 : 40} />
//
//                             <View style={styles.commentBody}>
//                                 <View style={styles.commentHeader}>
//                                     <Text style={[styles.userName, isNested && styles.userNameNested]}>
//                                         {comment.user.name}
//                                     </Text>
//                                     <Text style={styles.timeAgo}>{comment.timeAgo}</Text>
//                                 </View>
//
//                                 <Text style={[styles.commentText, isNested && styles.commentTextNested]}>
//                                     {comment.text}
//                                 </Text>
//
//                                 <View style={styles.commentActions}>
//                                     <TouchableOpacity
//                                         style={styles.actionButton}
//                                         onPress={() => onReply(comment.id)}
//                                         hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//                                     >
//                                         <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
//                                         <Text style={styles.actionText}>Reply</Text>
//                                     </TouchableOpacity>
//
//                                     <TouchableOpacity
//                                         style={styles.actionButton}
//                                         onPress={() => onLike(comment.id)}
//                                         hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//                                     >
//                                         <Ionicons
//                                             name={comment.liked ? 'heart' : 'heart-outline'}
//                                             size={16}
//                                             color={comment.liked ? '#EF4444' : '#6B7280'}
//                                         />
//                                         {comment.likes > 0 && (
//                                             <Text style={[styles.actionText, comment.liked && styles.likedText]}>
//                                                 {comment.likes}
//                                             </Text>
//                                         )}
//                                     </TouchableOpacity>
//                                 </View>
//                             </View>
//                         </Animated.View>
//                     </TouchableOpacity>
//                 </Animated.View>
//             </PanGestureHandler>
//
//             {/* Nested Replies */}
//             {comment.replies && comment.replies.length > 0 && (
//                 <View style={styles.repliesContainer}>
//                     {comment.replies.map(reply => (
//                         <CommentCard
//                             key={reply.id}
//                             comment={reply}
//                             onLike={onLike}
//                             onReply={onReply}
//                             depth={depth + 1}
//                         />
//                     ))}
//                 </View>
//             )}
//         </View>
//     );
// };
//
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#FFFFFF',
//     },
//     header: {
//         backgroundColor: '#FFFFFF',
//         borderBottomWidth: 1,
//         borderBottomColor: '#F3F4F6',
//         paddingBottom: 12,
//     },
//     handle: {
//         width: 36,
//         height: 4,
//         borderRadius: 2,
//         backgroundColor: '#D1D5DB',
//         alignSelf: 'center',
//         marginTop: 8,
//         marginBottom: 12,
//     },
//     headerContent: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 16,
//         marginBottom: 12,
//     },
//     headerTitle: {
//         fontSize: 22,
//         fontWeight: '700',
//         color: '#111827',
//     },
//     closeButton: {
//         padding: 4,
//     },
//     postPreview: {
//         marginHorizontal: 16,
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 12,
//         backgroundColor: '#F9FAFB',
//         borderRadius: theme.borderRadius.xl,
//         padding: 12,
//         borderWidth: 1,
//         borderColor: '#E5E7EB',
//     },
//     postPreviewMedia: {
//         width: 48,
//         height: 48,
//         borderRadius: theme.borderRadius.lg,
//         overflow: 'hidden',
//         backgroundColor: '#E5E7EB',
//     },
//     postPreviewImage: {
//         width: '100%',
//         height: '100%',
//     },
//     postPreviewVideo: {
//         width: '100%',
//         height: '100%',
//         backgroundColor: 'rgba(0,0,0,0.6)',
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     postPreviewText: {
//         flex: 1,
//     },
//     postPreviewUser: {
//         fontSize: 14,
//         fontWeight: '600',
//         color: '#111827',
//         marginBottom: 2,
//     },
//     postPreviewCaption: {
//         fontSize: 13,
//         color: '#6B7280',
//         lineHeight: 18,
//     },
//     commentsContainer: {
//         flex: 1,
//     },
//     commentsContent: {
//         padding: 16,
//     },
//     errorState: {
//         alignItems: 'center',
//         paddingVertical: 64,
//         gap: 12,
//     },
//     errorText: {
//         fontSize: 20,
//         fontWeight: '700',
//         color: '#DC2626',
//     },
//     errorSubtext: {
//         fontSize: 14,
//         color: '#B91C1C',
//         textAlign: 'center',
//     },
//     skeletonComment: {
//         flexDirection: 'row',
//         gap: 12,
//         alignItems: 'flex-start',
//     },
//     emptyState: {
//         alignItems: 'center',
//         paddingVertical: 80,
//         gap: 12,
//     },
//     emptyIconContainer: {
//         width: 100,
//         height: 100,
//         borderRadius: 50,
//         backgroundColor: '#F3F4F6',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginBottom: 8,
//     },
//     emptyText: {
//         fontSize: 18,
//         fontWeight: '600',
//         color: '#374151',
//     },
//     emptySubtext: {
//         fontSize: 14,
//         color: '#9CA3AF',
//     },
//     commentsList: {
//         gap: 4,
//     },
//     commentWrapper: {
//         marginBottom: 8,
//     },
//     nestedComment: {
//         marginLeft: 24,
//         marginTop: 8,
//     },
//     commentCard: {
//         position: 'relative',
//     },
//     swipeReplyIndicator: {
//         position: 'absolute',
//         left: -40,
//         top: 0,
//         bottom: 0,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     commentInner: {
//         flexDirection: 'row',
//         gap: 12,
//         backgroundColor: '#FFFFFF',
//     },
//     commentBody: {
//         flex: 1,
//     },
//     commentHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//         marginBottom: 4,
//     },
//     userName: {
//         fontSize: 15,
//         fontWeight: '600',
//         color: '#111827',
//     },
//     userNameNested: {
//         fontSize: 14,
//     },
//     timeAgo: {
//         fontSize: 13,
//         color: '#9CA3AF',
//     },
//     commentText: {
//         fontSize: 15,
//         color: '#374151',
//         lineHeight: 22,
//         marginBottom: 8,
//     },
//     commentTextNested: {
//         fontSize: 14,
//         lineHeight: 20,
//     },
//     commentActions: {
//         flexDirection: 'row',
//         gap: 16,
//     },
//     actionButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 6,
//     },
//     actionText: {
//         fontSize: 13,
//         color: '#6B7280',
//         fontWeight: '500',
//     },
//     likedText: {
//         color: '#EF4444',
//         fontWeight: '600',
//     },
//     repliesContainer: {
//         marginTop: 8,
//     },
//     replyBar: {
//         backgroundColor: '#F9FAFB',
//         borderTopWidth: 1,
//         borderTopColor: '#E5E7EB',
//     },
//     replyHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         paddingHorizontal: 16,
//         paddingVertical: 10,
//     },
//     replyIndicator: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 8,
//     },
//     replyingToText: {
//         fontSize: 14,
//         color: '#6B7280',
//     },
//     replyingToName: {
//         fontWeight: '600',
//         color: theme.colors.primary,
//     },
//     inputBar: {
//         flexDirection: 'row',
//         alignItems: 'flex-end',
//         gap: 12,
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         borderTopWidth: 1,
//         borderTopColor: '#E5E7EB',
//         backgroundColor: '#FFFFFF',
//     },
//     input: {
//         flex: 1,
//         borderRadius: 24,
//         backgroundColor: '#F3F4F6',
//         paddingHorizontal: 16,
//         paddingVertical: 10,
//         fontSize: 15,
//         color: '#111827',
//         maxHeight: 100,
//     },
//     sendButton: {
//         width: 44,
//         height: 44,
//         borderRadius: 22,
//         backgroundColor: theme.colors.primary,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     sendButtonDisabled: {
//         backgroundColor: '#E5E7EB',
//     },
// });

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Image,
    Animated,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import type { PanGestureHandlerGestureEvent, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { theme } from '../theme';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../hooks/useAuth';
import { postsApi } from '../services/postsApi';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { Storage } from '../services/storage';

interface LocalComment {
    id: string;
    user: {
        id: string;
        name: string;
        avatar: string;
    };
    text: string;
    timeAgo: string;
    likes: number;
    liked: boolean;
    isRemoved?: boolean;
    removedReason?: string;
    replies?: LocalComment[];
}

interface PostPreview {
    id: string;
    caption: string;
    media: {
        url: string;
        type: string;
        items?: string[];
    };
    user: {
        name: string;
    };
}

export default function CommentsScreen() {
    const router = useRouter();
    const searchParams = useLocalSearchParams<{ postId?: string }>();
    const postId = Array.isArray(searchParams.postId) ? searchParams.postId[0] : searchParams.postId;
    const { user } = useAuth();
    const [comments, setComments] = useState<LocalComment[]>([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const [postPreview, setPostPreview] = useState<PostPreview | null>(null);
    const [error, setError] = useState<string | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const inputRef = useRef<TextInput>(null);

    const loadComments = useCallback(async () => {
        if (!postId || !user) {
            setError('Invalid request');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [commentsResponse, postResponse] = await Promise.all([
                postsApi.getPostComments(postId),
                postsApi.getPost(postId),
            ]);

            const formattedComments = commentsResponse.comments
                .filter((comment: any) => !comment.isRemoved) // Filter out removed comments
                .map((comment: any) => ({
                    id: comment.id,
                    user: {
                        id: comment.user.id,
                        name: comment.user.name,
                        avatar: comment.user.avatarUrl || comment.user.avatar || '',
                    },
                    text: comment.text,
                    timeAgo: comment.timeAgo,
                    likes: comment.likes || 0,
                    liked: comment.liked || false,
                    isRemoved: comment.isRemoved || false,
                    removedReason: comment.removedReason,
                    replies: comment.replies?.map((reply: any) => ({
                        id: reply.id,
                        user: {
                            id: reply.user.id,
                            name: reply.user.name,
                            avatar: reply.user.avatarUrl || reply.user.avatar || '',
                        },
                        text: reply.text,
                        timeAgo: reply.timeAgo,
                        likes: reply.likes || 0,
                        liked: reply.liked || false,
                        isRemoved: reply.isRemoved || false,
                        removedReason: reply.removedReason,
                    })) || [],
                }));

            setComments(formattedComments);

            if (postResponse.post) {
                // Backend returns media.url directly from getMediaUrl helper
                const post = postResponse.post;
                const mediaUrl = post.media?.url || '';
                const mediaType = post.media?.type || 'image';
                const mediaItems = post.media?.items || [];

                console.log('🖼️ Initial post preview loaded:', {
                    postId: post.id,
                    mediaUrl,
                    mediaType,
                    mediaItems,
                    mediaFull: JSON.stringify(post.media),
                    postType: post.type
                });

                setPostPreview({
                    id: post.id,
                    caption: post.caption || '',
                    media: {
                        url: mediaUrl || '', // Ensure empty string, not null
                        type: mediaType,
                        items: mediaItems
                    },
                    user: {
                        name: post.user?.name || 'User'
                    }
                });
            }
        } catch (error: any) {
            console.error('Failed to load comments:', error);
            setError(error?.response?.data?.error || 'Failed to load comments');
        } finally {
            setLoading(false);
        }
    }, [postId, user]);

    useEffect(() => {
        if (postId && user) {
            loadComments();
        }
    }, [postId, user, loadComments]);

    const handleSend = async () => {
        if (!commentText.trim() || !user || !postId) return;

        try {
            const response = await postsApi.commentOnPost(postId, {
                text: commentText.trim(),
            });

            const newComment: LocalComment = {
                id: response.comment.id,
                user: {
                    id: response.comment.user.id,
                    name: response.comment.user.name,
                    avatar: response.comment.user.avatarUrl || '',
                },
                text: commentText.trim(),
                timeAgo: 'now',
                likes: 0,
                liked: false,
                replies: [],
            };

            // Update user avatar in storage if not set
            if (!user.avatar && response.comment.user?.avatarUrl) {
                const updatedUser = { ...user, avatar: response.comment.user.avatarUrl };
                await Storage.set('user', updatedUser);
                // Update the user state to reflect the change immediately
                // Note: AuthContext doesn't expose a setUser method, so we rely on storage update
            }

            setComments(prev => [newComment, ...prev]);
            setCommentText('');

            // Refresh post preview to ensure media is loaded
            try {
                const refreshedPost = await postsApi.getPost(postId);
                if (refreshedPost.post) {
                    const post = refreshedPost.post;
                    const mediaUrl = post.media?.url || '';
                    const mediaType = post.media?.type || 'image';
                    
                    console.log('🖼️ Post preview refreshed after comment:', {
                        mediaUrl,
                        mediaType,
                        mediaFull: JSON.stringify(post.media),
                        postType: post.type
                    });
                    
                    if (mediaUrl) {
                        setPostPreview({
                            id: post.id,
                            caption: post.caption || '',
                            media: {
                                url: mediaUrl,
                                type: mediaType
                            },
                            user: {
                                name: post.user?.name || 'User'
                            }
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to refresh post preview:', err);
            }

            setTimeout(() => {
                scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }, 100);
        } catch (error: any) {
            console.error('❌ Failed to post comment:', error);
            console.error('Error response:', JSON.stringify(error?.response?.data, null, 2));
            console.error('Error status:', error?.response?.status);
            
            // Show error message to user
            const errorMessage = error?.response?.data?.reason || 
                               error?.response?.data?.error || 
                               error?.message ||
                               'Failed to post comment. Please try again.';
            
            console.log('📢 Showing alert with message:', errorMessage);
            Alert.alert('Comment Failed', errorMessage);
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !user || !postId || !replyingTo) return;

        try {
            const response = await postsApi.commentOnPost(postId, {
                text: replyText.trim(),
                parentCommentId: replyingTo,
            });

            const newReply: LocalComment = {
                id: response.comment.id,
                user: {
                    id: response.comment.user.id,
                    name: response.comment.user.name,
                    avatar: response.comment.user.avatarUrl || '',
                },
                text: replyText.trim(),
                timeAgo: 'now',
                likes: 0,
                liked: false,
            };

            // Update user avatar in storage if not set
            if (!user.avatar && response.comment.user?.avatarUrl) {
                const updatedUser = { ...user, avatar: response.comment.user.avatarUrl };
                await Storage.set('user', updatedUser);
                // Note: AuthContext doesn't expose a setUser method, so we rely on storage update
            }

            const updateReplies = (items: LocalComment[]): LocalComment[] => {
                return items.map(item => {
                    if (item.id === replyingTo) {
                        return {
                            ...item,
                            replies: [newReply, ...(item.replies || [])],
                        };
                    }
                    if (item.replies && item.replies.length > 0) {
                        return {
                            ...item,
                            replies: updateReplies(item.replies),
                        };
                    }
                    return item;
                });
            };

            setComments(prev => updateReplies(prev));
            setReplyingTo(null);
            setReplyText('');
        } catch (error: any) {
            console.error('Failed to post reply:', error);
            
            // Show error message to user
            const errorMessage = error?.response?.data?.reason || 
                               error?.response?.data?.error || 
                               error?.message ||
                               'Failed to post reply. Please try again.';
            
            console.log('📢 Showing alert with message:', errorMessage);
            Alert.alert('Reply Failed', errorMessage);
        }
    };

    const handleLike = useCallback(async (commentId: string) => {
        if (!postId) return;

        const toggleLike = (items: LocalComment[]): LocalComment[] => {
            return items.map(item => {
                if (item.id === commentId) {
                    return {
                        ...item,
                        liked: !item.liked,
                        likes: item.liked ? item.likes - 1 : item.likes + 1,
                    };
                }
                if (item.replies && item.replies.length > 0) {
                    return {
                        ...item,
                        replies: toggleLike(item.replies),
                    };
                }
                return item;
            });
        };

        try {
            setComments(prev => toggleLike(prev));
            await postsApi.likeComment(postId, commentId);
        } catch (error) {
            console.error('Failed to like comment:', error);
            setComments(prev => toggleLike(prev));
        }
    }, [postId]);

    const findCommentById = useCallback((commentId: string): LocalComment | undefined => {
        const search = (items: LocalComment[]): LocalComment | undefined => {
            for (const item of items) {
                if (item.id === commentId) return item;
                if (item.replies) {
                    const found = search(item.replies);
                    if (found) return found;
                }
            }
            return undefined;
        };
        return search(comments);
    }, [comments]);

    const handleReply = useCallback((commentId: string) => {
        setReplyingTo(commentId);
        setReplyText('');
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <SafeAreaView style={styles.container} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.handle} />
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Comments</Text>
                        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    {/* Post Preview */}
                    {postPreview && (
                        <TouchableOpacity
                            style={styles.postPreview}
                            onPress={() => router.push(`/post/${postPreview.id}` as any)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.postPreviewMedia}>
                                {postPreview.media.type === 'video' ? (
                                    <View style={styles.postPreviewVideo}>
                                        <Ionicons name="play-circle" size={24} color="white" />
                                    </View>
                                ) : (
                                    // Use same fallback logic as profile screen
                                    <Image 
                                        source={{ uri: postPreview.media.url || postPreview.media.items?.[0] || '' }} 
                                        style={styles.postPreviewImage} 
                                    />
                                )}
                            </View>
                            <View style={styles.postPreviewText}>
                                <Text style={styles.postPreviewUser}>{postPreview.user.name}</Text>
                                <Text style={styles.postPreviewCaption} numberOfLines={2}>
                                    {postPreview.caption || 'View post'}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Comments List */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.commentsContainer}
                    contentContainerStyle={styles.commentsContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {error ? (
                        <View style={styles.errorState}>
                            <Ionicons name="alert-circle" size={56} color="#DC2626" />
                            <Text style={styles.errorText}>Oops!</Text>
                            <Text style={styles.errorSubtext}>{error}</Text>
                        </View>
                    ) : loading ? (
                        <View style={{ gap: 12 }}>
                            {[0, 1, 2, 3, 4].map(i => (
                                <View key={i} style={styles.skeletonComment}>
                                    <SkeletonLoader height={40} width={40} borderRadius={20} />
                                    <View style={{ flex: 1, gap: 8 }}>
                                        <SkeletonLoader height={14} style={{ width: '30%' }} />
                                        <SkeletonLoader height={12} style={{ width: '90%' }} />
                                        <SkeletonLoader height={12} style={{ width: '70%' }} />
                                    </View>
                                </View>
                            ))}
                        </View>
                    ) : comments.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.emptyIconContainer}>
                                <Ionicons name="chatbubbles-outline" size={64} color="#9CA3AF" />
                            </View>
                            <Text style={styles.emptyText}>No comments yet</Text>
                            <Text style={styles.emptySubtext}>Be the first to share your thoughts!</Text>
                        </View>
                    ) : (
                        <View style={styles.commentsList}>
                            {comments.map(comment => (
                                <CommentCard
                                    key={comment.id}
                                    comment={comment}
                                    onLike={handleLike}
                                    onReply={handleReply}
                                    depth={0}
                                />
                            ))}
                        </View>
                    )}
                </ScrollView>

                {/* Reply Bar - Shows above input when replying */}
                {replyingTo && (
                    <View style={styles.replyBar}>
                        <View style={styles.replyHeader}>
                            <View style={styles.replyIndicator}>
                                <Ionicons name="return-down-forward" size={16} color={theme.colors.primary} />
                                <Text style={styles.replyingToText}>
                                    Replying to <Text style={styles.replyingToName}>{findCommentById(replyingTo)?.user.name}</Text>
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => setReplyingTo(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Ionicons name="close" size={22} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Input Bar */}
                <View style={styles.inputBar}>
                    {user && <Avatar uri={user.avatar} size={36} />}
                    <TextInput
                        ref={inputRef}
                        style={styles.input}
                        value={replyingTo ? replyText : commentText}
                        onChangeText={replyingTo ? setReplyText : setCommentText}
                        placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                        placeholderTextColor="#9CA3AF"
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (replyingTo ? !replyText.trim() : !commentText.trim()) && styles.sendButtonDisabled
                        ]}
                        onPress={replyingTo ? handleSendReply : handleSend}
                        disabled={replyingTo ? !replyText.trim() : !commentText.trim()}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={(replyingTo ? !replyText.trim() : !commentText.trim()) ? '#9CA3AF' : 'white'}
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

// Simple CommentCard component without complex gestures
interface CommentCardProps {
    comment: LocalComment;
    onLike: (id: string) => void;
    onReply: (id: string) => void;
    depth: number;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment, onLike, onReply, depth }) => {
    const [lastTap, setLastTap] = useState<number>(0);
    const [showReplies, setShowReplies] = useState(true);
    const translateX = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const isNested = depth > 0;
    const MAX_DEPTH = 2;

    const handlePress = () => {
        const now = Date.now();
        if (now - lastTap < 300) {
            // Double tap - like
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 0.95,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 3,
                    useNativeDriver: true,
                }),
            ]).start();
            onLike(comment.id);
            setLastTap(0);
        } else {
            setLastTap(now);
        }
    };

    const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
        const { translationX } = event.nativeEvent;
        const clampedValue = Math.max(0, Math.min(translationX, 100));
        translateX.setValue(clampedValue);
    };

    const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
        const { state, translationX } = event.nativeEvent;

        if (state === State.END) {
            if (translationX > 50) {
                // Trigger reply
                Animated.spring(translateX, {
                    toValue: 100,
                    useNativeDriver: true,
                    speed: 20,
                }).start(() => {
                    onReply(comment.id);
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                });
            } else {
                // Snap back
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                    friction: 8,
                }).start();
            }
        }
    };

    const replyIconOpacity = translateX.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
    });

    return (
        <View style={[styles.commentWrapper, isNested && styles.nestedComment]}>
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
                activeOffsetX={[-10, 10]}
                activeOffsetY={[-100, 100]}
                failOffsetY={[-5, 5]}
            >
                <Animated.View style={{ transform: [{ translateX }] }}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={handlePress}
                        style={styles.commentCard}
                    >
                        {/* Reply indicator (shown when swiping) */}
                        <Animated.View style={[styles.swipeReplyIndicator, { opacity: replyIconOpacity }]}>
                            <Ionicons name="arrow-undo" size={18} color={theme.colors.primary} />
                        </Animated.View>

                        <Animated.View style={[styles.commentInner, { transform: [{ scale: scaleAnim }] }]}>
                            <Avatar uri={comment.user.avatar} size={isNested ? 32 : 40} />

                            <View style={styles.commentBody}>
                                <View style={styles.commentHeader}>
                                    <Text style={[styles.userName, isNested && styles.userNameNested]}>
                                        {comment.user.name}
                                    </Text>
                                    <Text style={styles.timeAgo}>· {comment.timeAgo}</Text>
                                </View>

                                <Text style={[styles.commentText, isNested && styles.commentTextNested]}>
                                    {comment.text}
                                </Text>

                                <View style={styles.commentActions}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => onReply(comment.id)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons name="chatbubble-outline" size={14} color="#6B7280" />
                                        <Text style={styles.actionText}>Reply</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => onLike(comment.id)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons
                                            name={comment.liked ? 'heart' : 'heart-outline'}
                                            size={14}
                                            color={comment.liked ? '#EF4444' : '#6B7280'}
                                        />
                                        {comment.likes > 0 && (
                                            <Text style={[styles.actionText, comment.liked && styles.likedText]}>
                                                {comment.likes}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    </TouchableOpacity>
                </Animated.View>
            </PanGestureHandler>

            {/* Show/Hide Replies Toggle */}
            {comment.replies && comment.replies.length > 0 && depth < MAX_DEPTH && (
                <>
                    <TouchableOpacity
                        style={styles.toggleRepliesButton}
                        onPress={() => setShowReplies(!showReplies)}
                    >
                        <View style={styles.replyLine} />
                        <View style={styles.toggleRepliesContent}>
                            <Ionicons
                                name={showReplies ? 'chevron-up' : 'chevron-down'}
                                size={14}
                                color={theme.colors.primary}
                            />
                            <Text style={styles.toggleRepliesText}>
                                {showReplies ? 'Hide' : 'View'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Nested Replies */}
                    {showReplies && (
                        <View style={styles.repliesContainer}>
                            {comment.replies.map(reply => (
                                <CommentCard
                                    key={reply.id}
                                    comment={reply}
                                    onLike={onLike}
                                    onReply={onReply}
                                    depth={depth + 1}
                                />
                            ))}
                        </View>
                    )}
                </>
            )}

            {/* Max depth indicator */}
            {comment.replies && comment.replies.length > 0 && depth >= MAX_DEPTH && (
                <View style={styles.maxDepthIndicator}>
                    <View style={styles.replyLine} />
                    <Text style={styles.maxDepthText}>
                        {comment.replies.length} more {comment.replies.length === 1 ? 'reply' : 'replies'}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 12,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#D1D5DB',
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 12,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
    },
    closeButton: {
        padding: 4,
    },
    postPreview: {
        marginHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    postPreviewMedia: {
        width: 48,
        height: 48,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
    },
    postPreviewImage: {
        width: '100%',
        height: '100%',
    },
    postPreviewVideo: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    postPreviewText: {
        flex: 1,
    },
    postPreviewUser: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    postPreviewCaption: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
    },
    commentsContainer: {
        flex: 1,
    },
    commentsContent: {
        padding: 16,
    },
    errorState: {
        alignItems: 'center',
        paddingVertical: 64,
        gap: 12,
    },
    errorText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#DC2626',
    },
    errorSubtext: {
        fontSize: 14,
        color: '#B91C1C',
        textAlign: 'center',
    },
    skeletonComment: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 80,
        gap: 12,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#9CA3AF',
    },
    commentsList: {
        gap: 16,
    },
    commentWrapper: {
        marginBottom: 4,
    },
    nestedComment: {
        marginLeft: 48,
        marginTop: 12,
    },
    commentCard: {
        backgroundColor: '#FFFFFF',
    },
    commentInner: {
        flexDirection: 'row',
        gap: 12,
    },
    commentBody: {
        flex: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    userNameNested: {
        fontSize: 14,
    },
    timeAgo: {
        fontSize: 13,
        color: '#9CA3AF',
    },
    commentText: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
        marginBottom: 8,
    },
    commentTextNested: {
        fontSize: 14,
        lineHeight: 20,
    },
    commentActions: {
        flexDirection: 'row',
        gap: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionText: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
    },
    likedText: {
        color: '#EF4444',
        fontWeight: '600',
    },
    toggleRepliesButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 52,
        marginTop: 8,
        gap: 8,
    },
    replyLine: {
        width: 2,
        height: 12,
        backgroundColor: '#E5E7EB',
    },
    toggleRepliesContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    toggleRepliesText: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: '600',
    },
    repliesContainer: {
        marginTop: 4,
    },
    maxDepthIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 52,
        marginTop: 8,
        gap: 8,
    },
    maxDepthText: {
        fontSize: 13,
        color: '#6B7280',
        fontStyle: 'italic',
    },
    replyBar: {
        backgroundColor: '#F9FAFB',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    replyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    replyIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    swipeReplyIndicator: {
        position: 'absolute',
        left: -40,
        top: '50%',
        transform: [{ translateY: -9 }],
        zIndex: -1,
    },
    replyingToText: {
        fontSize: 14,
        color: '#6B7280',
    },
    replyingToName: {
        fontWeight: '600',
        color: theme.colors.primary,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
    },
    input: {
        flex: 1,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: '#111827',
        maxHeight: 100,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
});;
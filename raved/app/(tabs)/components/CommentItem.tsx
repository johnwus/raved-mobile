// import React, { useRef, useState, useCallback } from 'react';
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     StyleSheet,
//     Animated,
//     Dimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { PanGestureHandler, State } from 'react-native-gesture-handler';
// import type { PanGestureHandlerGestureEvent, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
// import { theme } from '../../../theme';
// import { Avatar } from '../../../components/ui/Avatar';
//
// interface CommentItemProps {
//     comment: any;
//     onReply: (comment: any) => void;
//     onLike: (commentId: string) => void;
//     isLiked?: boolean;
//     likesCount?: number;
//     showReplies?: () => void;
//     repliesCount?: number;
//     depth?: number;
// }
//
// const { width } = Dimensions.get('window');
// const SWIPE_THRESHOLD = 70;
//
// export const CommentItem = ({
//                                 comment,
//                                 onReply,
//                                 onLike,
//                                 isLiked = false,
//                                 likesCount = 0,
//                                 showReplies,
//                                 repliesCount = 0,
//                                 depth = 0,
//                             }: CommentItemProps) => {
//     const [liked, setLiked] = useState(isLiked);
//     const [likes, setLikes] = useState(likesCount);
//     const translateX = useRef(new Animated.Value(0)).current;
//     const heartScale = useRef(new Animated.Value(1)).current;
//     const [lastTap, setLastTap] = useState<number>(0);
//
//     const isNested = depth > 0;
//
//     // Double tap to like
//     const handlePress = useCallback(() => {
//         const now = Date.now();
//         const DOUBLE_TAP_DELAY = 300;
//
//         if (now - lastTap < DOUBLE_TAP_DELAY) {
//             // Double tap detected
//             handleLike();
//             setLastTap(0);
//         } else {
//             setLastTap(now);
//         }
//     }, [lastTap]);
//
//     const handleLike = useCallback(() => {
//         // Animate heart
//         Animated.sequence([
//             Animated.spring(heartScale, {
//                 toValue: 1.4,
//                 friction: 3,
//                 useNativeDriver: true,
//             }),
//             Animated.spring(heartScale, {
//                 toValue: 1,
//                 friction: 3,
//                 useNativeDriver: true,
//             }),
//         ]).start();
//
//         setLiked(!liked);
//         setLikes(liked ? likes - 1 : likes + 1);
//         onLike(comment.id);
//     }, [liked, likes, comment.id]);
//
//     const handleReply = useCallback(() => {
//         onReply(comment);
//     }, [comment, onReply]);
//
//     // Swipe gesture handlers
//     const onGestureEvent = useCallback((event: PanGestureHandlerGestureEvent) => {
//         const { translationX } = event.nativeEvent;
//         // Only allow swiping right, max threshold
//         const clampedValue = Math.max(0, Math.min(translationX, SWIPE_THRESHOLD));
//         translateX.setValue(clampedValue);
//     }, []);
//
//     const onHandlerStateChange = useCallback((event: PanGestureHandlerStateChangeEvent) => {
//         const { state, translationX, velocityX } = event.nativeEvent;
//
//         if (state === State.END) {
//             // Check if swipe threshold is met
//             if (translationX > SWIPE_THRESHOLD * 0.6 || (translationX > SWIPE_THRESHOLD * 0.4 && velocityX > 500)) {
//                 // Spring to full swipe
//                 Animated.spring(translateX, {
//                     toValue: SWIPE_THRESHOLD,
//                     useNativeDriver: true,
//                     speed: 20,
//                     bounciness: 4,
//                 }).start(() => {
//                     // Trigger reply action
//                     handleReply();
//                     // Spring back
//                     setTimeout(() => {
//                         Animated.spring(translateX, {
//                             toValue: 0,
//                             useNativeDriver: true,
//                             speed: 12,
//                         }).start();
//                     }, 200);
//                 });
//             } else {
//                 // Spring back to original position
//                 Animated.spring(translateX, {
//                     toValue: 0,
//                     useNativeDriver: true,
//                     friction: 7,
//                 }).start();
//             }
//         }
//     }, [handleReply]);
//
//     const getTimeAgo = (createdAt: string) => {
//         const date = new Date(createdAt);
//         const now = new Date();
//         const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
//
//         if (seconds < 60) return 'now';
//         if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
//         if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
//         if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
//         return date.toLocaleDateString();
//     };
//
//     const replyIconOpacity = translateX.interpolate({
//         inputRange: [0, SWIPE_THRESHOLD],
//         outputRange: [0, 1],
//     });
//
//     const replyIconScale = translateX.interpolate({
//         inputRange: [0, SWIPE_THRESHOLD],
//         outputRange: [0.5, 1],
//     });
//
//     return (
//         <View style={[styles.container, isNested && styles.nestedContainer]}>
//             <PanGestureHandler
//                 onGestureEvent={onGestureEvent}
//                 onHandlerStateChange={onHandlerStateChange}
//                 activeOffsetX={[-1000, 10]}
//                 failOffsetX={[-10, -1000]}
//             >
//                 <Animated.View style={[styles.commentWrapper, { transform: [{ translateX }] }]}>
//                     {/* Swipe Reply Indicator */}
//                     <Animated.View
//                         style={[
//                             styles.replyIndicator,
//                             {
//                                 opacity: replyIconOpacity,
//                                 transform: [{ scale: replyIconScale }],
//                             },
//                         ]}
//                     >
//                         <Ionicons name="arrow-undo" size={24} color={theme.colors.primary} />
//                     </Animated.View>
//
//                     {/* Main Comment Content */}
//                     <TouchableOpacity
//                         style={styles.commentContent}
//                         onPress={handlePress}
//                         activeOpacity={0.95}
//                     >
//                         <View style={styles.commentInner}>
//                             <Avatar
//                                 uri={comment.user?.avatarUrl || comment.user?.avatar || ''}
//                                 size={isNested ? 32 : 40}
//                             />
//
//                             <View style={styles.commentBody}>
//                                 {/* User Info & Time */}
//                                 <View style={styles.headerRow}>
//                                     <Text style={[styles.userName, isNested && styles.userNameNested]} numberOfLines={1}>
//                                         {comment.user?.name || 'Unknown'}
//                                     </Text>
//                                     <Text style={styles.time}>· {getTimeAgo(comment.createdAt)}</Text>
//                                 </View>
//
//                                 {/* Comment Text */}
//                                 <Text style={[styles.commentText, isNested && styles.commentTextNested]}>
//                                     {comment.text}
//                                 </Text>
//
//                                 {/* Interaction Row */}
//                                 <View style={styles.interactionRow}>
//                                     <TouchableOpacity
//                                         style={styles.actionButton}
//                                         onPress={handleReply}
//                                         hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//                                     >
//                                         <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
//                                         <Text style={styles.actionText}>
//                                             {repliesCount > 0 ? `${repliesCount}` : 'Reply'}
//                                         </Text>
//                                     </TouchableOpacity>
//
//                                     <TouchableOpacity
//                                         style={styles.actionButton}
//                                         onPress={handleLike}
//                                         hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
//                                     >
//                                         <Animated.View style={{ transform: [{ scale: heartScale }] }}>
//                                             <Ionicons
//                                                 name={liked ? 'heart' : 'heart-outline'}
//                                                 size={18}
//                                                 color={liked ? '#EF4444' : '#6B7280'}
//                                             />
//                                         </Animated.View>
//                                         {likes > 0 && (
//                                             <Text style={[styles.actionText, liked && styles.likedText]}>
//                                                 {likes}
//                                             </Text>
//                                         )}
//                                     </TouchableOpacity>
//                                 </View>
//                             </View>
//                         </View>
//                     </TouchableOpacity>
//                 </Animated.View>
//             </PanGestureHandler>
//         </View>
//     );
// };
//
// const styles = StyleSheet.create({
//     container: {
//         marginBottom: 8,
//     },
//     nestedContainer: {
//         marginLeft: 24,
//         marginTop: 6,
//     },
//     commentWrapper: {
//         position: 'relative',
//     },
//     replyIndicator: {
//         position: 'absolute',
//         left: -48,
//         top: 0,
//         bottom: 0,
//         justifyContent: 'center',
//         alignItems: 'center',
//         width: 40,
//     },
//     commentContent: {
//         backgroundColor: '#FFFFFF',
//     },
//     commentInner: {
//         flexDirection: 'row',
//         gap: 12,
//     },
//     commentBody: {
//         flex: 1,
//     },
//     headerRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 6,
//         marginBottom: 4,
//     },
//     userName: {
//         fontSize: 15,
//         fontWeight: '600',
//         color: '#111827',
//         maxWidth: width * 0.5,
//     },
//     userNameNested: {
//         fontSize: 14,
//     },
//     time: {
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
//     interactionRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 16,
//     },
//     actionButton: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         gap: 6,
//         paddingVertical: 4,
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
// });
//
// export default CommentItem;



import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { theme } from '../../../theme';
import { Avatar } from '../../../components/ui/Avatar';

interface CommentItemProps {
    comment: any;
    onReply: (comment: any) => void;
    onLike: (commentId: string) => void;
    isLiked?: boolean;
    likesCount?: number;
    repliesCount?: number;
    depth?: number;
}

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 70;

export const CommentItem = ({
                                comment,
                                onReply,
                                onLike,
                                isLiked = false,
                                likesCount = 0,
                                repliesCount = 0,
                                depth = 0,
                            }: CommentItemProps) => {
    const [liked, setLiked] = useState(isLiked);
    const [likes, setLikes] = useState(likesCount);
    const translateX = useRef(new Animated.Value(0)).current;
    const heartScale = useRef(new Animated.Value(1)).current;
    const [lastTap, setLastTap] = useState<number>(0);

    const isNested = depth > 0;

    // Double tap to like
    const handlePress = useCallback(() => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap < DOUBLE_TAP_DELAY) {
            // Animate heart
            Animated.sequence([
                Animated.spring(heartScale, {
                    toValue: 1.4,
                    friction: 3,
                    useNativeDriver: true,
                }),
                Animated.spring(heartScale, {
                    toValue: 1,
                    friction: 3,
                    useNativeDriver: true,
                }),
            ]).start();

            setLiked(!liked);
            setLikes(liked ? likes - 1 : likes + 1);
            onLike(comment.id);
            setLastTap(0);
        } else {
            setLastTap(now);
        }
    }, [lastTap, heartScale, liked, likes, comment.id, onLike]);

    const handleReply = useCallback(() => {
        onReply(comment);
    }, [comment, onReply]);

    const handleLikePress = useCallback(() => {
        Animated.sequence([
            Animated.spring(heartScale, {
                toValue: 1.4,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.spring(heartScale, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
        ]).start();

        setLiked(!liked);
        setLikes(liked ? likes - 1 : likes + 1);
        onLike(comment.id);
    }, [heartScale, liked, likes, comment.id, onLike]);

    // Swipe gesture using new API
    const panGesture = Gesture.Pan()
        .activeOffsetX([-1000, 10])
        .onUpdate((event) => {
            const clampedValue = Math.max(0, Math.min(event.translationX, SWIPE_THRESHOLD));
            translateX.setValue(clampedValue);
        })
        .onEnd((event) => {
            if (event.translationX > SWIPE_THRESHOLD * 0.6 ||
                (event.translationX > SWIPE_THRESHOLD * 0.4 && event.velocityX > 500)) {
                Animated.spring(translateX, {
                    toValue: SWIPE_THRESHOLD,
                    useNativeDriver: true,
                    speed: 20,
                    bounciness: 4,
                }).start(() => {
                    handleReply();
                    setTimeout(() => {
                        Animated.spring(translateX, {
                            toValue: 0,
                            useNativeDriver: true,
                            speed: 12,
                        }).start();
                    }, 200);
                });
            } else {
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                    friction: 7,
                }).start();
            }
        });

    const getTimeAgo = (createdAt: string) => {
        const date = new Date(createdAt);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
        return date.toLocaleDateString();
    };

    const replyIconOpacity = translateX.interpolate({
        inputRange: [0, SWIPE_THRESHOLD],
        outputRange: [0, 1],
    });

    const replyIconScale = translateX.interpolate({
        inputRange: [0, SWIPE_THRESHOLD],
        outputRange: [0.5, 1],
    });

    return (
        <View style={[styles.container, isNested && styles.nestedContainer]}>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.commentWrapper, { transform: [{ translateX }] }]}>
                    {/* Swipe Reply Indicator */}
                    <Animated.View
                        style={[
                            styles.replyIndicator,
                            {
                                opacity: replyIconOpacity,
                                transform: [{ scale: replyIconScale }],
                            },
                        ]}
                    >
                        <Ionicons name="arrow-undo" size={24} color={theme.colors.primary} />
                    </Animated.View>

                    {/* Main Comment Content */}
                    <TouchableOpacity
                        style={styles.commentContent}
                        onPress={handlePress}
                        activeOpacity={0.95}
                    >
                        <View style={styles.commentInner}>
                            <Avatar
                                uri={comment.user?.avatarUrl || comment.user?.avatar || ''}
                                size={isNested ? 32 : 40}
                            />

                            <View style={styles.commentBody}>
                                {/* User Info & Time */}
                                <View style={styles.headerRow}>
                                    <Text style={[styles.userName, isNested && styles.userNameNested]} numberOfLines={1}>
                                        {comment.user?.name || 'Unknown'}
                                    </Text>
                                    <Text style={styles.time}>· {getTimeAgo(comment.createdAt)}</Text>
                                </View>

                                {/* Comment Text */}
                                <Text style={[styles.commentText, isNested && styles.commentTextNested]}>
                                    {comment.text}
                                </Text>

                                {/* Interaction Row */}
                                <View style={styles.interactionRow}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={handleReply}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Ionicons name="chatbubble-outline" size={16} color="#6B7280" />
                                        <Text style={styles.actionText}>
                                            {repliesCount > 0 ? `${repliesCount}` : 'Reply'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={handleLikePress}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                                            <Ionicons
                                                name={liked ? 'heart' : 'heart-outline'}
                                                size={18}
                                                color={liked ? '#EF4444' : '#6B7280'}
                                            />
                                        </Animated.View>
                                        {likes > 0 && (
                                            <Text style={[styles.actionText, liked && styles.likedText]}>
                                                {likes}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 8,
    },
    nestedContainer: {
        marginLeft: 24,
        marginTop: 6,
    },
    commentWrapper: {
        position: 'relative',
    },
    replyIndicator: {
        position: 'absolute',
        left: -48,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: 40,
    },
    commentContent: {
        backgroundColor: '#FFFFFF',
    },
    commentInner: {
        flexDirection: 'row',
        gap: 12,
    },
    commentBody: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        maxWidth: width * 0.5,
    },
    userNameNested: {
        fontSize: 14,
    },
    time: {
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
    interactionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
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
});

// export default CommentItem;
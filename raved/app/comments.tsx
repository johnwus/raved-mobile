import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../hooks/useAuth';
import { Comment } from '../types';
import postsApi from '../services/postsApi';

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
}

const mockComments: LocalComment[] = [
  {
    id: 'c1',
    user: {
      id: '1',
      name: 'Alice Johnson',
      avatar: 'https://example.com/avatar1.jpg',
    },
    text: 'Love this outfit! Where did you get the jacket?',
    timeAgo: '2h',
    likes: 12,
    liked: false,
  },
  {
    id: 'c2',
    user: {
      id: '2',
      name: 'Bob Smith',
      avatar: 'https://example.com/avatar2.jpg',
    },
    text: 'So stylish! 🔥',
    timeAgo: '1h',
    likes: 8,
    liked: true,
  },
  {
    id: 'c3',
    user: {
      id: '3',
      name: 'Charlie Brown',
      avatar: 'https://example.com/avatar3.jpg',
    },
    text: 'The color combination is perfect!',
    timeAgo: '30m',
    likes: 5,
    liked: false,
  },
];

export default function CommentsScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId?: string }>();
  const { user } = useAuth();
  const [comments, setComments] = useState<LocalComment[]>(mockComments);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (postId) {
      loadComments();
    }
  }, [postId]);

  const loadComments = async () => {
    if (!postId) return;

    try {
      setLoading(true);
      const response = await postsApi.getPostComments(postId);
      const formattedComments = response.comments.map((comment: any) => ({
        id: comment.id,
        user: {
          id: comment.user.id,
          name: comment.user.name,
          avatar: comment.user.avatarUrl || comment.user.avatar,
        },
        text: comment.text,
        timeAgo: comment.timeAgo,
        likes: comment.likes || 0,
        liked: comment.liked || false,
      }));
      setComments(formattedComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!commentText.trim() || !user || !postId) return;

    try {
      const response = await postsApi.commentOnPost(postId, {
        text: commentText.trim(),
      });

      const newComment: LocalComment = {
        id: response.comment.id,
        user: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
        },
        text: commentText.trim(),
        timeAgo: 'now',
        likes: 0,
        liked: false,
      };

      setComments(prev => [...prev, newComment]);
      setCommentText('');

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleLike = (commentId: string) => {
    setComments(prev =>
      prev.map(comment =>
        comment.id === commentId
          ? {
              ...comment,
              liked: !comment.liked,
              likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
            }
          : comment
      )
    );
  };

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
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments List */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.commentsContainer}
          contentContainerStyle={styles.commentsContent}
          showsVerticalScrollIndicator={false}
        >
          {comments.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
              <Text style={styles.emptyText}>No comments yet</Text>
              <Text style={styles.emptySubtext}>Be the first to comment!</Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <Avatar uri={comment.user.avatar} size={32} />
                <View style={styles.commentContent}>
                  <View style={styles.commentBubble}>
                    <Text style={styles.commentName}>{comment.user.name}</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                    <View style={styles.commentFooter}>
                      <Text style={styles.commentTime}>{comment.timeAgo}</Text>
                      <TouchableOpacity
                        style={styles.likeButton}
                        onPress={() => handleLike(comment.id)}
                      >
                        <Ionicons
                          name={comment.liked ? 'heart' : 'heart-outline'}
                          size={14}
                          color={comment.liked ? '#EF4444' : '#6B7280'}
                        />
                        <Text
                          style={[
                            styles.likeText,
                            comment.liked && styles.likeTextActive,
                          ]}
                        >
                          {comment.likes > 0 ? comment.likes : ''}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          {user && <Avatar uri={user.avatar} size={32} />}
          <TextInput
            style={styles.input}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Add a comment..."
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!commentText.trim()}
          >
            <Text
              style={[
                styles.sendButtonText,
                !commentText.trim() && styles.sendButtonTextDisabled,
              ]}
            >
              Post
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[3],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: theme.spacing[2],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
  },
  headerTitle: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  closeButton: {
    padding: theme.spacing[1],
  },
  commentsContainer: {
    flex: 1,
  },
  commentsContent: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  commentItem: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[3],
  },
  commentName: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    marginBottom: 4,
  },
  commentText: {
    fontSize: theme.typography.fontSize[14],
    color: '#374151',
    marginBottom: theme.spacing[2],
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  commentTime: {
    fontSize: theme.typography.fontSize[12],
    color: '#9CA3AF',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeText: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  likeTextActive: {
    color: '#EF4444',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    fontSize: theme.typography.fontSize[14],
    color: '#111827',
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
  },
  sendButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  sendButtonText: {
    color: 'white',
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
  },
  sendButtonTextDisabled: {
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing[12],
    gap: theme.spacing[2],
  },
  emptyText: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#374151',
  },
  emptySubtext: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
  },
});


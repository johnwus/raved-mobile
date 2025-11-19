import React, { useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../../../theme';
import { EmptyState } from '../../../components/ui/EmptyState';
import { CommentItem } from './CommentItem';

interface CommentsTabProps {
  userComments: any[];
  loadingTab: boolean;
  profileUserId: string;
  currentUserId: string;
}

export const CommentsTab = ({
  userComments,
  loadingTab: _loadingTab,
  profileUserId: _profileUserId,
  currentUserId: _currentUserId,
}: CommentsTabProps) => {
  const _router = useRouter();
  const [replyTo, setReplyTo] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const handleReply = (comment: any) => {
    setReplyTo(comment);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !replyTo) return;

    setSendingReply(true);
    try {
      const postsApi = (await import('../../../services/postsApi')).default;
      await postsApi.commentOnPost(replyTo.postId, {
        text: replyText,
        parentCommentId: replyTo.id,
      });
      setReplyText('');
      setReplyTo(null);
    } catch (error) {
      console.error('Failed to post reply:', error);
    } finally {
      setSendingReply(false);
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const postsApi = (await import('../../../services/postsApi')).default;
      // Get the post ID from the first comment (all comments should have same postId)
      const postId = userComments[0]?.postId;
      if (postId) {
        await postsApi.likeComment(postId, commentId);
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  const _toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  if (userComments.length === 0) {
    return <EmptyState icon="chatbubble-outline" title="No comments yet" />;
  }

  return (
    <>
      <FlatList
        key="comments-tab-list"
        scrollEnabled={false}
        data={userComments}
        renderItem={({ item }) => (
          <View>
            <CommentItem
              comment={item}
              onReply={handleReply}
              onLike={handleLike}
              isLiked={item.liked || false}
              likesCount={item.likesCount || 0}
              repliesCount={item.replies?.length || 0}
            />

            {/* Nested Replies */}
            {expandedReplies.has(item.id) && item.replies && item.replies.length > 0 && (
              <View style={styles.repliesContainer}>
                {item.replies.map((reply: any, index: number) => (
                  <View key={`${item.id}-reply-${index}`} style={styles.replyIndent}>
                    <CommentItem
                      comment={reply}
                      onReply={handleReply}
                      onLike={handleLike}
                      isLiked={reply.liked || false}
                      likesCount={reply.likesCount || 0}
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
        keyExtractor={(item, index) => `comment-${String(item.id)}-${String(index)}`}
      />

      {/* Reply Modal */}
      <Modal
        visible={replyTo !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setReplyTo(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Reply to Comment</Text>
                <TouchableOpacity
                  onPress={() => {
                    setReplyTo(null);
                    setReplyText('');
                  }}
                >
                  <Ionicons name="close" size={24} color="#111827" />
                </TouchableOpacity>
              </View>

              {/* Original Comment Preview */}
              {replyTo && (
                <ScrollView style={styles.originalCommentPreview}>
                  <Text style={styles.previewLabel}>Original Comment:</Text>
                  <View style={styles.previewCommentContent}>
                    <Text style={styles.previewUser}>{replyTo.user?.name}</Text>
                    <Text style={styles.previewText}>{replyTo.text}</Text>
                  </View>
                </ScrollView>
              )}

              {/* Reply Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.replyInput}
                  placeholder="Write a reply..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={500}
                  value={replyText}
                  onChangeText={setReplyText}
                  editable={!sendingReply}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!replyText.trim() || sendingReply) && styles.sendButtonDisabled,
                  ]}
                  onPress={handleSendReply}
                  disabled={!replyText.trim() || sendingReply}
                >
                  {sendingReply ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="send" size={18} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  repliesContainer: {
    backgroundColor: '#F9FAFB',
    paddingLeft: theme.spacing[4],
  },
  replyIndent: {
    borderLeftWidth: 2,
    borderLeftColor: '#E5E7EB',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  modalTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  originalCommentPreview: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[3],
    maxHeight: 120,
  },
  previewLabel: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#6B7280',
    marginBottom: theme.spacing[1],
  },
  previewCommentContent: {
    gap: theme.spacing[1],
  },
  previewUser: {
    fontSize: theme.typography.fontSize[13],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
  },
  previewText: {
    fontSize: theme.typography.fontSize[13],
    color: '#374151',
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    fontSize: theme.typography.fontSize[14],
    color: '#111827',
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.5,
  },
});

// export default CommentsTab;

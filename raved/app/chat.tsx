import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { EmptyState } from '../components/ui/EmptyState';
import { ChatListItem } from '../components/chat/ChatListItem';
import { chatApi } from '../services/chatApi';
import { useAuth } from '../hooks/useAuth';
import { socketService } from '../services/socket';
import { usePresenceStore } from '../store/presenceStore';

interface Chat {
  id: string;
  otherParticipant: {
    id: string;
    username: string;
    name: string;
    avatarUrl: string;
  };
  lastMessage: {
    content: string;
    timeAgo: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  createdAt: string;
  lastMessageAt: string | null;
}

export default function ChatScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const _scrollViewRef = useRef<ScrollView>(null);
  const { setUserOnline, setUserOffline } = usePresenceStore();

  const transformChatData = (chat: any) => {
    const otherParticipant = chat.participants?.find((p: any) => p.id !== user?.id) || chat.otherParticipant;
    return {
      id: chat.id,
      otherParticipant: otherParticipant || {
        id: '',
        username: '',
        name: 'Unknown',
        avatarUrl: '',
      },
      lastMessage: chat.lastMessage ? {
        content: chat.lastMessage.content,
        timeAgo: chat.lastMessage.timeAgo || '',
        createdAt: chat.lastMessage.createdAt,
      } : null,
      unreadCount: chat.unreadCount || 0,
      createdAt: chat.createdAt || '',
      lastMessageAt: chat.lastMessageAt || null,
    };
  };

  const makeConversationUpdater = useCallback((data: any) => (c: Chat) => {
    if (c.id !== data.conversationId) return c;
    return {
      ...c,
      lastMessage: {
        content: data.lastMessage,
        timeAgo: data.timeAgo || '',
        createdAt: data.lastMessageAt
      },
      unreadCount: data.incrementUnread ? (c.unreadCount || 0) + 1 : c.unreadCount
    };
  }, []);

  const handleConversationUpdated = useCallback((data: any) => {
    setChats(prev => prev.map(makeConversationUpdater(data)));
  }, [makeConversationUpdater]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await chatApi.getChats();
        if (response.success && response.chats) {
          setChats(response.chats.map(transformChatData));
        } else {
          setChats([]);
        }
      } catch (error) {
        console.error('Failed to fetch chats:', error);
        setChats([]);
      } finally {
        setLoading(false);
      }
    };

    if (!user) return;
    fetchChats();

    const setupSocket = async () => {
      try {
        const socket = await socketService.connect();
        socket.emit('join', user.id);
        console.log('[CHAT] Socket connected, setting up listeners');
        
        // Listen for initial list of online users when connecting
        socketService.onUsersOnlineList((users: any[]) => {
          console.log('[CHAT] Received users_online_list:', users);
           
          for (const u of users) {
            console.log(`[CHAT] Setting ${u.username} (${u.userId}) as online`);
            setUserOnline(u.userId, u.username);
          }
        });
        
        // eslint-disable-next-line sonarjs/cognitive-complexity
        socketService.onConversationUpdated(handleConversationUpdated);
        socketService.onUserOnline(data => {
          console.log('[CHAT] User online event:', data);
          setUserOnline(data.userId, data.username);
        });
        socketService.onUserOffline(data => {
          console.log('[CHAT] User offline event:', data);
          setUserOffline(data.userId);
        });
      } catch (error_) {
        console.warn('Socket setup failed:', error_);
      }
    };
    setupSocket();
  }, [user, setUserOnline, setUserOffline]);

  const handleOpenChat = (chatId: string) => {
    router.push(`/chat/${chatId}` as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Messages</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{chats.filter(c => c.unreadCount > 0).length}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading chats...</Text>
          </View>
        )}

        {!loading && chats.length === 0 && (
          <EmptyState
            icon="chatbubbles-outline"
            title="No conversations yet"
          />
        )}

        {!loading && chats.length > 0 && (
          <View style={styles.chatsList}>
            {chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                onPress={handleOpenChat}
              />
            ))}
          </View>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[3],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
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
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: theme.typography.fontSize[10],
    fontWeight: theme.typography.fontWeight.bold,
  },
  closeButton: {
    padding: theme.spacing[1],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: theme.spacing[2],
  },
  chatsList: {
    gap: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing[12],
  },
  loadingText: {
    fontSize: theme.typography.fontSize[16],
    color: '#6B7280',
  },
});


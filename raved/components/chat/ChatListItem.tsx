import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { theme } from '../../theme';
import { Avatar } from '../ui/Avatar';
import { usePresenceStore } from '../../store/presenceStore';

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

interface ChatListItemProps {
  chat: Chat;
  onPress: (chatId: string) => void;
}

export function ChatListItem({ chat, onPress }: ChatListItemProps) {
  const isOnline = usePresenceStore((s) => s.isUserOnline(chat.otherParticipant.id));
  
  React.useEffect(() => {
    console.log(`[ChatListItem] ${chat.otherParticipant.username} (${chat.otherParticipant.id}): isOnline=${isOnline}`);
  }, [isOnline, chat.otherParticipant.id, chat.otherParticipant.username]);

  return (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => onPress(chat.id)}
    >
      <View style={styles.avatarContainer}>
        <Avatar uri={chat.otherParticipant.avatarUrl || ''} size={44} />
        <View style={[
          styles.statusDot,
          isOnline ? styles.statusDotOnline : styles.statusDotOffline
        ]} />
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {chat.otherParticipant.name}
          </Text>
          <Text style={styles.chatTime}>
            {chat.lastMessage?.timeAgo || ''}
          </Text>
        </View>
        <Text style={styles.chatPreview} numberOfLines={1}>
          {chat.lastMessage?.content || 'No messages yet'}
        </Text>
      </View>
      {chat.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadBadgeText}>{chat.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatarContainer: {
    position: 'relative',
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusDotOnline: {
    backgroundColor: '#10B981',
  },
  statusDotOffline: {
    backgroundColor: '#9CA3AF',
  },
  chatInfo: {
    flex: 1,
    gap: 4,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatName: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    flex: 1,
  },
  chatTime: {
    fontSize: theme.typography.fontSize[10],
    color: '#6B7280',
  },
  chatPreview: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: 'white',
    fontSize: theme.typography.fontSize[10],
    fontWeight: theme.typography.fontWeight.bold,
  },
});

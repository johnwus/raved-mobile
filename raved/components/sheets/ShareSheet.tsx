import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '../ui/BottomSheet';
import { theme } from '../../theme';

interface ShareSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  url?: string;
}

export const ShareSheet: React.FC<ShareSheetProps> = ({ visible, onClose, title, url }) => {
  const copyLink = async () => {
    if (url) {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(url);
    }
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height="65%" allowCollapse>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Share</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {title && (
          <View style={styles.preview}>
            <Ionicons name="share-social" size={18} color={theme.colors.primary} />
            <Text style={styles.previewText} numberOfLines={1}>{title}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.action} onPress={copyLink}>
            <View style={[styles.iconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="link" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.actionLabel}>Copy link</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={onClose}>
            <View style={[styles.iconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="logo-whatsapp" size={20} color="#059669" />
            </View>
            <Text style={styles.actionLabel}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.action} onPress={onClose}>
            <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="logo-twitter" size={20} color="#D97706" />
            </View>
            <Text style={styles.actionLabel}>Twitter/X</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  closeButton: { padding: theme.spacing[1] },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: theme.spacing[4],
  },
  previewText: {
    flex: 1,
    fontSize: theme.typography.fontSize[14],
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[2],
  },
  action: {
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: theme.typography.fontSize[12],
    color: '#374151',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons
        name={icon}
        size={64}
        color={isDark ? '#475569' : '#D1D5DB'}
        style={styles.icon}
      />
      <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          {subtitle}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          size="medium"
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing[12], // py-12
    paddingHorizontal: theme.spacing[4],
  },
  icon: {
    marginBottom: theme.spacing[3], // mb-3
  },
  title: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280', // gray-500
    textAlign: 'center',
    marginBottom: theme.spacing[1],
  },
  titleDark: {
    color: '#9CA3AF', // gray-400
  },
  subtitle: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280', // gray-500
    textAlign: 'center',
  },
  subtitleDark: {
    color: '#9CA3AF', // gray-400
  },
  actionButton: {
    marginTop: theme.spacing[3], // mt-3
  },
});


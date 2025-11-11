import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from './Button';

interface ErrorStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  icon = 'alert-circle',
  title,
  message,
  onRetry,
  retryLabel = 'Retry',
}) => {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Ionicons
        name={icon}
        size={48}
        color="#EF4444" // red-500
        style={styles.icon}
      />
      <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
      {message && (
        <Text style={[styles.message, isDark && styles.messageDark]}>
          {message}
        </Text>
      )}
      {onRetry && (
        <Button
          title={retryLabel}
          onPress={onRetry}
          variant="primary"
          size="medium"
          style={styles.retryButton}
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
    paddingVertical: theme.spacing[12],
    paddingHorizontal: theme.spacing[4],
  },
  icon: {
    marginBottom: theme.spacing[3],
  },
  title: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  titleDark: {
    color: '#E5E7EB',
  },
  message: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280', // gray-500
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  messageDark: {
    color: '#9CA3AF', // gray-400
  },
  retryButton: {
    marginTop: theme.spacing[3],
  },
});

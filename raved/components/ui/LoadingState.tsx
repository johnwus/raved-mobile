import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { SkeletonLoader } from './SkeletonLoader';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  variant?: 'spinner' | 'skeleton';
  skeletonCount?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  size = 'large',
  variant = 'spinner',
  skeletonCount = 3,
}) => {
  const { isDark, currentColors } = useTheme();

  if (variant === 'skeleton') {
    return (
      <View style={styles.skeletonContainer}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <SkeletonLoader
            key={index}
            width="100%"
            height={20}
            borderRadius={8}
            style={index < skeletonCount - 1 ? styles.skeletonItem : {}}
          />
        ))}
        {message && (
          <Text style={[styles.message, isDark && styles.messageDark]}>
            {message}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={currentColors.primary} />
      {message && (
        <Text style={[styles.message, isDark && styles.messageDark]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  skeletonContainer: {
    flex: 1,
    padding: theme.spacing[4],
    gap: theme.spacing[2],
  },
  skeletonItem: {
    marginBottom: theme.spacing[2],
  },
  message: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280', // gray-500
    textAlign: 'center',
    marginTop: theme.spacing[2],
  },
  messageDark: {
    color: '#9CA3AF', // gray-400
  },
});


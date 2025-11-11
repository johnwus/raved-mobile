import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../theme';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'gray';
  size?: 'small' | 'medium';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'primary',
  size = 'small',
  style,
  textStyle,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: `${theme.colors.primary}20`, color: theme.colors.primary };
      case 'success':
        return { backgroundColor: `${theme.colors.success}20`, color: theme.colors.success };
      case 'warning':
        return { backgroundColor: `${theme.colors.warning}20`, color: theme.colors.warning };
      case 'error':
        return { backgroundColor: '#FEE2E2', color: '#DC2626' };
      case 'gray':
        return { backgroundColor: '#F3F4F6', color: '#6B7280' };
    }
  };

  const variantStyle = getVariantStyle();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyle.backgroundColor,
          paddingHorizontal: size === 'small' ? theme.spacing[2] : theme.spacing[3],
          paddingVertical: size === 'small' ? 2 : 4,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: variantStyle.color,
            fontSize: size === 'small' ? theme.typography.fontSize[10] : theme.typography.fontSize[12],
          },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: theme.typography.fontWeight.medium,
  },
});


import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  style,
}) => {
  const getCardStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius['2xl'],
      backgroundColor: '#FFFFFF',
    };

    if (variant === 'elevated') {
      baseStyle.shadowColor = '#000000';
      baseStyle.shadowOffset = {
        width: 0,
        height: 2,
      };
      baseStyle.shadowOpacity = 0.1;
      baseStyle.shadowRadius = 8;
      baseStyle.elevation = 4;
    } else if (variant === 'outlined') {
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = '#E5E7EB'; // gray-200
    }

    return [baseStyle, style];
  };

  return (
    <View style={getCardStyle()}>
      {children}
    </View>
  );
};


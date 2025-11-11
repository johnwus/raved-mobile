import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle 
} from 'react-native';
import { theme } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.xl,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.5 : 1,
    };

    // Size styles
    if (size === 'small') {
      baseStyle.paddingVertical = theme.spacing[2];
      baseStyle.paddingHorizontal = theme.spacing[4];
    } else if (size === 'large') {
      baseStyle.paddingVertical = theme.spacing[4];
      baseStyle.paddingHorizontal = theme.spacing[8];
    } else {
      baseStyle.paddingVertical = theme.spacing[3];
      baseStyle.paddingHorizontal = theme.spacing[6];
    }

    // Variant styles
    if (variant === 'primary') {
      baseStyle.backgroundColor = theme.colors.primary;
    } else if (variant === 'secondary') {
      baseStyle.backgroundColor = '#f3f4f6'; // gray-100
    } else if (variant === 'outline') {
      baseStyle.backgroundColor = 'transparent';
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = theme.colors.primary;
    }

    return [baseStyle, style];
  };

  const getTextStyle = () => {
    const baseStyle: TextStyle = {
      fontSize: theme.typography.fontSize[14],
      fontWeight: theme.typography.fontWeight.semibold,
    };

    if (variant === 'primary') {
      baseStyle.color = '#FFFFFF';
    } else if (variant === 'secondary') {
      baseStyle.color = '#374151'; // gray-700
    } else if (variant === 'outline') {
      baseStyle.color = theme.colors.primary;
    }

    return [baseStyle, textStyle];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {leftIcon && !loading && (
        <>{leftIcon}</>
      )}
      
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#FFFFFF' : theme.colors.primary} 
          style={{ marginRight: theme.spacing[2] }}
        />
      )}
      
      <Text style={getTextStyle()}>{title}</Text>
      
      {rightIcon && !loading && (
        <>{rightIcon}</>
      )}
    </TouchableOpacity>
  );
};


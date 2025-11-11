import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type = 'success',
  duration = 2500,
  onHide,
}) => {
  const { isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      // Small delay before showing (matching HTML)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      }, 10);

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -20,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />;
      case 'error':
        return <Ionicons name="close-circle" size={20} color="#EF4444" />;
      case 'info':
        return <Ionicons name="information-circle" size={20} color="#3B82F6" />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        isDark && styles.toastDark,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      {getIcon()}
      <Text style={[styles.text, isDark && styles.textDark]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 64, // top-16 (16 * 4 = 64px)
    left: '50%',
    marginLeft: -150, // translateX(-50%) equivalent
    width: 300,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing[12], // px-12 (48px)
    paddingVertical: 56, // py-14 (14 * 4 = 56px) - exact from HTML
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 10,
    gap: theme.spacing[2],
    zIndex: 9999,
  },
  toastDark: {
    backgroundColor: '#171923',
  },
  text: {
    flex: 1,
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#111827',
  },
  textDark: {
    color: '#E5E7EB',
  },
});


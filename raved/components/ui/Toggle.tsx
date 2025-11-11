import React from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { theme } from '../../theme';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  const translateX = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [value]);

  const handlePress = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  const circleTranslateX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22], // 44px width - 20px circle - 2px margin
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.track,
          value && styles.trackActive,
          disabled && styles.trackDisabled,
        ]}
      >
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ translateX: circleTranslateX }],
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1D5DB', // gray-300
    justifyContent: 'center',
    padding: 2,
  },
  trackActive: {
    backgroundColor: theme.colors.primary,
  },
  trackDisabled: {
    opacity: 0.5,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});


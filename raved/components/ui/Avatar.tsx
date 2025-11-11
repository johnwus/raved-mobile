import React from 'react';
import { Image, View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../theme';

interface AvatarProps {
  uri?: string;
  size?: number;
  style?: ViewStyle;
}

// Default avatar placeholder
const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 36,
  style,
}) => {
  // Use default avatar if uri is empty or undefined
  const avatarUri = uri && uri.trim() ? uri : DEFAULT_AVATAR;

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, style]}>
      <Image
        source={{ uri: avatarUri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});


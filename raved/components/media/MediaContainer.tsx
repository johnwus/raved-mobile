import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { getImageDimensions } from '@/utils/mediaDimensions';
import { Skeleton } from '@/components/ui/Skeleton';
import { theme } from '@/theme';

interface MediaContainerProps {
  uri: string;
  type: 'image' | 'carousel' | 'video';
}

export const MediaContainer: React.FC<MediaContainerProps> = ({ uri, type }) => {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!uri) {
      setError(true);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadDimensions = async () => {
      try {
        const dims = await getImageDimensions(uri);
        if (isMounted) {
          setDimensions(dims);
          setLoading(false);
          setError(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };

    loadDimensions();

    return () => {
      isMounted = false;
    };
  }, [uri]);

  // Show skeleton while loading dimensions
  if (loading) {
    const estimatedHeight = type === 'carousel' ? 300 : 280;
    return (
      <View style={{ width: '100%', height: estimatedHeight }}>
        <Skeleton width="100%" height={estimatedHeight} />
      </View>
    );
  }

  // Fallback for error
  if (error || !dimensions) {
    return (
      <View style={[styles.errorContainer, { height: 200 }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ width: dimensions.width, height: dimensions.height }}>
      <Image
        source={{ uri }}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          backgroundColor: '#f3f4f6',
        }}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
});

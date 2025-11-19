import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Post } from '../../../types';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ProductGrid } from '../../../components/store/ProductGrid';

interface SavedTabProps {
  savedPostsList: Post[];
  savedProducts: any[];
  savedSegment: 'posts' | 'products';
}

export const SavedTab = ({ savedPostsList, savedProducts, savedSegment }: SavedTabProps) => {
  const router = useRouter();

  if (savedSegment === 'posts') {
    if (savedPostsList.length === 0) {
      return <EmptyState icon="bookmark-outline" title="No saved posts yet" />;
    }

    return (
      <FlatList
        key="saved-posts-grid"
        scrollEnabled={false}
        data={savedPostsList}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.postThumbnail}
            onPress={() => router.push(`/post/${item.id}` as any)}
          >
            <Image
              source={{ uri: item.media.url || item.media.items?.[0] || item.media.thumbnail || '' }}
              style={styles.thumbnailImage}
            />
            {item.media.type === 'video' && (
              <View style={styles.videoOverlay}>
                <Ionicons name="play" size={16} color="white" />
              </View>
            )}
            {item.media.type === 'carousel' && (
              <View style={styles.carouselOverlay}>
                <Ionicons name="copy" size={12} color="white" />
              </View>
            )}
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => `saved-post-${String(item.id)}-${String(index)}`}
        ItemSeparatorComponent={() => <View style={{ width: 2 }} />}
        columnWrapperStyle={styles.postRow}
      />
    );
  } else {
    // Products segment
    if (savedProducts.length === 0) {
      return <EmptyState icon="bookmark-outline" title="No saved products yet" />;
    }

    return <ProductGrid products={savedProducts} />;
  }
};

const styles = StyleSheet.create({
  postThumbnail: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postRow: {
    justifyContent: 'space-between',
  },
});


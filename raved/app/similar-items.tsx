import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { ProductCard } from '../components/store/ProductCard';
import { mockStoreItems } from '../utils/mockData';
import { StoreItem } from '../types';

type FilterType = 'all' | 'category' | 'price' | 'seller' | 'trending';

export default function SimilarItemsScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const currentProduct = productId
    ? mockStoreItems.find(item => item.id === productId)
    : mockStoreItems[0];

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'All Similar' },
    { id: 'category', label: 'Same Category' },
    { id: 'price', label: 'Similar Price' },
    { id: 'seller', label: 'Same Seller' },
    { id: 'trending', label: 'Trending' },
  ];

  // Filter items based on active filter
  const getFilteredItems = (): StoreItem[] => {
    if (!currentProduct) return mockStoreItems.slice(0, 8);
    
    switch (activeFilter) {
      case 'category':
        return mockStoreItems.filter(item => 
          item.id !== currentProduct.id && item.category === currentProduct.category
        ).slice(0, 8);
      case 'price':
        const priceRange = currentProduct.price * 0.3;
        return mockStoreItems.filter(item => 
          item.id !== currentProduct.id &&
          Math.abs(item.price - currentProduct.price) <= priceRange
        ).slice(0, 8);
      case 'seller':
        return mockStoreItems.filter(item => 
          item.id !== currentProduct.id && item.seller.id === currentProduct.seller.id
        ).slice(0, 8);
      case 'trending':
        return mockStoreItems
          .filter(item => item.id !== currentProduct.id)
          .sort((a, b) => (b.sales || 0) - (a.sales || 0))
          .slice(0, 8);
      default:
        return mockStoreItems.filter(item => item.id !== currentProduct.id).slice(0, 8);
    }
  };

  const similarItems = getFilteredItems();
  const recentlyViewed = mockStoreItems.slice(0, 4);
  const recommended = mockStoreItems.slice(4, 8);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handle} />
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Similar Items</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Current Item Preview */}
        {currentProduct && (
          <View style={styles.currentItemPreview}>
            <Image source={{ uri: currentProduct.images[0] }} style={styles.currentItemImage} />
            <View style={styles.currentItemInfo}>
              <Text style={styles.currentItemName} numberOfLines={1}>
                {currentProduct.name}
              </Text>
              <Text style={styles.currentItemPrice}>₵{currentProduct.price}</Text>
            </View>
          </View>
        )}

        {/* Filter Options */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                activeFilter === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === filter.id && styles.filterButtonTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Similar Items Grid */}
        <View style={styles.section}>
          <View style={styles.itemsGrid}>
            {similarItems.map((item) => (
              <View key={item.id} style={styles.itemWrapper}>
                <ProductCard
                  product={item}
                  onSave={() => {}}
                  onAddToCart={() => {}}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Recently Viewed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.sectionTitle}>Recently Viewed</Text>
          </View>
          <View style={styles.itemsGrid}>
            {recentlyViewed.map((item) => (
              <View key={item.id} style={styles.itemWrapper}>
                <ProductCard
                  product={item}
                  onSave={() => {}}
                  onAddToCart={() => {}}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Recommended */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Recommended for You</Text>
          </View>
          <View style={styles.itemsGrid}>
            {recommended.map((item) => (
              <View key={item.id} style={styles.itemWrapper}>
                <ProductCard
                  product={item}
                  onSave={() => {}}
                  onAddToCart={() => {}}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[3],
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: theme.spacing[2],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    flex: 1,
  },
  backButton: {
    padding: theme.spacing[1],
  },
  headerTitle: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  closeButton: {
    padding: theme.spacing[1],
  },
  currentItemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: '#F9FAFB',
    marginHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius['2xl'],
    marginBottom: theme.spacing[3],
  },
  currentItemImage: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.lg,
  },
  currentItemInfo: {
    flex: 1,
  },
  currentItemName: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    marginBottom: 4,
  },
  currentItemPrice: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  filtersContainer: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[2],
  },
  filterButton: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: theme.typography.fontSize[14],
    color: '#374151',
    fontWeight: theme.typography.fontWeight.medium,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[4],
    gap: theme.spacing[6],
  },
  section: {
    gap: theme.spacing[4],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[4],
  },
  itemWrapper: {
    width: '47%',
  },
});


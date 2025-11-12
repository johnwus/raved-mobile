import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { ProductGrid } from '../components/store/ProductGrid';
import { useStore } from '../hooks/useStore';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { storeApi } from '../services/storeApi';
import { SortFilterSheet, SortOption } from '../components/sheets/SortFilterSheet';

import { useAuth } from '../hooks/useAuth';

export default function StoreScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cartItems } = useStore();
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const loadProducts = React.useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (category && category !== 'all') params.category = category;
      if (searchQuery) params.search = searchQuery;
      if (sort) params.sort = sort;
      const res = await storeApi.getStoreItems(params);
      setProducts(res.items || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || e.message || 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, category, searchQuery, sort]);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const categories = [
    { id: 'all', label: 'All Items', icon: '📦' },
    { id: 'clothing', label: 'Clothing', icon: '👕' },
    { id: 'accessories', label: 'Accessories', icon: '💎' },
    { id: 'shoes', label: 'Shoes', icon: '👟' },
  ];

  const filteredProducts = products; // already filtered via API

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fashion Store</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.authContainer}>
          <Text style={styles.authText}>Please log in to view the store.</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fashion Store</Text>
        <TouchableOpacity onPress={() => router.push('/cart')}>
          <View style={styles.cartButton}>
            <Ionicons name="cart" size={24} color="#111827" />
            {cartItems.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity onPress={() => setFilterOpen(true)} style={styles.filterButton}>
          <Ionicons name="filter" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryButton,
              category === cat.id && styles.categoryButtonActive
            ]}
            onPress={() => setCategory(cat.id)}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[
              styles.categoryLabel,
              category === cat.id && styles.categoryLabelActive
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Loading State */}
      {loading && (
        <View style={{ paddingHorizontal: theme.spacing[4], paddingTop: theme.spacing[2] }}>
          {/* 2x2 skeleton grid */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[2] }}>
            <SkeletonLoader height={180} style={{ width: '47%', borderRadius: theme.borderRadius.xl }} />
            <SkeletonLoader height={180} style={{ width: '47%', borderRadius: theme.borderRadius.xl }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <SkeletonLoader height={180} style={{ width: '47%', borderRadius: theme.borderRadius.xl }} />
            <SkeletonLoader height={180} style={{ width: '47%', borderRadius: theme.borderRadius.xl }} />
          </View>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadProducts} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Products Grid */}
      {!loading && !error && <ProductGrid products={filteredProducts} />}

      {/* Sort & Filter Sheet */}
      <SortFilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        category={category}
        sort={sort}
        onApply={({ category: c, sort: s }) => {
          setCategory(c);
          setSort(s);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: theme.typography.fontSize[10],
    fontWeight: theme.typography.fontWeight.bold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: theme.spacing[4],
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: theme.spacing[2],
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize[14],
    color: '#111827',
  },
  filterButton: {
    marginLeft: theme.spacing[2],
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#F3F4F6',
  },
  categoriesContainer: {
    marginBottom: theme.spacing[2],
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[4],
  },
  authText: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
    marginBottom: theme.spacing[3],
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.xl,
  },
  loginButtonText: {
    color: 'white',
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  categoriesContent: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[2],
  },
  categoryButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    minWidth: 100,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryLabel: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#374151',
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[8],
  },
  loadingText: {
    fontSize: theme.typography.fontSize[16],
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[8],
  },
  errorText: {
    fontSize: theme.typography.fontSize[16],
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.xl,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
  },
});


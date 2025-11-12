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
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { ErrorState } from '../../components/ui/ErrorState';
import { useStoreStore } from '../../store/storeStore';
import { useStore } from '../../hooks/useStore';
import { formatCurrency } from '../../utils/formatters';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { ShareSheet } from '../../components/sheets/ShareSheet';

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { products, savedItems, addToCart, removeFromCart, saveProduct, unsaveProduct } = useStoreStore() as any;
  const { cartItems } = useStore();
  
  const productId = params.id as string;
  const [product, setProduct] = useState<any>(products.find((p: any) => p.id === productId));
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!productId) return;
      if (!product) {
        try {
          setLoading(true);
          const { storeApi } = await import('../../services/storeApi');
          const res = await storeApi.getStoreItem(productId);
          if (mounted) setProduct(res.item || res);
        } catch (e) {
          console.warn('Failed to load product', e);
        } finally {
          if (mounted) setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [productId, product]);
  
  if (loading && !product) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Skeleton for product detail */}
        <SkeletonLoader height={360} />
        <View style={{ padding: theme.spacing[4], gap: 12 }}>
          <SkeletonLoader height={20} style={{ width: '60%' }} />
          <SkeletonLoader height={24} style={{ width: '40%' }} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <SkeletonLoader height={20} style={{ width: 80 }} />
            <SkeletonLoader height={20} style={{ width: 90 }} />
          </View>
          <SkeletonLoader height={14} style={{ width: '80%', marginTop: 8 }} />
          <SkeletonLoader height={14} style={{ width: '70%', marginTop: 6 }} />
          <SkeletonLoader height={14} style={{ width: '50%', marginTop: 6 }} />
        </View>
      </SafeAreaView>
    );
  }

  if (!loading && !product) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          title="Product not found"
          message="The product you're looking for doesn't exist or has been removed."
          onRetry={() => router.back()}
          retryLabel="Go Back"
        />
      </SafeAreaView>
    );
  }

  const isSaved = savedItems?.includes?.(product.id) ?? false;
  const isInCart = cartItems?.some?.(item => item.productId === product.id) ?? false;
  const similarProducts = products
    .filter((p: any) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const handleSave = () => {
    if (isSaved) {
      unsaveProduct(product.id);
    } else {
      saveProduct(product.id);
    }
  };

  const handleAddToCart = () => {
    if (isInCart) {
      removeFromCart(product.id);
    } else {
      addToCart(product.id, 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setShareOpen(true)}>
            <Ionicons name="share-outline" size={24} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleSave}>
            <Ionicons 
              name={isSaved ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color="#111827" 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.images[selectedImageIndex] || product.images[0] }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          
          {/* Condition Badge */}
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>
              {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
            </Text>
          </View>

          {/* Image Gallery */}
          {product.images.length > 1 && (
            <View style={styles.imageGallery}>
              <FlatList
                data={product.images}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.galleryThumb,
                      selectedImageIndex === index && styles.galleryThumbActive,
                    ]}
                    onPress={() => setSelectedImageIndex(index)}
                  >
                    <Image source={{ uri: item }} style={styles.galleryThumbImage} />
                  </TouchableOpacity>
                )}
                keyExtractor={(_, index) => index.toString()}
                contentContainerStyle={styles.galleryContent}
              />
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          {/* Title and Price */}
          <View style={styles.titleSection}>
            <Text style={styles.productTitle}>{product.name}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatCurrency(product.price, 'GHS')}</Text>
              {product.originalPrice && (
                <Text style={styles.originalPrice}>
                  {formatCurrency(product.originalPrice, 'GHS')}
                </Text>
              )}
            </View>
            <View style={styles.badgesRow}>
              <View style={styles.sizeBadge}>
                <Text style={styles.sizeBadgeText}>Size {product.size}</Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{product.category}</Text>
              </View>
            </View>
          </View>

          {/* Seller Info */}
          <View style={styles.sellerCard}>
            <Text style={styles.sellerCardTitle}>Seller Information</Text>
            <View style={styles.sellerInfo}>
              <View style={styles.sellerDetails}>
                <Avatar uri={product.seller.avatar} size={48} />
                <View style={styles.sellerText}>
                  <View style={styles.sellerNameRow}>
                    <Text style={styles.sellerName}>{product.seller.name}</Text>
                    {product.seller.rating && (
                      <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                    )}
                  </View>
                  <Text style={styles.sellerFaculty}>{product.seller.faculty || 'Student'}</Text>
                  <View style={styles.sellerStats}>
                    {product.seller.rating && (
                      <View style={styles.sellerStat}>
                        <Ionicons name="star" size={12} color="#F59E0B" />
                        <Text style={styles.sellerStatText}>{product.seller.rating}</Text>
                      </View>
                    )}
                    {product.seller.itemsSold && (
                      <View style={styles.sellerStat}>
                        <Ionicons name="cube" size={12} color="#6B7280" />
                        <Text style={styles.sellerStatText}>{product.seller.itemsSold} sold</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.sellerActions}>
                <Button
                  title="View Profile"
                  onPress={() => {}}
                  variant="outline"
                  size="small"
                  style={styles.sellerButton}
                />
                <Button
                  title="Message"
                  onPress={() => {}}
                  variant="primary"
                  size="small"
                  style={styles.sellerButton}
                />
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              {product.description || 'No description provided.'}
            </Text>
          </View>

          {/* Item Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Item Details</Text>
            <View style={styles.detailsGrid}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Brand:</Text>
                <Text style={styles.detailValue}>{product.brand || 'Unbranded'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Size:</Text>
                <Text style={styles.detailValue}>{product.size}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Condition:</Text>
                <Text style={styles.detailValue}>
                  {product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category:</Text>
                <Text style={styles.detailValue}>{product.category}</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="heart" size={14} color="#6B7280" />
              <Text style={styles.statText}>{product.stats.likes} likes</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="eye" size={14} color="#6B7280" />
              <Text style={styles.statText}>{product.stats.views} views</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="bookmark" size={14} color="#6B7280" />
              <Text style={styles.statText}>{product.stats.saves} saved</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title={isSaved ? 'Saved' : 'Save'}
              onPress={handleSave}
              variant="outline"
              size="large"
              leftIcon={
                <Ionicons 
                  name={isSaved ? "bookmark" : "bookmark-outline"} 
                  size={16} 
                  color={isSaved ? theme.colors.primary : "#374151"} 
                />
              }
              style={styles.saveButton}
            />
            <Button
              title={isInCart ? 'In Cart' : 'Add to Cart'}
              onPress={handleAddToCart}
              variant="primary"
              size="large"
              leftIcon={
                <Ionicons 
                  name={isInCart ? "checkmark" : "cart"} 
                  size={16} 
                  color="white" 
                />
              }
              style={styles.cartButton}
            />
          </View>

          {/* Similar Items */}
          {similarProducts.length > 0 && (
            <View style={styles.similarSection}>
              <View style={styles.similarHeader}>
                <Text style={styles.sectionTitle}>Similar Items</Text>
                <TouchableOpacity
                  onPress={() => router.push(`/similar-items?productId=${product.id}` as any)}
                >
                  <Text style={styles.viewAllText}>View All →</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={similarProducts}
                numColumns={2}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.similarItem}
                    onPress={() => router.push(`/product/${item.id}` as any)}
                  >
                    <Image source={{ uri: item.images[0] }} style={styles.similarImage} />
                    <View style={styles.similarInfo}>
                      <Text style={styles.similarName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View style={styles.similarPriceRow}>
                        <Text style={styles.similarPrice}>
                          {formatCurrency(item.price, 'GHS')}
                        </Text>
                        <Text style={styles.similarSize}>Size {item.size}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: theme.spacing[3] }} />}
                columnWrapperStyle={styles.similarRow}
              />
            </View>
          )}
        </View>
      </ScrollView>
      {/* Share Sheet */}
      <ShareSheet
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        title={product.name}
        url={`https://raved.app/product/${product.id}`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  headerButton: {
    padding: theme.spacing[1],
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: '#F3F4F6',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  conditionBadge: {
    position: 'absolute',
    top: theme.spacing[4],
    left: theme.spacing[4],
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.full,
  },
  conditionText: {
    color: 'white',
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.medium,
  },
  imageGallery: {
    position: 'absolute',
    bottom: theme.spacing[4],
    left: 0,
    right: 0,
  },
  galleryContent: {
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[2],
  },
  galleryThumb: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.base,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  galleryThumbActive: {
    borderColor: theme.colors.primary,
  },
  galleryThumbImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  titleSection: {
    gap: theme.spacing[2],
  },
  productTitle: {
    fontSize: theme.typography.fontSize[24],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  price: {
    fontSize: theme.typography.fontSize[30],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  originalPrice: {
    fontSize: theme.typography.fontSize[16],
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  badgesRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  sizeBadge: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    backgroundColor: '#F3F4F6',
    borderRadius: theme.borderRadius.full,
  },
  sizeBadgeText: {
    fontSize: theme.typography.fontSize[12],
    color: '#374151',
  },
  categoryBadge: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    backgroundColor: '#DBEAFE',
    borderRadius: theme.borderRadius.full,
  },
  categoryBadgeText: {
    fontSize: theme.typography.fontSize[12],
    color: '#1E40AF',
  },
  sellerCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  sellerCardTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
  },
  sellerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sellerDetails: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    flex: 1,
  },
  sellerText: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  sellerName: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#111827',
  },
  sellerFaculty: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
    marginTop: 2,
  },
  sellerStats: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginTop: theme.spacing[1],
  },
  sellerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sellerStatText: {
    fontSize: theme.typography.fontSize[10],
    color: '#6B7280',
  },
  sellerActions: {
    gap: theme.spacing[2],
  },
  sellerButton: {
    minWidth: 100,
  },
  descriptionSection: {
    gap: theme.spacing[2],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
  },
  descriptionText: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  detailsGrid: {
    gap: theme.spacing[2],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  detailValue: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#111827',
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginTop: theme.spacing[2],
  },
  saveButton: {
    minWidth: 100,
  },
  cartButton: {
    flex: 1,
  },
  similarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[3],
  },
  viewAllText: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
  },
  similarSection: {
    marginTop: theme.spacing[4],
    gap: theme.spacing[3],
  },
  similarRow: {
    justifyContent: 'space-between',
  },
  similarItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  similarImage: {
    width: '100%',
    aspectRatio: 1,
  },
  similarInfo: {
    padding: theme.spacing[2],
  },
  similarName: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#111827',
    marginBottom: 4,
  },
  similarPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  similarPrice: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  similarSize: {
    fontSize: theme.typography.fontSize[10],
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[8],
    gap: theme.spacing[3],
  },
  emptyText: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
  },
  backButton: {
    marginTop: theme.spacing[2],
  },
});


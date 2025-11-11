import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { StoreItem } from '../../types';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';

interface ProductCardProps {
  product: StoreItem;
  onSave?: () => void;
  onAddToCart?: () => void;
  isSaved?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSave,
  onAddToCart,
  isSaved = false,
}) => {
  const router = useRouter();
  const discount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = discount && product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/product/${product.id}` as any)}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Discount Badge */}
        {discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercent}%</Text>
          </View>
        )}

        {/* Condition Badge */}
        <View style={styles.conditionBadge}>
          <Text style={styles.conditionText}>{product.condition}</Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={(e) => {
            e.stopPropagation();
            onSave?.();
          }}
        >
          <Ionicons 
            name={isSaved ? "bookmark" : "bookmark-outline"} 
            size={18} 
            color={isSaved ? theme.colors.accent : "white"} 
          />
        </TouchableOpacity>

        {/* Quick Add Button */}
        <TouchableOpacity 
          style={styles.quickAddButton}
          onPress={(e) => {
            e.stopPropagation();
            onAddToCart?.();
          }}
        >
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Product Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(product.price, 'GHS')}</Text>
          {discount && (
            <Text style={styles.originalPrice}>
              {formatCurrency(product.originalPrice!, 'GHS')}
            </Text>
          )}
        </View>

        {/* Seller Info */}
        <View style={styles.sellerInfo}>
          <Image
            source={{ uri: product.seller.avatar }}
            style={styles.sellerAvatar}
          />
          <Text style={styles.sellerName} numberOfLines={1}>
            {product.seller.name}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name="heart" size={12} color="#6B7280" />
            <Text style={styles.statText}>{product.likesCount || product.stats?.likes || 0}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="eye" size={12} color="#6B7280" />
            <Text style={styles.statText}>{product.viewsCount || product.stats?.views || 0}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: theme.spacing[3],
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: theme.spacing[2],
    left: theme.spacing[2],
    backgroundColor: '#EF4444',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 4,
    borderRadius: theme.borderRadius.base,
  },
  discountText: {
    color: 'white',
    fontSize: theme.typography.fontSize[10],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  conditionBadge: {
    position: 'absolute',
    bottom: theme.spacing[2],
    left: theme.spacing[2],
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 4,
    borderRadius: theme.borderRadius.base,
  },
  conditionText: {
    color: 'white',
    fontSize: theme.typography.fontSize[10],
    fontWeight: theme.typography.fontWeight.medium,
  },
  saveButton: {
    position: 'absolute',
    top: theme.spacing[2],
    right: theme.spacing[2],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAddButton: {
    position: 'absolute',
    bottom: theme.spacing[2],
    right: theme.spacing[2],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    padding: theme.spacing[3],
  },
  name: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    marginBottom: theme.spacing[2],
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  price: {
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.primary,
  },
  originalPrice: {
    fontSize: theme.typography.fontSize[12],
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1.5],
    marginBottom: theme.spacing[2],
  },
  sellerAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  sellerName: {
    fontSize: theme.typography.fontSize[11],
    color: '#6B7280',
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: theme.typography.fontSize[11],
    color: '#6B7280',
  },
});


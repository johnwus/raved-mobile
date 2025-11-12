import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useStoreStore } from '../store/storeStore';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

export default function CartScreen() {
  const router = useRouter();
  const { cart, products, removeFromCart, updateCartQuantity, isLoading } = useStoreStore();

  console.log('Cart items:', cart);
  console.log('Products:', products);

  const cartItems = cart.map(cartItem => {
    const product = products.find(p => p.id === cartItem.productId);
    console.log('Cart item:', cartItem, 'Product found:', product);
    return { ...cartItem, product };
  }).filter(item => item.product);

  const subtotal = cartItems.reduce((sum, item) => 
    sum + (item.product!.price * item.quantity), 0
  );
  const deliveryFee = 0; // Free delivery
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (cartItems.length > 0 && !isLoading) {
      router.push('/checkout');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Shopping Cart</Text>
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {cartItems.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          subtitle="Add items from the store to get started"
          actionLabel="Browse Store"
          onAction={() => router.push('/store' as any)}
        />
      ) : (
        <>
          <ScrollView style={styles.content}>
            {cartItems.map((item) => (
              <View key={item.productId} style={styles.cartItem}>
                <Image
                  source={{ uri: item.product!.images[0] }}
                  style={styles.cartItemImage}
                />
                <View style={styles.cartItemDetails}>
                  <Text style={styles.cartItemName} numberOfLines={2}>
                    {item.product!.name}
                  </Text>
                  <Text style={styles.cartItemMeta}>
                    Size: {item.product!.size} • {item.product!.condition}
                  </Text>
                  <Text style={styles.cartItemPrice}>
                    {formatCurrency(item.product!.price, 'GHS')}
                  </Text>
                </View>
                <View style={styles.cartItemActions}>
                  <View style={styles.quantityControls}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => {
                        if (item.quantity > 1) {
                          updateCartQuantity(item.productId, item.quantity - 1);
                        } else {
                          removeFromCart(item.productId);
                        }
                      }}
                    >
                      <Ionicons name="remove" size={16} color="#374151" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateCartQuantity(item.productId, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={16} color="#374151" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromCart(item.productId)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{formatCurrency(total, 'GHS')}</Text>
            </View>
            <Button
              title={isLoading ? "Processing..." : "💳 Proceed to Checkout"}
              onPress={handleCheckout}
              variant="primary"
              size="large"
              style={styles.checkoutButton}
              disabled={isLoading}
            />
          </View>
        </>
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  title: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  cartBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[8],
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },
  browseButton: {
    minWidth: 200,
  },
  content: {
    flex: 1,
    padding: theme.spacing[4],
  },
  cartItem: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    padding: theme.spacing[3],
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing[3],
  },
  cartItemImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.base,
  },
  cartItemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cartItemName: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    marginBottom: 4,
  },
  cartItemMeta: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.primary,
  },
  cartItemActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    backgroundColor: '#F3F4F6',
    borderRadius: theme.borderRadius.base,
    padding: theme.spacing[1],
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    minWidth: 24,
    textAlign: 'center',
    color: '#111827',
  },
  removeButton: {
    padding: theme.spacing[1],
  },
  footer: {
    padding: theme.spacing[4],
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: theme.spacing[3],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  totalAmount: {
    fontSize: theme.typography.fontSize[24],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.primary,
  },
  checkoutButton: {
    width: '100%',
  },
});


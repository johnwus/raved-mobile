import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { useStoreStore } from '../store/storeStore';
import { formatCurrency } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { storeApi } from '../services/storeApi';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, products, clearCart } = useStoreStore();
  
  const [deliveryMethod, setDeliveryMethod] = useState<'campus' | 'hostel'>('campus');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [buyerPhone, setBuyerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [momoPhone, setMomoPhone] = useState('');
  const [momoNetwork, _setMomoNetwork] = useState('mtn');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cartItems = cart.map(cartItem => {
    const product = products.find(p => p.id === cartItem.productId);
    return { ...cartItem, product };
  }).filter(item => item.product);

  const subtotal = cartItems.reduce((sum, item) => 
    sum + (item.product!.price * item.quantity), 0
  );
  const deliveryFee = deliveryMethod === 'hostel' ? 5.00 : 0;
  const total = subtotal + deliveryFee;

  const isFormValid = buyerPhone && paymentMethod && (deliveryMethod === 'campus' || address);

  const handlePlaceOrder = async () => {
    if (!isFormValid || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const checkoutData = {
        items: cart.filter(item => item.productId).map(item => ({ productId: item.productId!, quantity: item.quantity })),
        deliveryMethod,
        paymentMethod: paymentMethod as 'momo' | 'cash',
        buyerPhone,
        address: deliveryMethod === 'hostel' ? address : undefined,
        momoPhone: paymentMethod === 'momo' ? momoPhone : undefined,
        momoNetwork: paymentMethod === 'momo' ? momoNetwork : undefined,
      };

      if (paymentMethod === 'momo') {
        // Initialize Paystack payment
        const paymentResponse = await storeApi.initializePayment(checkoutData);

        Alert.alert(
          'Payment Initialized',
          `Redirecting to Paystack for payment of ${formatCurrency(total, 'GHS')}.`,
          [
            {
              text: 'Proceed to Payment',
              onPress: () => {
                // In a real app, you'd open the Paystack URL or use their SDK
                console.log('Payment URL:', paymentResponse.authorization_url);
                // For now, simulate successful payment
                handlePaymentSuccess();
              },
            },
          ]
        );
      } else {
        // Cash on delivery - place order directly
        Alert.alert(
          'Order Placed! 🎉',
          `Your order of ${formatCurrency(total, 'GHS')} has been placed successfully. Pay on delivery.`,
          [
            {
              text: 'OK',
              onPress: () => {
                clearCart();
                router.replace('/(tabs)');
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to process checkout. Please try again.';
      setError(errorMessage);
      Alert.alert('Checkout Failed', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    router.replace('/(tabs)');
    Alert.alert('Payment Successful!', 'Your order has been placed successfully.');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Order Summary</Text>
          {cartItems.map((item) => (
            <View key={item.productId} style={styles.checkoutItem}>
              <Image 
                source={{ uri: item.product!.images[0] }} 
                style={styles.checkoutItemImage} 
              />
              <View style={styles.checkoutItemInfo}>
                <Text style={styles.checkoutItemName} numberOfLines={1}>
                  {item.product!.name}
                </Text>
                <Text style={styles.checkoutItemMeta}>
                  Size: {item.product!.size} • {item.product!.condition}
                </Text>
                <Text style={styles.checkoutItemSeller}>
                  Seller: {item.product!.seller.name}
                </Text>
              </View>
              <View style={styles.checkoutItemPricing}>
                <Text style={styles.checkoutItemPrice}>
                  {formatCurrency(item.product!.price, 'GHS')}
                </Text>
                <Text style={styles.checkoutItemQty}>Qty: {item.quantity}</Text>
              </View>
            </View>
          ))}
          
          {/* Totals */}
          <View style={styles.totalsCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>Subtotal</Text>
              <Text style={styles.totalRowValue}>{formatCurrency(subtotal, 'GHS')}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>Delivery Fee</Text>
              <Text style={[styles.totalRowValue, styles.freeText]}>
                {deliveryFee === 0 ? 'Free' : formatCurrency(deliveryFee, 'GHS')}
              </Text>
            </View>
            <View style={[styles.totalRow, styles.finalTotal]}>
              <Text style={styles.finalTotalLabel}>Total</Text>
              <Text style={styles.finalTotalValue}>{formatCurrency(total, 'GHS')}</Text>
            </View>
          </View>
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Delivery Information</Text>
          
          <Text style={styles.inputLabel}>Delivery Method</Text>
          <View style={styles.deliveryMethods}>
            <TouchableOpacity
              style={[
                styles.deliveryOption,
                deliveryMethod === 'campus' && styles.deliveryOptionActive
              ]}
              onPress={() => setDeliveryMethod('campus')}
            >
              <View style={styles.deliveryOptionContent}>
                <View style={styles.radioButton}>
                  {deliveryMethod === 'campus' && <View style={styles.radioButtonInner} />}
                </View>
                <View style={styles.deliveryOptionText}>
                  <Text style={styles.deliveryOptionTitle}>Campus Pickup</Text>
                  <Text style={styles.deliveryOptionDesc}>Meet at agreed campus location</Text>
                </View>
                <Text style={styles.deliveryFree}>Free</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deliveryOption,
                deliveryMethod === 'hostel' && styles.deliveryOptionActive
              ]}
              onPress={() => setDeliveryMethod('hostel')}
            >
              <View style={styles.deliveryOptionContent}>
                <View style={styles.radioButton}>
                  {deliveryMethod === 'hostel' && <View style={styles.radioButtonInner} />}
                </View>
                <View style={styles.deliveryOptionText}>
                  <Text style={styles.deliveryOptionTitle}>Hostel Delivery</Text>
                  <Text style={styles.deliveryOptionDesc}>Delivery to your hostel</Text>
                </View>
                <Text style={styles.deliveryPrice}>₵5.00</Text>
              </View>
            </TouchableOpacity>
          </View>

          {deliveryMethod === 'hostel' && (
            <Input
              label="Delivery Address"
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your hostel name and room number..."
              multiline
              numberOfLines={2}
              style={styles.inputGroup}
            />
          )}

          <Input
            label="Phone Number *"
            value={buyerPhone}
            onChangeText={setBuyerPhone}
            placeholder="0241234567"
            keyboardType="phone-pad"
            style={styles.inputGroup}
          />
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment Method</Text>
          
          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'momo' && styles.paymentOptionActive
            ]}
            onPress={() => setPaymentMethod('momo')}
          >
            <View style={[styles.paymentIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.paymentIcon}>📱</Text>
            </View>
            <View style={styles.paymentOptionText}>
              <Text style={styles.paymentOptionTitle}>Mobile Money</Text>
              <Text style={styles.paymentOptionDesc}>MTN, Vodafone, AirtelTigo</Text>
            </View>
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentBadgeText}>Instant</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              paymentMethod === 'cash' && styles.paymentOptionActive
            ]}
            onPress={() => setPaymentMethod('cash')}
          >
            <View style={[styles.paymentIconCircle, { backgroundColor: '#D1FAE5' }]}>
              <Text style={styles.paymentIcon}>💵</Text>
            </View>
            <View style={styles.paymentOptionText}>
              <Text style={styles.paymentOptionTitle}>Cash on Delivery</Text>
              <Text style={styles.paymentOptionDesc}>Pay when you receive items</Text>
            </View>
            <View style={[styles.paymentBadge, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.paymentBadgeText, { color: '#1E40AF' }]}>Secure</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Mobile Money Details */}
        {paymentMethod === 'momo' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mobile Money Details</Text>
            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Network</Text>
                <View style={styles.pickerContainer}>
                  <TouchableOpacity style={styles.picker}>
                    <Text style={styles.pickerText}>
                      {momoNetwork === 'mtn' ? 'MTN' : momoNetwork === 'vodafone' ? 'Vodafone' : 'AirtelTigo'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Input
                  label="Phone Number"
                  value={momoPhone}
                  onChangeText={setMomoPhone}
                  placeholder="0241234567"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={styles.errorNotice}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.errorText}>
              {error}
            </Text>
          </View>
        )}

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Ionicons name="shield-checkmark" size={20} color={theme.colors.success} />
          <Text style={styles.securityText}>
            Your payment information is secure and encrypted
          </Text>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <Button
          title={isProcessing ? "Processing..." : "🛍️ Place Order"}
          onPress={handlePlaceOrder}
          variant="primary"
          size="large"
          style={styles.placeOrderButton}
          disabled={!isFormValid || isProcessing}
        />
      </View>
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
  title: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  checkoutItem: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    padding: theme.spacing[3],
    backgroundColor: '#F9FAFB',
    borderRadius: theme.borderRadius.xl,
  },
  checkoutItemImage: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.base,
  },
  checkoutItemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  checkoutItemName: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
  },
  checkoutItemMeta: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  checkoutItemSeller: {
    fontSize: theme.typography.fontSize[11],
    color: '#9CA3AF',
  },
  checkoutItemPricing: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  checkoutItemPrice: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
  },
  checkoutItemQty: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  totalsCard: {
    marginTop: theme.spacing[2],
    padding: theme.spacing[4],
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: theme.spacing[3],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRowLabel: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
  },
  totalRowValue: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
  },
  freeText: {
    color: theme.colors.success,
  },
  finalTotal: {
    paddingTop: theme.spacing[3],
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  finalTotalLabel: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  finalTotalValue: {
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.primary,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#374151',
    marginBottom: theme.spacing[2],
  },
  inputGroup: {
    marginBottom: theme.spacing[3],
  },
  inputRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  deliveryMethods: {
    gap: theme.spacing[3],
  },
  deliveryOption: {
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  deliveryOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}0D`,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  deliveryOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  deliveryOptionText: {
    flex: 1,
  },
  deliveryOptionTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    marginBottom: 2,
  },
  deliveryOptionDesc: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  deliveryFree: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.success,
  },
  deliveryPrice: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginBottom: theme.spacing[3],
    gap: theme.spacing[3],
  },
  paymentOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}0D`,
  },
  paymentIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentIcon: {
    fontSize: 24,
  },
  paymentOptionText: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    marginBottom: 2,
  },
  paymentOptionDesc: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  paymentBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 4,
    borderRadius: theme.borderRadius.base,
  },
  paymentBadgeText: {
    fontSize: theme.typography.fontSize[10],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#92400E',
  },
  pickerContainer: {
    marginTop: theme.spacing[2],
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: theme.borderRadius.xl,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    backgroundColor: '#FFFFFF',
  },
  pickerText: {
    fontSize: theme.typography.fontSize[14],
    color: '#111827',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: theme.spacing[4],
    backgroundColor: '#DCFCE7',
    borderRadius: theme.borderRadius.xl,
    margin: theme.spacing[4],
  },
  securityText: {
    flex: 1,
    fontSize: theme.typography.fontSize[12],
    color: '#166534',
    lineHeight: 16,
  },
  footer: {
    padding: theme.spacing[4],
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  placeOrderButton: {
    width: '100%',
  },
  errorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: theme.spacing[4],
    backgroundColor: '#FEE2E2',
    borderRadius: theme.borderRadius.xl,
    margin: theme.spacing[4],
  },
  errorText: {
    flex: 1,
    fontSize: theme.typography.fontSize[12],
    color: '#DC2626',
    lineHeight: 16,
  },
});


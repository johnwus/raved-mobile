import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { Button } from '../components/ui/Button';
import { useStore } from '../hooks/useStore';

const premiumFeatures = [
  {
    icon: 'trophy',
    title: 'Monthly Rankings',
    description: 'Compete for top spots and win cash prizes',
    colors: ['#A855F7', '#EC4899'],
  },
  {
    icon: 'star',
    title: 'Weekly Features',
    description: 'Get featured on the main page',
    colors: ['#3B82F6', '#06B6D4'],
  },
  {
    icon: 'bar-chart',
    title: 'Advanced Analytics',
    description: 'Detailed insights on your posts and engagement',
    colors: ['#10B981', '#059669'],
  },
  {
    icon: 'color-palette',
    title: 'Premium Themes',
    description: 'Exclusive app themes and customization',
    colors: ['#6366F1', '#8B5CF6'],
  },
  {
    icon: 'flash',
    title: 'Priority Support',
    description: 'Get help faster with premium support',
    colors: ['#F43F5E', '#EC4899'],
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { isPremium } = useStore();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const trialDaysLeft = 6;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handle} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Raved Premium</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.crownIcon}>
              <Ionicons name="diamond" size={20} color="white" />
            </View>
            <View style={styles.statusText}>
              <Text style={styles.statusTitle}>Free Trial</Text>
              <Text style={styles.statusSubtitle}>{trialDaysLeft} days remaining</Text>
            </View>
          </View>
          <Text style={styles.statusDescription}>
            Upgrade to Premium to unlock all features and join the rankings!
          </Text>
        </View>

        {/* Premium Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>✨ Premium Features</Text>
          {premiumFeatures.map((feature, index) => (
            <View key={index} style={[styles.featureCard, { backgroundColor: `${feature.colors[0]}20` }]}>
              <View style={[styles.featureIcon, { backgroundColor: feature.colors[0] }]}>
                <Ionicons name={feature.icon as any} size={16} color="white" />
              </View>
              <View style={styles.featureContent}>
                <Text style={[styles.featureTitle, { color: feature.colors[0] }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: `${feature.colors[0]}CC` }]}>
                  {feature.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>💰 Pricing</Text>
          <View style={styles.pricingCard}>
            <Text style={styles.pricingAmount}>₵5.00</Text>
            <Text style={styles.pricingPeriod}>per week</Text>
            <Text style={styles.pricingDescription}>Unlock all premium features</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>💳 Payment Methods</Text>
          <TouchableOpacity
            style={[
              styles.paymentMethod,
              selectedPayment === 'momo' && styles.paymentMethodActive,
            ]}
            onPress={() => setSelectedPayment('momo')}
          >
            <View style={styles.paymentIcon}>
              <Ionicons name="phone-portrait" size={24} color="white" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Mobile Money</Text>
              <Text style={styles.paymentSubtitle}>MTN, Vodafone, AirtelTigo</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentMethod,
              selectedPayment === 'card' && styles.paymentMethodActive,
            ]}
            onPress={() => setSelectedPayment('card')}
          >
            <View style={[styles.paymentIcon, { backgroundColor: '#6366F1' }]}>
              <Ionicons name="card" size={24} color="white" />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Debit/Credit Card</Text>
              <Text style={styles.paymentSubtitle}>Visa, Mastercard</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Subscribe Button */}
        <Button
          title="Subscribe to Premium"
          onPress={() => {}}
          variant="primary"
          size="large"
          leftIcon={<Ionicons name="diamond" size={16} color="white" />}
          style={styles.subscribeButton}
        />

        {/* Free Features Info */}
        <View style={styles.limitationsCard}>
          <Text style={styles.limitationsTitle}>Free Account Limitations:</Text>
          <View style={styles.limitationsList}>
            <Text style={styles.limitationItem}>• Basic posting and following</Text>
            <Text style={styles.limitationItem}>• Limited to 5 store items</Text>
            <Text style={styles.limitationItem}>• No ranking participation</Text>
            <Text style={styles.limitationItem}>• No weekly features</Text>
            <Text style={styles.limitationItem}>• Basic analytics only</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing[2],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
  },
  headerTitle: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing[4],
  },
  statusCard: {
    backgroundColor: '#FEF9C3',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: theme.spacing[6],
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[3],
  },
  crownIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#92400E',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: theme.typography.fontSize[12],
    color: '#A16207',
  },
  statusDescription: {
    fontSize: theme.typography.fontSize[12],
    color: '#92400E',
  },
  featuresSection: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
    marginBottom: theme.spacing[4],
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing[3],
    gap: theme.spacing[3],
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: theme.typography.fontSize[12],
  },
  pricingSection: {
    marginBottom: theme.spacing[6],
  },
  pricingCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[6],
    alignItems: 'center',
  },
  pricingAmount: {
    fontSize: theme.typography.fontSize[30],
    fontWeight: theme.typography.fontWeight.bold,
    color: 'white',
    marginBottom: theme.spacing[2],
  },
  pricingPeriod: {
    fontSize: theme.typography.fontSize[18],
    color: 'white',
    marginBottom: theme.spacing[1],
  },
  pricingDescription: {
    fontSize: theme.typography.fontSize[12],
    color: 'rgba(255,255,255,0.8)',
  },
  paymentSection: {
    marginBottom: theme.spacing[6],
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: theme.spacing[3],
    gap: theme.spacing[3],
  },
  paymentMethodActive: {
    borderColor: theme.colors.primary,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  subscribeButton: {
    width: '100%',
    marginBottom: theme.spacing[6],
  },
  limitationsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[4],
  },
  limitationsTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    marginBottom: theme.spacing[2],
  },
  limitationsList: {
    gap: theme.spacing[1],
  },
  limitationItem: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
});


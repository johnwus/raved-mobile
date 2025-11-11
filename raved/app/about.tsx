import React from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handle} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>About Raved</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Info */}
        <View style={styles.appInfo}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.appIcon}
          >
            <Ionicons name="shirt" size={48} color="white" />
          </LinearGradient>
          <Text style={styles.appName}>Raved</Text>
          <Text style={styles.appTagline}>Campus Fashion Social Network</Text>
          <Text style={styles.appVersion}>Version 1.0.0 (Beta)</Text>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionText}>
            Raved is the premier social platform for university students to showcase their fashion sense, connect with peers, and discover the latest campus trends. Built specifically for the Ghanaian university community.
          </Text>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="camera" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Share your daily fashion looks</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="storefront" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Buy and sell fashion items</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="people" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Connect with campus communities</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trophy" size={20} color={theme.colors.primary} />
              <Text style={styles.featureText}>Compete in fashion rankings</Text>
            </View>
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
  },
  headerTitle: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  closeButton: {
    padding: theme.spacing[1],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[4],
    gap: theme.spacing[6],
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: theme.spacing[6],
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  appName: {
    fontSize: theme.typography.fontSize[24],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
    marginBottom: 4,
  },
  appTagline: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
    marginBottom: theme.spacing[2],
  },
  appVersion: {
    fontSize: theme.typography.fontSize[12],
    color: '#9CA3AF',
  },
  section: {
    backgroundColor: '#F9FAFB',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#374151',
    marginBottom: theme.spacing[2],
  },
  sectionText: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
    lineHeight: 20,
  },
  featuresList: {
    gap: theme.spacing[2],
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  featureText: {
    fontSize: theme.typography.fontSize[14],
    color: '#374151',
  },
});


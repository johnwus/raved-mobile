import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

export default function HelpScreen() {
  const router = useRouter();

  const handleFAQ = () => {
    Alert.alert('FAQ', 'Frequently Asked Questions coming soon!');
  };

  const handleUserGuide = () => {
    Alert.alert('User Guide', 'User Guide coming soon!');
  };

  const handleLiveChat = () => {
    Alert.alert('Live Chat', 'Live chat support coming soon!');
  };

  const handleEmail = () => {
    Alert.alert('Email Support', 'Email: support@raved.app');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handle} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Help & Support</Text>
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
        {/* Quick Help */}
        <View style={styles.quickHelpCard}>
          <View style={styles.quickHelpHeader}>
            <Ionicons name="help-circle" size={20} color="#2563EB" />
            <Text style={styles.quickHelpTitle}>Quick Help</Text>
          </View>
          
          <TouchableOpacity style={styles.helpOption} onPress={handleFAQ}>
            <View style={styles.helpOptionLeft}>
              <Ionicons name="help-circle-outline" size={20} color="#2563EB" />
              <Text style={styles.helpOptionText}>Frequently Asked Questions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.helpOption} onPress={handleUserGuide}>
            <View style={styles.helpOptionLeft}>
              <Ionicons name="book-outline" size={20} color="#2563EB" />
              <Text style={styles.helpOptionText}>User Guide</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          
          <TouchableOpacity style={styles.supportOption} onPress={handleLiveChat}>
            <View style={styles.supportOptionLeft}>
              <Ionicons name="chatbubbles" size={20} color="#16A34A" />
              <View>
                <Text style={styles.supportOptionTitle}>Live Chat</Text>
                <Text style={styles.supportOptionDesc}>Get instant help</Text>
              </View>
            </View>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportOption} onPress={handleEmail}>
            <View style={styles.supportOptionLeft}>
              <Ionicons name="mail" size={20} color="#2563EB" />
              <View>
                <Text style={styles.supportOptionTitle}>Email Support</Text>
                <Text style={styles.supportOptionDesc}>support@raved.app</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
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
    gap: theme.spacing[4],
  },
  quickHelpCard: {
    backgroundColor: '#EFF6FF',
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: theme.spacing[3],
  },
  quickHelpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  quickHelpTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#1E40AF',
  },
  helpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
  },
  helpOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
  },
  helpOptionText: {
    fontSize: theme.typography.fontSize[14],
    color: '#374151',
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
  supportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
  },
  supportOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    flex: 1,
  },
  supportOptionTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#111827',
    marginBottom: 2,
  },
  supportOptionDesc: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: theme.typography.fontSize[12],
    color: '#059669',
  },
});


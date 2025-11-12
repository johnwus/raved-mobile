import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  AppState,
  AppStateStatus,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomSheet } from '../ui/BottomSheet';
import { theme } from '../../theme';
import { useStore } from '../../hooks/useStore';
import { useAuth } from '../../hooks/useAuth';
import { usePathname, useRouter } from 'expo-router';
import { getCartCount, getPendingConnectionRequestsCount, getUnreadMessagesCount } from '../../services/api';

interface MoreSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const MoreSheet: React.FC<MoreSheetProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isPremium } = useStore();
  const { logout } = useAuth();

  const [cartCount, setCartCount] = React.useState<number>(0);
  const [connectionsCount, setConnectionsCount] = React.useState<number>(0);
  const [messagesCount, setMessagesCount] = React.useState<number>(0);

  const refreshCounts = React.useCallback(async () => {
    try {
      const [c, conn, msg] = await Promise.all([
        getCartCount().catch(() => 0),
        getPendingConnectionRequestsCount().catch(() => 0),
        getUnreadMessagesCount().catch(() => 0),
      ]);
      setCartCount(c);
      setConnectionsCount(conn);
      setMessagesCount(msg);
    } catch {
      // keep current counts
    }
  }, []);

  const handleNavigate = (path: string) => {
    onClose();
    setTimeout(() => {
      router.push(path as any);
    }, 300);
  };

  const handleLogout = () => {
    onClose();
    logout();
    router.replace('/(auth)/login');
  };

  // Refresh counts when sheet opens, when route changes, and on app foreground
  React.useEffect(() => {
    if (visible) refreshCounts();
  }, [visible, refreshCounts]);

  React.useEffect(() => {
    if (visible) refreshCounts();
  }, [pathname, visible, refreshCounts]);

  React.useEffect(() => {
    const handler = (state: AppStateStatus) => {
      if (state === 'active' && visible) refreshCounts();
    };
    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();
  }, [visible, refreshCounts]);

  return (
    <BottomSheet visible={visible} onClose={onClose} height="100%" fullScreen allowOverlayDismiss={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Quick Actions</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Main Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={[styles.actionCard, styles.actionCardBlue]}
                onPress={() => handleNavigate('/chat')}
              >
                <View style={styles.badgeContainer}>
                  <Ionicons name="chatbubbles" size={32} color="#2563EB" />
                  {messagesCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{messagesCount > 99 ? '99+' : messagesCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.actionCardText, styles.actionCardTextBlue]}>
                  Messages
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, styles.actionCardPurple]}
                onPress={() => handleNavigate('/cart')}
              >
                <View style={styles.badgeContainer}>
                  <Ionicons name="cart" size={32} color="#9333EA" />
                  {cartCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.actionCardText, styles.actionCardTextPurple]}>
                  Cart
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, styles.actionCardYellow]}
                onPress={() => handleNavigate('/search')}
              >
                <Ionicons name="bookmark" size={32} color="#F59E0B" />
                <Text style={[styles.actionCardText, styles.actionCardTextYellow]}>
                  Bookmarks
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, styles.actionCardGreen]}
                onPress={() => handleNavigate('/connections')}
              >
                <View style={styles.badgeContainer}>
                  <Ionicons name="people" size={32} color="#16A34A" />
                  {connectionsCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{connectionsCount > 99 ? '99+' : connectionsCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.actionCardText, styles.actionCardTextGreen]}>
                  Connections
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, styles.actionCardIndigo]}
                onPress={() => handleNavigate('/(tabs)/faculties')}
              >
                <Ionicons name="school" size={32} color="#4F46E5" />
                <Text style={[styles.actionCardText, styles.actionCardTextIndigo]}>
                  Faculties
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Premium Features */}
          {isPremium ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Premium Features</Text>
              <View style={styles.premiumGrid}>
                <TouchableOpacity
                  style={[styles.premiumCard, styles.premiumCardOrange]}
                  onPress={() => handleNavigate('/rankings')}
                >
                  <Ionicons name="trophy" size={32} color="#F97316" />
                  <Text style={[styles.premiumCardText, styles.premiumCardTextOrange]}>
                    Rankings
                  </Text>
                  <Text style={styles.premiumCardSubtext}>₵150 Prize Pool</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.premiumCard, styles.premiumCardEmerald]}
                  onPress={() => handleNavigate('/seller-dashboard')}
                >
                  <Ionicons name="storefront" size={32} color="#10B981" />
                  <Text style={[styles.premiumCardText, styles.premiumCardTextEmerald]}>
                    My Store
                  </Text>
                  <Text style={styles.premiumCardSubtext}>Manage Items</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.section}>
              <View style={styles.premiumCTACard}>
                <View style={styles.premiumCTAIcon}>
                  <Ionicons name="star" size={24} color="white" />
                </View>
                <Text style={styles.premiumCTATitle}>Unlock Premium Features</Text>
                <Text style={styles.premiumCTASubtitle}>
                  Access rankings, seller dashboard, and more!
                </Text>
                <TouchableOpacity
                  style={styles.premiumCTAButton}
                  onPress={() => handleNavigate('/subscription')}
                >
                  <LinearGradient
                    colors={['#9333EA', '#EC4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.premiumCTAButtonGradient}
                  >
                    <Ionicons name="sparkles" size={16} color="white" />
                    <Text style={styles.premiumCTAButtonText}>Upgrade Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Other Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other</Text>
            <TouchableOpacity
              style={[styles.actionCard, styles.actionCardRed]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out" size={32} color="#EF4444" />
              <Text style={[styles.actionCardText, styles.actionCardTextRed]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  section: {
    gap: theme.spacing[3],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#374151',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  actionCard: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[4],
    gap: theme.spacing[2],
  },
  actionCardBlue: {
    backgroundColor: '#EFF6FF',
  },
  actionCardPurple: {
    backgroundColor: '#F3E8FF',
  },
  actionCardYellow: {
    backgroundColor: '#FEF3C7',
  },
  actionCardGreen: {
    backgroundColor: '#F0FDF4',
  },
  actionCardIndigo: {
    backgroundColor: '#EEF2FF',
  },
  actionCardRed: {
    backgroundColor: '#FEF2F2',
  },
  badgeContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  actionCardText: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  actionCardTextBlue: {
    color: '#1E40AF',
  },
  actionCardTextPurple: {
    color: '#6B21A8',
  },
  actionCardTextYellow: {
    color: '#92400E',
  },
  actionCardTextGreen: {
    color: '#166534',
  },
  actionCardTextIndigo: {
    color: '#312E81',
  },
  actionCardTextRed: {
    color: '#991B1B',
  },
  premiumGrid: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  premiumCard: {
    flex: 1,
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[4],
    alignItems: 'center',
    gap: theme.spacing[2],
    borderWidth: 1,
  },
  premiumCardOrange: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FED7AA',
  },
  premiumCardEmerald: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  premiumCardText: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'center',
  },
  premiumCardTextOrange: {
    color: '#9A3412',
  },
  premiumCardTextEmerald: {
    color: '#065F46',
  },
  premiumCardSubtext: {
    fontSize: theme.typography.fontSize[12],
    color: '#F97316',
  },
  premiumCTACard: {
    backgroundColor: '#FDF4FF',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3E8FF',
    gap: theme.spacing[3],
  },
  premiumCTAIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#9333EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumCTATitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#6B21A8',
    textAlign: 'center',
  },
  premiumCTASubtitle: {
    fontSize: theme.typography.fontSize[14],
    color: '#7C3AED',
    textAlign: 'center',
  },
  premiumCTAButton: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginTop: theme.spacing[2],
  },
  premiumCTAButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
  },
  premiumCTAButtonText: {
    color: 'white',
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
  },
});


import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, AppState, AppStateStatus } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, usePathname } from 'expo-router';
import { useStoreStore } from '../../store/storeStore';
import { getCartCount, getPendingConnectionRequestsCount, getUnreadMessagesCount } from '../../services/api';

interface FABProps {
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: readonly [string, string];
  badge?: number;
  onPress: () => void;
}

const FAB: React.FC<FABProps> = ({ icon, gradientColors, badge, onPress }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.1,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fab}
        >
          <Ionicons name={icon} size={18} color="white" />
          {badge !== undefined && badge > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const FloatingActionButtons: React.FC = () => {
  const router = useRouter();
  const { cart } = useStoreStore();

  // Start with local counts; hydrate with API
  const [cartCount, setCartCount] = React.useState<number>(cart.length);
  const [connectionsCount, setConnectionsCount] = React.useState<number>(0);
  const [messagesCount, setMessagesCount] = React.useState<number>(0);

  const pathname = usePathname();

  const refreshCounts = React.useCallback(async () => {
    try {
      const [cartC, connC, msgC] = await Promise.all([
        getCartCount().catch(() => cart.length),
        getPendingConnectionRequestsCount().catch(() => 0),
        getUnreadMessagesCount().catch(() => 0),
      ]);
      setCartCount(typeof cartC === 'number' ? cartC : cart.length);
      setConnectionsCount(connC);
      setMessagesCount(msgC);
    } catch {
      // ignore; keep defaults
    }
  }, [cart.length]);

  // On mount and when route changes
  React.useEffect(() => {
    refreshCounts();
  }, [refreshCounts, pathname]);

  // On app foreground
  React.useEffect(() => {
    const handler = (state: AppStateStatus) => {
      if (state === 'active') refreshCounts();
    };
    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();
  }, [refreshCounts]);

  return (
    <View style={styles.container}>
      <FAB
        icon="bag-handle"
        gradientColors={['#A855F7', '#EC4899'] as const} // purple-500 to pink-500
        badge={cartCount}
        onPress={() => router.push('/store' as any)}
      />
      <FAB
        icon="people"
        gradientColors={['#10B981', '#059669'] as const} // green-500 to emerald-500
        badge={connectionsCount}
        onPress={() => router.push('/connections' as any)}
      />
      <FAB
        icon="chatbubble"
        gradientColors={['#3B82F6', '#06B6D4'] as const} // blue-500 to cyan-500
        badge={messagesCount}
        onPress={() => router.push('/chat' as any)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // bottom-20 equivalent (20 * 4 = 80px from bottom)
    right: 16, // right-4 equivalent (4 * 4 = 16px)
    zIndex: 40,
    gap: 12, // space-y-3 equivalent (3 * 4 = 12px)
  },
  fab: {
    width: 56, // w-14 (14 * 4 = 56px)
    height: 56, // h-14
    borderRadius: 28, // rounded-full
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4, // -top-1
    right: -4, // -right-1
    backgroundColor: '#EF4444', // red-500
    width: 20, // w-5 (5 * 4 = 20px)
    height: 20, // h-5
    borderRadius: 10, // rounded-full
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: 'white',
    fontSize: 10, // text-xs
    fontWeight: '600',
  },
});


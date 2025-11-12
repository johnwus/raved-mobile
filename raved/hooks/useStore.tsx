import React, { useState, useContext, createContext, useEffect } from 'react';
import { StoreItem, CartItem } from '../types';
import { storeApi } from '../services/storeApi';
import { useAuth } from './useAuth';
import { subscriptionsApi } from '../services/subscriptionsApi';

interface StoreContextType {
  isPremium: boolean;
  cartItems: CartItem[];
  storeItems: StoreItem[];
  loading: boolean;
  addToCart: (item: StoreItem) => void;
  removeFromCart: (productId: string) => void;
  subscribeToPremium: (plan?: 'weekly' | 'monthly') => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      try {
        if (isAuthenticated) {
          // Fetch subscription status
          const status = await subscriptionsApi.getSubscriptionStatus();
          setIsPremium(!!status.isPremium);
          // Fetch store items
          const response = await storeApi.getStoreItems();
          setStoreItems(response.items || []);
        } else {
          setIsPremium(false);
          setStoreItems([]);
        }
      } catch (error) {
        console.error('Init store context failed:', error);
        setStoreItems([]);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [isAuthenticated]);

  const refreshSubscriptionStatus = async () => {
    try {
      const status = await subscriptionsApi.getSubscriptionStatus();
      setIsPremium(!!status.isPremium);
    } catch (e) {
      console.error('Failed to refresh subscription status:', e);
    }
  };

  const addToCart = (item: StoreItem) => {
    setCartItems(prev => {
      const existing = prev.find(cartItem => cartItem.productId === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.productId === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { productId: item.id, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const subscribeToPremium = async (plan: 'weekly' | 'monthly' = 'weekly') => {
    // Optimistically set premium true
    setIsPremium(true);
    try {
      await subscriptionsApi.upgrade(plan);
    } catch (error) {
      console.error('Upgrade failed, reverting premium flag', error);
      // Revert on failure
      setIsPremium(false);
      throw error;
    }
  };

  return (
    <StoreContext.Provider value={{
      isPremium,
      cartItems,
      storeItems,
      loading,
      addToCart,
      removeFromCart,
      subscribeToPremium,
      refreshSubscriptionStatus,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

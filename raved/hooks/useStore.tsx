import React, { useState, useContext, createContext, useEffect } from 'react';
import { StoreItem, CartItem } from '../types';
import { storeApi } from '../services/storeApi';
import { useAuth } from './useAuth';

interface StoreContextType {
  isPremium: boolean;
  cartItems: CartItem[];
  storeItems: StoreItem[];
  loading: boolean;
  addToCart: (item: StoreItem) => void;
  removeFromCart: (productId: string) => void;
  subscribeToPremium: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchStoreItems = async () => {
      setLoading(true);
      try {
        const response = await storeApi.getStoreItems();
        setStoreItems(response.items || []);
      } catch (error) {
        console.error('Failed to fetch store items:', error);
        setStoreItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStoreItems();
    } else {
      setStoreItems([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

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

  const subscribeToPremium = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsPremium(true);
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

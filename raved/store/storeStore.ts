import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoreItem, CartItem } from '../types';
import { Storage } from '../services/storage';
import { storeApi } from '../services/storeApi';

interface StoreState {
  products: StoreItem[];
  cart: CartItem[];
  savedItems: string[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  saveProduct: (productId: string) => void;
  unsaveProduct: (productId: string) => void;
  clearCart: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useStoreStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      cart: [],
      savedItems: [],
      isLoading: false,
      error: null,

      addToCart: async (productId, quantity = 1) => {
        try {
          set({ isLoading: true, error: null });
          await storeApi.addToCart(productId, quantity);

          // Update local state optimistically
          set((state) => {
            const existingItem = state.cart.find(item => item.productId === productId);
            if (existingItem) {
              return {
                cart: state.cart.map(item =>
                  item.productId === productId
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                ),
              };
            } else {
              return {
                cart: [...state.cart, { productId: productId, quantity }],
              };
            }
          });
        } catch (error: any) {
          set({ error: error.message || 'Failed to add item to cart' });
        } finally {
          set({ isLoading: false });
        }
      },

      removeFromCart: async (productId) => {
        try {
          set({ isLoading: true, error: null });
          // Find cart item ID from local state
          const cartItem = get().cart.find(item => item.productId === productId);
          if (cartItem && cartItem.id) {
            await storeApi.removeFromCart(cartItem.id);
          }

          // Update local state
          set((state) => ({
            cart: state.cart.filter(item => item.productId !== productId),
          }));
        } catch (error: any) {
          set({ error: error.message || 'Failed to remove item from cart' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateCartQuantity: async (productId, quantity) => {
        try {
          set({ isLoading: true, error: null });
          // Find cart item ID from local state
          const cartItem = get().cart.find(item => item.productId === productId);
          if (cartItem && cartItem.id) {
            await storeApi.updateCartItem(cartItem.id, quantity);
          }

          // Update local state
          set((state) => ({
            cart: state.cart.map(item =>
              item.productId === productId ? { ...item, quantity } : item
            ),
          }));
        } catch (error: any) {
          set({ error: error.message || 'Failed to update cart quantity' });
        } finally {
          set({ isLoading: false });
        }
      },

      saveProduct: (productId) => {
        set((state) => ({
          savedItems: [...state.savedItems, productId],
        }));
      },

      unsaveProduct: (productId) => {
        set((state) => ({
          savedItems: state.savedItems.filter(id => id !== productId),
        }));
      },

      clearCart: async () => {
        try {
          set({ isLoading: true, error: null });
          await storeApi.clearCart();
          set({ cart: [] });
        } catch (error: any) {
          set({ error: error.message || 'Failed to clear cart' });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchProducts: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await storeApi.getStoreItems();
          set({ products: response.items });
        } catch (error: any) {
          console.error('Fetch products error:', error);
          set({ error: error.response?.data?.error || error.message || 'Failed to fetch products' });
        } finally {
          set({ isLoading: false });
        }
      },

      setError: (error) => set({ error }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'raved-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cart: state.cart,
        savedItems: state.savedItems,
      }),
    }
  )
);


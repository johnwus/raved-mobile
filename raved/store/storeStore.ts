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
          // Refresh from server to get authoritative cartItem ids/quantities
          try {
            const data = await storeApi.getUserCart();
            const normalized = (data.items || []).map((ci: any) => ({
              id: ci.id || ci.cartItemId,
              productId: ci.product?.id || ci.productId,
              quantity: ci.quantity,
            }));
            set({ cart: normalized });
          } catch (e) {
            // Fallback optimistic update
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
          }
        } catch (error: any) {
          set({ error: error.message || 'Failed to add item to cart' });
        } finally {
          set({ isLoading: false });
        }
      },

      removeFromCart: async (productId) => {
        try {
          set({ isLoading: true, error: null });
          // Ensure we have latest cart ids
          let cartItem = get().cart.find(item => item.productId === productId);
          if (!cartItem) {
            const data = await storeApi.getUserCart();
            const normalized = (data.items || []).map((ci: any) => ({
              id: ci.id || ci.cartItemId,
              productId: ci.product?.id || ci.productId,
              quantity: ci.quantity,
            }));
            set({ cart: normalized });
            cartItem = normalized.find(i => i.productId === productId);
          }
          if (cartItem && cartItem.id) {
            await storeApi.removeFromCart(cartItem.id);
          }

          // Refresh cart from server
          const fresh = await storeApi.getUserCart();
          const normalizedFresh = (fresh.items || []).map((ci: any) => ({
            id: ci.id || ci.cartItemId,
            productId: ci.product?.id || ci.productId,
            quantity: ci.quantity,
          }));
          set({ cart: normalizedFresh });
        } catch (error: any) {
          set({ error: error.message || 'Failed to remove item from cart' });
        } finally {
          set({ isLoading: false });
        }
      },

      updateCartQuantity: async (productId, quantity) => {
        try {
          set({ isLoading: true, error: null });
          // Ensure we have latest cart ids
          let cartItem = get().cart.find(item => item.productId === productId);
          if (!cartItem) {
            const data = await storeApi.getUserCart();
            const normalized = (data.items || []).map((ci: any) => ({
              id: ci.id || ci.cartItemId,
              productId: ci.product?.id || ci.productId,
              quantity: ci.quantity,
            }));
            set({ cart: normalized });
            cartItem = normalized.find(i => i.productId === productId);
          }
          if (cartItem && cartItem.id) {
            await storeApi.updateCartItem(cartItem.id, quantity);
          }

          // Refresh cart from server
          const fresh = await storeApi.getUserCart();
          const normalizedFresh = (fresh.items || []).map((ci: any) => ({
            id: ci.id || ci.cartItemId,
            productId: ci.product?.id || ci.productId,
            quantity: ci.quantity,
          }));
          set({ cart: normalizedFresh });
        } catch (error: any) {
          set({ error: error.message || 'Failed to update cart quantity' });
        } finally {
          set({ isLoading: false });
        }
      },

      saveProduct: async (productId) => {
        // Optimistic update
        set((state) => ({ savedItems: [...state.savedItems, productId] }));
        try {
          await storeApi.saveItem(productId);
        } catch (error) {
          console.warn('Save product failed, queueing for offline sync:', error);
          try {
            const { default: syncManager } = await import('../services/syncManager');
            await syncManager.queueRequest('POST', `/items/${productId}/save`);
          } catch (e) {
            console.error('Failed to queue product save:', e);
          }
        }
      },

      unsaveProduct: async (productId) => {
        // Optimistic update
        set((state) => ({ savedItems: state.savedItems.filter(id => id !== productId) }));
        try {
          await storeApi.unsaveItem(productId);
        } catch (error) {
          console.warn('Unsave product failed, queueing for offline sync:', error);
          try {
            const { default: syncManager } = await import('../services/syncManager');
            await syncManager.queueRequest('DELETE', `/items/${productId}/save`);
          } catch (e) {
            console.error('Failed to queue product unsave:', e);
          }
        }
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


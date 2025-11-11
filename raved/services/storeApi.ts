import api from './api';

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  condition: string;
  size: string;
  category: string;
  brand: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    faculty: string;
    rating?: number;
    itemsSold?: number;
  };
  stats?: {
    likes: number;
    views: number;
    saves: number;
  };
  likesCount?: number;
  viewsCount?: number;
  savesCount?: number;
  paymentMethods: string[];
  meetupLocation: string;
  timestamp: number;
  tags: string[];
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  userId: string;
  createdAt: string;
}

export interface CartData {
  items: (CartItem & { product: StoreItem })[];
  total: number;
}

export interface CheckoutData {
  items: { productId: string; quantity: number }[];
  deliveryMethod: 'campus' | 'hostel';
  paymentMethod: 'momo' | 'cash';
  buyerPhone: string;
  address?: string;
  momoPhone?: string;
  momoNetwork?: string;
}

export const storeApi = {
  // Store Items
  getStoreItems: async (params?: {
    category?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/store/items', { params });
    return response.data;
  },

  getStoreItem: async (itemId: string) => {
    const response = await api.get(`/store/items/${itemId}`);
    return response.data;
  },

  createStoreItem: async (itemData: {
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: string;
    condition: string;
    size?: string;
    brand?: string;
    color?: string;
    images: string[];
    paymentMethods?: string[];
    meetupLocation?: string;
    sellerPhone?: string;
    negotiable?: boolean;
  }) => {
    const response = await api.post('/store/items', itemData);
    return response.data;
  },

  updateStoreItem: async (itemId: string, updateData: Partial<{
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    category: string;
    condition: string;
    size?: string;
    brand?: string;
    color?: string;
    images: string[];
    paymentMethods?: string[];
    meetupLocation?: string;
    sellerPhone?: string;
    negotiable?: boolean;
  }>) => {
    const response = await api.put(`/store/items/${itemId}`, updateData);
    return response.data;
  },

  deleteStoreItem: async (itemId: string) => {
    const response = await api.delete(`/store/items/${itemId}`);
    return response.data;
  },

  // Cart Operations
  getUserCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (itemId: string, quantity: number = 1) => {
    const response = await api.post('/cart/add', { itemId, quantity });
    return response.data;
  },

  updateCartItem: async (cartItemId: string, quantity: number) => {
    const response = await api.put(`/cart/item/${cartItemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (cartItemId: string) => {
    const response = await api.delete(`/cart/item/${cartItemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },

  // Wishlist Operations
  getUserWishlist: async () => {
    const response = await api.get('/cart/wishlist');
    return response.data;
  },

  addToWishlist: async (itemId: string) => {
    const response = await api.post(`/cart/wishlist/${itemId}`);
    return response.data;
  },

  removeFromWishlist: async (itemId: string) => {
    const response = await api.delete(`/cart/wishlist/${itemId}`);
    return response.data;
  },

  // Payment Operations
  initializePayment: async (data: CheckoutData) => {
    const response = await api.post('/payment/initialize-checkout', data);
    return response.data;
  },

  verifyPayment: async (reference: string) => {
    const response = await api.get(`/payment/verify/${reference}`);
    return response.data;
  },

  // Additional operations for full backend compatibility
  saveItem: async (itemId: string) => {
    const response = await api.post(`/store/items/${itemId}/save`);
    return response.data;
  },

  unsaveItem: async (itemId: string) => {
    const response = await api.delete(`/store/items/${itemId}/save`);
    return response.data;
  },

  reportItem: async (itemId: string, reason: string) => {
    const response = await api.post(`/store/items/${itemId}/report`, { reason });
    return response.data;
  },
};
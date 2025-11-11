// Type definitions matching HTML prototype State object

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  faculty: string;
  location: string;
  website: string;
  followers: number;
  following: number;
  theme: 'default' | 'rose' | 'emerald' | 'ocean' | 'sunset' | 'galaxy';
  
  // Privacy settings
  isPrivate: boolean;
  showActivity: boolean;
  readReceipts: boolean;
  allowDownloads: boolean;
  allowStorySharing: boolean;
  analytics: boolean;
  personalizedAds: boolean;
  
  // Language & Regional
  language: 'en' | 'tw' | 'ha' | 'fr';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  currency: 'GHS' | 'USD' | 'EUR' | 'GBP';
}

export interface Post {
  id: string;
  user: {
    id: string;
    name: string;
    username?: string;
    avatar: string;
    avatarUrl?: string;
    faculty: string;
  };
  caption: string;
  media: {
    type: 'image' | 'video' | 'carousel' | 'text';
    url?: string;
    thumbnail?: string;
    items?: string[];
  };
  tags?: string[];
  likes: number;
  comments: number;
  shares: number;
  timeAgo: string;
  createdAt?: string;
  isLiked?: boolean;
  liked: boolean;
  saved: boolean;
  forSale?: boolean;
  price?: number;
  isForSale?: boolean;
  saleDetails?: {
    itemName: string;
    price: number;
    originalPrice?: number;
    category: string;
    condition: string;
    size?: string;
    brand?: string;
    color?: string;
    material?: string;
    paymentMethods?: string[];
    meetupLocation?: string;
    sellerPhone?: string;
    negotiable?: boolean;
  };
  location?: string;
  brand?: string;
  occasion?: string;
  visibility?: 'public' | 'connections' | 'faculty';
}

export interface Story {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  type: 'image' | 'video' | 'text';
  url: string;
  text?: string;
  duration: number;
  timestamp: number;
  viewed: boolean;
  allowReplies: boolean;
  addToHighlights: boolean;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  condition: 'new' | 'like-new' | 'good' | 'fair';
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
  id?: string;
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface Event {
  id: string;
  title: string;
  organizer: string;
  orgAvatar: string;
  date: string;
  time: string;
  location: string;
  category: string;
  audience: string;
  description: string;
  image: string;
  attendees: number;
  max: number;
  attending: boolean;
  tags: string[];
  ownerId: string;
}

export interface Comment {
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  text: string;
  time: string;
}

export interface Notification {
  id: string;
  text: string;
  time: string;
  read?: boolean;
}

export interface Connection {
  id: string;
  name: string;
  avatar: string;
  faculty: string;
  mutual?: number;
  type: 'following' | 'follower' | 'request' | 'suggested';
}

export interface Subscription {
  isPremium: boolean;
  trialStartDate: number;
  trialDaysLeft: number;
  subscriptionEndDate: number | null;
  paymentMethod: string | null;
}

export interface UserStats {
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalSales: number;
  weeklyScore: number;
  monthlyScore: number;
  allTimeScore: number;
}

export interface AppState {
  theme: 'light' | 'dark';
  currentTab: 'home' | 'faculties' | 'create' | 'events' | 'profile';
  currentUser: User;
  loggedIn: boolean;
  likes: Set<string>;
  bookmarks: Set<string>;
  follows: Set<string>;
  notifications: Notification[];
  stories: Story[];
  posts: Post[];
  comments: Record<string, Comment[]>;
  storeItems: StoreItem[];
  cart: CartItem[];
  events: Event[];
  chats: any[];
  connections: Connection[];
  recentlyViewed: StoreItem[];
  subscription: Subscription;
  rankings: any[];
  userStats: UserStats;
  featuredId: string | null;
  rankingMonthIdx: number;
  searchIndex: any[];
  temp: {
    activePostId: string | null;
    activeItemId: string | null;
    activeChatId: string | null;
    storyTimer: any;
    emailVerificationCode: string | null;
    phoneVerificationCode: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    newAvatar: {
      src: string;
      style: string;
      border: string;
    };
    selectedTheme: string | null;
    selectedPaymentMethod: string | null;
    currentSimilarItem: StoreItem | null;
  };
}


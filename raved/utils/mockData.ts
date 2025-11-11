// Extract exact data from HTML prototype
import { StoreItem } from '../types';

export const mockUsers = [
  { id: 'u1', name: 'Sophie Parker', avatar: 'https://i.imgur.com/bxfE9TV.jpg', faculty: 'Science' },
  { id: 'u2', name: 'Emily White', avatar: 'https://i.imgur.com/nV6fsQh.jpg', faculty: 'Arts' },
  { id: 'u3', name: 'Marcus Stevens', avatar: 'https://i.imgur.com/IigY4Hm.jpg', faculty: 'Business' },
  { id: 'u4', name: 'Anna Reynolds', avatar: 'https://i.imgur.com/KnZQY6W.jpg', faculty: 'Medicine' },
  { id: 'u5', name: 'David Chen', avatar: 'https://i.imgur.com/kMB0Upu.jpg', faculty: 'Engineering' },
  { id: 'u6', name: 'Jason Miller', avatar: 'https://i.imgur.com/8Km9tLL.jpg', faculty: 'Law' },
];

export const mockImages = [
  'https://i.imgur.com/Ynh9LMX.jpg',
  'https://i.imgur.com/D3CYJcL.jpg',
  'https://i.imgur.com/JObkVPV.jpg',
  'https://i.imgur.com/KnZQY6W.jpg',
  'https://i.imgur.com/IigY4Hm.jpg',
  'https://i.imgur.com/nV6fsQh.jpg',
];

export const mockVideos = [
  'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4',
  'https://file-examples.com/storage/fe86c86b8b66f8e0b2b9b3b/2017/10/file_example_MP4_480_1_5MG.mp4',
];

export const mockCaptions = [
  "Perfect outfit for today's presentation! 💼 #CampusStyle",
  'Sustainable fashion vibes 🌿 #EcoFriendly',
  'Weekend casuals ✨ #Relaxed',
  'Library chic 📚 #AcademicFashion',
  'Date night look 💕 #Elegant',
  'Comfort meets style 😊 #CampusLife',
  'Bold colors today 🎨 #Creative',
  'Vintage vibes 🎭 #VintageStyle',
];

export const mockStoreItems: StoreItem[] = [
  { 
    id: 'item_1', 
    name: 'Eco-Friendly Dress', 
    description: 'Sustainable fashion dress in excellent condition',
    price: 45, 
    originalPrice: 60, 
    images: [mockImages[0]], 
    category: 'clothing', 
    condition: 'like-new',
    size: 'M',
    brand: 'Zara',
    seller: {
      id: mockUsers[0].id,
      name: mockUsers[0].name,
      avatar: mockUsers[0].avatar,
      faculty: mockUsers[0].faculty,
    },
    stats: {
      likes: 24,
      views: 156,
      saves: 8,
    },
    paymentMethods: ['Mobile Money', 'Cash'],
    meetupLocation: 'Campus Library',
    timestamp: Date.now() - 86400000,
    tags: ['sale']
  },
  { 
    id: 'item_2', 
    name: 'Business Jacket', 
    description: 'Professional business jacket, perfect for presentations',
    price: 89, 
    originalPrice: undefined, 
    images: [mockImages[1]], 
    category: 'clothing', 
    condition: 'new',
    size: 'L',
    brand: 'H&M',
    seller: {
      id: mockUsers[2].id,
      name: mockUsers[2].name,
      avatar: mockUsers[2].avatar,
      faculty: mockUsers[2].faculty,
    },
    stats: {
      likes: 45,
      views: 234,
      saves: 12,
    },
    paymentMethods: ['Mobile Money', 'Cash', 'Bank Transfer'],
    meetupLocation: 'Student Union Building',
    timestamp: Date.now() - 172800000,
    tags: []
  },
  { 
    id: 'item_3', 
    name: 'Artistic Blouse', 
    description: 'Unique vintage-style blouse',
    price: 32, 
    originalPrice: undefined, 
    images: [mockImages[2]], 
    category: 'clothing', 
    condition: 'good',
    size: 'S',
    brand: 'Vintage',
    seller: {
      id: mockUsers[1].id,
      name: mockUsers[1].name,
      avatar: mockUsers[1].avatar,
      faculty: mockUsers[1].faculty,
    },
    stats: {
      likes: 18,
      views: 98,
      saves: 5,
    },
    paymentMethods: ['Cash'],
    meetupLocation: 'Main Gate',
    timestamp: Date.now() - 259200000,
    tags: []
  },
  { 
    id: 'item_4', 
    name: 'Medical Scrubs', 
    description: 'Comfortable medical scrubs for clinical rotations',
    price: 28, 
    originalPrice: undefined, 
    images: [mockImages[3]], 
    category: 'clothing', 
    condition: 'new',
    size: 'M',
    brand: 'Generic',
    seller: {
      id: mockUsers[3].id,
      name: mockUsers[3].name,
      avatar: mockUsers[3].avatar,
      faculty: mockUsers[3].faculty,
    },
    stats: {
      likes: 12,
      views: 67,
      saves: 3,
    },
    paymentMethods: ['Mobile Money', 'Cash'],
    meetupLocation: 'Faculty Building',
    timestamp: Date.now() - 345600000,
    tags: ['hot']
  },
];

export const popularTags = ['OOTD', 'CampusStyle', 'Vintage', 'Thrifted', 'StudyFit'];

export const locationSuggestions = [
  { name: 'Campus Library', type: 'University', distance: '0.1 km' },
  { name: 'Student Union Building', type: 'University', distance: '0.2 km' },
  { name: 'Main Gate', type: 'University', distance: '0.3 km' },
  { name: 'Central Cafeteria', type: 'University', distance: '0.4 km' },
  { name: 'Sports Complex', type: 'University', distance: '0.5 km' },
  { name: 'Downtown Mall', type: 'Shopping', distance: '1.2 km' },
  { name: 'City Center', type: 'City', distance: '2.1 km' },
  { name: 'Campus Hostel Block A', type: 'University', distance: '0.6 km' },
  { name: 'Campus Hostel Block B', type: 'University', distance: '0.7 km' },
  { name: 'Faculty Building', type: 'University', distance: '0.8 km' },
];


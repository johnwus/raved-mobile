import React, { useState, useContext, createContext, useEffect } from 'react';
import { Storage } from '../services/storage';
import { User } from '../types';
import api, { login as apiLogin } from '../services/api';
import { NotificationService } from '../services/notificationService';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: any) => Promise<void>;
  isAuthenticated: boolean;
  requiresTwoFactor: boolean;
  verifyTwoFactor: (userId: string, code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await Storage.get<User | null>('user', null);
      const loggedIn = await Storage.get<boolean>('loggedIn', false);
      if (loggedIn && savedUser) {
        setUser(savedUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const login = async (identifier: string, password: string) => {
    try {
      console.log('Login attempt with identifier:', identifier);
      const data = await apiLogin(identifier, password);
      console.log('Login response received:', { hasToken: !!data.token, hasUser: !!data.user, requiresTwoFactor: data.requiresTwoFactor });

      if (data.requiresTwoFactor) {
        setRequiresTwoFactor(true);
        // Store userId for 2FA verification
        await Storage.set('pendingUserId', data.userId);
        return;
      }

      const userData: User = {
        id: data.user.id,
        name: `${data.user.firstName} ${data.user.lastName}`,
        username: data.user.username,
        avatar: '', // Will be fetched separately
        bio: '',
        faculty: '',
        location: '',
        website: '',
        followers: 0,
        following: 0,
        theme: 'default',
        isPrivate: false,
        showActivity: true,
        readReceipts: true,
        allowDownloads: false,
        allowStorySharing: true,
        analytics: true,
        personalizedAds: true,
        language: 'en',
        dateFormat: 'DD/MM/YYYY',
        currency: 'GHS',
      };

      setUser(userData);
      await Storage.set('user', userData);
      await Storage.set('authToken', data.token);
      await Storage.set('refreshToken', data.refreshToken);
      await Storage.set('loggedIn', true);
      setRequiresTwoFactor(false);

      // Register for push notifications after successful login
      try {
        await NotificationService.registerForPushNotificationsAsync(userData.id);
      } catch (error) {
        console.error('Failed to register for push notifications:', error);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const logout = async () => {
    setUser(null);
    setRequiresTwoFactor(false);
    await Storage.set('loggedIn', false);
    await Storage.remove('user');
    await Storage.remove('authToken');
    await Storage.remove('refreshToken');
    await Storage.remove('pendingUserId');
  };

  const register = async (userData: any) => {
    // Mock registration - in real app, this would call registration API
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser: User = {
      id: Date.now().toString(),
      name: `${userData.firstName} ${userData.lastName}`,
      username: userData.username,
      avatar: 'https://i.imgur.com/jL1aT9i.jpg',
      bio: userData.bio || '',
      faculty: userData.faculty || '',
      location: userData.location || '',
      website: '',
      followers: 0,
      following: 0,
      theme: 'default',
      isPrivate: false,
      showActivity: true,
      readReceipts: true,
      allowDownloads: false,
      allowStorySharing: true,
      analytics: true,
      personalizedAds: true,
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      currency: 'GHS',
    };
    setUser(newUser);
    await Storage.set('user', newUser);
    await Storage.set('loggedIn', true);
  };

  const verifyTwoFactor = async (userId: string, code: string) => {
    try {
      const response = await api.post('/auth/verify-sms-2fa-code', {
        userId,
        code,
      });

      const { data } = response;

      const userData: User = {
        id: data.user.id,
        name: `${data.user.firstName} ${data.user.lastName}`,
        username: data.user.username,
        avatar: '', // Will be fetched separately
        bio: '',
        faculty: '',
        location: '',
        website: '',
        followers: 0,
        following: 0,
        theme: 'default',
        isPrivate: false,
        showActivity: true,
        readReceipts: true,
        allowDownloads: false,
        allowStorySharing: true,
        analytics: true,
        personalizedAds: true,
        language: 'en',
        dateFormat: 'DD/MM/YYYY',
        currency: 'GHS',
      };

      setUser(userData);
      await Storage.set('user', userData);
      await Storage.set('authToken', data.token);
      await Storage.set('refreshToken', data.refreshToken);
      await Storage.set('loggedIn', true);
      setRequiresTwoFactor(false);
      await Storage.remove('pendingUserId');

      // Register for push notifications after successful 2FA verification
      try {
        await NotificationService.registerForPushNotificationsAsync(userData.id);
      } catch (error) {
        console.error('Failed to register for push notifications:', error);
      }
    } catch (error: any) {
      console.error('2FA verification error:', error);
      throw new Error(error.response?.data?.error || '2FA verification failed');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      isAuthenticated: !!user,
      requiresTwoFactor,
      verifyTwoFactor,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


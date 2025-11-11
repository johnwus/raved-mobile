import AsyncStorage from '@react-native-async-storage/async-storage';

export const Storage = {
  get: async <T>(key: string, defaultValue: T): Promise<T> => {
    try {
      const value = await AsyncStorage.getItem('raved_' + key);
      return value ? JSON.parse(value) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: async <T>(key: string, value: T): Promise<void> => {
    try {
      await AsyncStorage.setItem('raved_' + key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  },
  
  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem('raved_' + key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  },
  
  clear: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};


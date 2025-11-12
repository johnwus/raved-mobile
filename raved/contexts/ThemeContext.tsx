import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Storage } from '../services/storage';
import { colors, ThemeName } from '../theme/colors';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

interface ThemeContextType {
  isDark: boolean;
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  toggleDarkMode: () => void;
  currentColors: any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [theme, setTheme] = useState<ThemeName>('default');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadThemeSettings();
  }, [isAuthenticated]);

  const loadThemeSettings = async () => {
    try {
      const savedTheme = await Storage.get<ThemeName>('theme', 'default');
      const savedDarkMode = await Storage.get<boolean>('dark_mode', false);

      if (isAuthenticated) {
        try {
          const response = await api.get('/themes/users/theme');
          if (response.data.success) {
            const backendTheme = response.data.theme.themeId;
            const backendDarkMode = response.data.theme.darkMode;

            await Storage.set('theme', backendTheme);
            await Storage.set('dark_mode', backendDarkMode);
            setTheme(backendTheme);
            setIsDark(backendDarkMode);
            return;
          }
        } catch (backendError) {
          console.warn('Failed to sync theme with backend, using local settings:', backendError);
        }
      }

      setTheme(savedTheme);
      setIsDark(savedDarkMode);
    } catch (error) {
      console.error('Error loading theme settings:', error);
    }
  };

  const toggleDarkMode = async () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    try {
      await Storage.set('dark_mode', newDarkMode);
      if (isAuthenticated) {
        try {
          await api.post('/themes/users/dark-mode', { darkMode: newDarkMode });
        } catch (backendError) {
          console.warn('Backend sync failed for dark mode, queueing:', backendError);
          try {
            const { default: syncManager } = await import('../services/syncManager');
            await syncManager.queueRequest('POST', '/themes/users/dark-mode', { darkMode: newDarkMode });
          } catch (e) {
            console.error('Failed to queue dark mode update:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error saving dark mode:', error);
    }
  };

  const handleSetTheme = async (newTheme: ThemeName) => {
    setTheme(newTheme);
    try {
      await Storage.set('theme', newTheme);
      if (isAuthenticated) {
        try {
          await api.post('/themes/users/theme', { themeId: newTheme });
        } catch (backendError) {
          console.warn('Backend sync failed for theme, queueing:', backendError);
          try {
            const { default: syncManager } = await import('../services/syncManager');
            await syncManager.queueRequest('POST', '/themes/users/theme', { themeId: newTheme });
          } catch (e) {
            console.error('Failed to queue theme update:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const currentColors = (() => {
    const base = isDark ? colors.dark : colors;
    if (theme === 'default') {
      return base;
    }
    const themeColors = colors.themes[theme][isDark ? 'dark' : 'light'];
    return {
      ...base,
      primary: themeColors.primary,
      primaryDark: themeColors.primaryDark,
      accent: 'accent' in themeColors ? themeColors.accent : colors.accent,
    };
  })();

  return (
    <ThemeContext.Provider value={{
      isDark,
      theme,
      setTheme: handleSetTheme,
      toggleDarkMode,
      currentColors,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};



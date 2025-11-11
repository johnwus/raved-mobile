// EXACT colors extracted from HTML prototype
export const colors = {
  primary: '#5D5CDE',
  primaryDark: '#4C4BC7',
  accent: '#FF6B6B',
  success: '#10B981',
  warning: '#F59E0B',
  
  // Dark mode colors
  dark: {
    bg: '#0F1115',
    card: '#171923',
    text: '#E5E7EB',
    primary: '#7775E8',
  },
  
  // Theme variants (EXACT from [data-theme] CSS)
  themes: {
    rose: {
      light: { primary: '#f43f5e', primaryDark: '#e11d48', accent: '#fb7185' },
      dark: { primary: '#fb7185', primaryDark: '#f43f5e' }
    },
    emerald: {
      light: { primary: '#10b981', primaryDark: '#059669', accent: '#34d399' },
      dark: { primary: '#6ee7b7', primaryDark: '#34d399' }
    },
    ocean: {
      light: { primary: '#3b82f6', primaryDark: '#2563eb', accent: '#60a5fa' },
      dark: { primary: '#93c5fd', primaryDark: '#60a5fa' }
    },
    sunset: {
      light: { primary: '#f97316', primaryDark: '#ea580c', accent: '#fb923c' },
      dark: { primary: '#fdba74', primaryDark: '#fb923c' }
    },
    galaxy: {
      light: { primary: '#6366f1', primaryDark: '#4f46e5', accent: '#8b5cf6' },
      dark: { primary: '#a5b4fc', primaryDark: '#8b5cf6' }
    }
  }
};

export type ThemeName = 'default' | 'rose' | 'emerald' | 'ocean' | 'sunset' | 'galaxy';


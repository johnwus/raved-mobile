import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { Button } from '../components/ui/Button';
import { useTheme } from '../contexts/ThemeContext';
import { useToastStore } from '../store/toastStore';

interface ThemeOption {
  id: 'default' | 'rose' | 'emerald' | 'ocean' | 'sunset' | 'galaxy';
  name: string;
  description: string;
  icon: string;
  colors: readonly [string, string];
}

const themes: ThemeOption[] = [
  {
    id: 'default',
    name: 'Raved Classic',
    description: 'Purple & Blue',
    icon: 'sparkles',
    colors: ['#667EEA', '#764BA2'],
  },
  {
    id: 'rose',
    name: 'Rose Garden',
    description: 'Pink & Rose',
    icon: 'heart',
    colors: ['#F43F5E', '#F93F5E'],
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    description: 'Green & Teal',
    icon: 'leaf',
    colors: ['#10B981', '#059669'],
  },
  {
    id: 'ocean',
    name: 'Ocean Breeze',
    description: 'Blue & Cyan',
    icon: 'water',
    colors: ['#3B82F6', '#2563EB'],
  },
  {
    id: 'sunset',
    name: 'Sunset Glow',
    description: 'Orange & Red',
    icon: 'sunny',
    colors: ['#F97316', '#EA580C'],
  },
  {
    id: 'galaxy',
    name: 'Galaxy Night',
    description: 'Indigo & Purple',
    icon: 'star',
    colors: ['#6366F1', '#8B5CF6'],
  },
];

export default function ThemesScreen() {
  const router = useRouter();
  const { theme: currentThemeName, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(currentThemeName);

  const { showToast } = useToastStore();
  
  const handleApplyTheme = () => {
    setTheme(selectedTheme);
    const themeNames: Record<string, string> = {
      'default': 'Raved Classic',
      'rose': 'Rose Garden',
      'emerald': 'Emerald Forest',
      'ocean': 'Ocean Breeze',
      'sunset': 'Sunset Glow',
      'galaxy': 'Galaxy Night',
    };
    showToast(`Theme changed to ${themeNames[selectedTheme]}! 🎨`, 'success');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handle} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🎨 Premium Themes</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Premium Badge */}
        <View style={styles.premiumBadge}>
          <View style={styles.premiumIcon}>
            <Ionicons name="diamond" size={20} color="white" />
          </View>
          <View style={styles.premiumText}>
            <Text style={styles.premiumTitle}>Premium Feature</Text>
            <Text style={styles.premiumSubtitle}>Exclusive themes for premium members</Text>
          </View>
        </View>

        {/* Theme Collections */}
        <View style={styles.themesSection}>
          <Text style={styles.sectionTitle}>🌈 Theme Collections</Text>

          {/* Classic Collection */}
          <View style={styles.collection}>
            <Text style={styles.collectionTitle}>Classic Collection</Text>
            <View style={styles.themesGrid}>
              {themes.slice(0, 2).map(themeOption => (
                <TouchableOpacity
                  key={themeOption.id}
                  style={[
                    styles.themeCard,
                    selectedTheme === themeOption.id && styles.themeCardActive,
                  ]}
                  onPress={() => setSelectedTheme(themeOption.id)}
                >
                  <View style={styles.themePreview}>
                    <LinearGradient
                      colors={themeOption.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.themeGradient}
                    >
                      <Ionicons name={themeOption.icon as any} size={24} color="white" />
                    </LinearGradient>
                    <View style={styles.themeBars}>
                      <View style={[styles.themeBar, { backgroundColor: `${themeOption.colors[0]}33` }]} />
                      <View style={[styles.themeBar, styles.themeBarShort, { backgroundColor: '#E5E7EB' }]} />
                    </View>
                  </View>
                  <Text style={styles.themeName}>{themeOption.name}</Text>
                  <Text style={styles.themeDescription}>{themeOption.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Nature Collection */}
          <View style={styles.collection}>
            <Text style={styles.collectionTitle}>Nature Collection</Text>
            <View style={styles.themesGrid}>
              {themes.slice(2, 4).map(themeOption => (
                <TouchableOpacity
                  key={themeOption.id}
                  style={[
                    styles.themeCard,
                    selectedTheme === themeOption.id && styles.themeCardActive,
                  ]}
                  onPress={() => setSelectedTheme(themeOption.id)}
                >
                  <View style={styles.themePreview}>
                    <LinearGradient
                      colors={themeOption.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.themeGradient}
                    >
                      <Ionicons name={themeOption.icon as any} size={24} color="white" />
                    </LinearGradient>
                    <View style={styles.themeBars}>
                      <View style={[styles.themeBar, { backgroundColor: `${themeOption.colors[0]}33` }]} />
                      <View style={[styles.themeBar, styles.themeBarShort, { backgroundColor: '#E5E7EB' }]} />
                    </View>
                  </View>
                  <Text style={styles.themeName}>{themeOption.name}</Text>
                  <Text style={styles.themeDescription}>{themeOption.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Vibrant Collection */}
          <View style={styles.collection}>
            <Text style={styles.collectionTitle}>Vibrant Collection</Text>
            <View style={styles.themesGrid}>
              {themes.slice(4, 6).map(themeOption => (
                <TouchableOpacity
                  key={themeOption.id}
                  style={[
                    styles.themeCard,
                    selectedTheme === themeOption.id && styles.themeCardActive,
                  ]}
                  onPress={() => setSelectedTheme(themeOption.id)}
                >
                  <View style={styles.themePreview}>
                    <LinearGradient
                      colors={themeOption.colors}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.themeGradient}
                    >
                      <Ionicons name={themeOption.icon as any} size={24} color="white" />
                    </LinearGradient>
                    <View style={styles.themeBars}>
                      <View style={[styles.themeBar, { backgroundColor: `${themeOption.colors[0]}33` }]} />
                      <View style={[styles.themeBar, styles.themeBarShort, { backgroundColor: '#E5E7EB' }]} />
                    </View>
                  </View>
                  <Text style={styles.themeName}>{themeOption.name}</Text>
                  <Text style={styles.themeDescription}>{themeOption.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Apply Button */}
        <Button
          title="Apply Selected Theme"
          onPress={handleApplyTheme}
          variant="primary"
          size="large"
          leftIcon={<Ionicons name="color-palette" size={16} color="white" />}
          style={styles.applyButton}
          disabled={selectedTheme === currentThemeName}
        />

        {/* Theme Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>About Premium Themes</Text>
            <Text style={styles.infoDescription}>
              Premium themes change the app’s color scheme and visual style. Your selected theme will be applied across all screens and features.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing[2],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
  },
  headerTitle: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing[4],
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: theme.spacing[6],
    gap: theme.spacing[3],
  },
  premiumIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumText: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#92400E',
    marginBottom: 2,
  },
  premiumSubtitle: {
    fontSize: theme.typography.fontSize[12],
    color: '#A16207',
  },
  themesSection: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
    marginBottom: theme.spacing[4],
  },
  collection: {
    marginBottom: theme.spacing[6],
  },
  collectionTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#374151',
    marginBottom: theme.spacing[3],
  },
  themesGrid: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  themeCard: {
    flex: 1,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  themeCardActive: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  themePreview: {
    marginBottom: theme.spacing[3],
  },
  themeGradient: {
    width: '100%',
    height: 64,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  themeBars: {
    gap: 4,
  },
  themeBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
  },
  themeBarShort: {
    width: '75%',
  },
  themeName: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 2,
  },
  themeDescription: {
    fontSize: theme.typography.fontSize[10],
    color: '#6B7280',
    textAlign: 'center',
  },
  applyButton: {
    width: '100%',
    marginBottom: theme.spacing[6],
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#DBEAFE',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    gap: theme.spacing[2],
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#1E40AF',
    marginBottom: theme.spacing[1],
  },
  infoDescription: {
    fontSize: theme.typography.fontSize[12],
    color: '#1E40AF',
    lineHeight: 18,
  },
});


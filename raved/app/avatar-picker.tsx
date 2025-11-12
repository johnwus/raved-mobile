import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../hooks/useAuth';

type AvatarStyle = 'original' | 'circle' | 'square' | 'rounded';
type BorderStyle = 'none' | 'simple' | 'gradient' | 'glow';

const presetAvatars = [
  'https://i.imgur.com/jL1aT9i.jpg',
  'https://i.imgur.com/8qhbqxM.jpg',
  'https://i.imgur.com/9L2OxQK.jpg',
  'https://i.imgur.com/kL3mN4o.jpg',
  'https://i.imgur.com/pQ7rS8t.jpg',
  'https://i.imgur.com/vW9xY2z.jpg',
  'https://i.imgur.com/aB5cD6e.jpg',
  'https://i.imgur.com/fG8hI9j.jpg',
  'https://i.imgur.com/kL4mN7p.jpg',
  'https://i.imgur.com/qR6sT9u.jpg',
  'https://i.imgur.com/wX0yZ3v.jpg',
  'https://i.imgur.com/bC7dE8f.jpg',
];

export default function AvatarPickerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>('original');
  const [borderStyle, setBorderStyle] = useState<BorderStyle>('none');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedAvatar(result.assets[0].uri);
      setSelectedPresetIndex(null);
    }
  };

  const handleSelectFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedAvatar(result.assets[0].uri);
      setSelectedPresetIndex(null);
    }
  };

  const handleSelectPreset = (avatar: string, index: number) => {
    setSelectedAvatar(avatar);
    setSelectedPresetIndex(index);
  };

  const handleSave = () => {
    // TODO: Save avatar to user profile
    router.back();
  };

  const getAvatarBorderRadius = () => {
    switch (avatarStyle) {
      case 'circle':
      case 'original':
        return theme.borderRadius.full;
      case 'square':
        return 0;
      case 'rounded':
        return theme.borderRadius['2xl'];
      default:
        return theme.borderRadius.full;
    }
  };

  const renderBorder = () => {
    if (borderStyle === 'none') return null;

    const borderRadius = getAvatarBorderRadius();
    const borderWidth = borderStyle === 'simple' ? 4 : 6;

    if (borderStyle === 'gradient') {
      return (
        <View style={[styles.borderGradient, { borderRadius, borderWidth }]}>
          <LinearGradient
            colors={[theme.colors.primary, '#9333EA', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientBorder, { borderRadius }]}
          />
        </View>
      );
    }

    if (borderStyle === 'glow') {
      return (
        <View style={[styles.borderGlow, { borderRadius, borderWidth }]} />
      );
    }

    return (
      <View style={[styles.borderSimple, { borderRadius, borderWidth }]} />
    );
  };

  const canSave = selectedAvatar !== user?.avatar || avatarStyle !== 'original' || borderStyle !== 'none';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Change Avatar</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Avatar Preview */}
        <View style={styles.currentAvatarSection}>
          <View style={styles.currentAvatarContainer}>
            <Avatar uri={user?.avatar || ''} size={128} />
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </View>
          <Text style={styles.currentAvatarTitle}>Current Avatar</Text>
          <Text style={styles.currentAvatarSubtitle}>Choose a new profile picture</Text>
        </View>

        {/* Upload Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload Options</Text>
          <View style={styles.uploadOptions}>
            <TouchableOpacity
              style={[styles.uploadOption, styles.uploadOptionBlue]}
              onPress={handleTakePhoto}
            >
              <Ionicons name="camera" size={32} color="#2563EB" />
              <Text style={styles.uploadOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.uploadOption, styles.uploadOptionGreen]}
              onPress={handleSelectFromGallery}
            >
              <Ionicons name="images" size={32} color="#16A34A" />
              <Text style={styles.uploadOptionText}>Photo Library</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preset Avatars */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose from Presets</Text>
          <View style={styles.presetGrid}>
            {presetAvatars.map((avatar, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.presetAvatar,
                  selectedPresetIndex === index && styles.presetAvatarSelected,
                ]}
                onPress={() => handleSelectPreset(avatar, index)}
              >
                <Image source={{ uri: avatar }} style={styles.presetAvatarImage} />
                {selectedPresetIndex === index && (
                  <View style={styles.presetAvatarCheck}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Avatar Customization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customize</Text>
          
          <View style={styles.customizeSection}>
            <Text style={styles.customizeLabel}>Avatar Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.styleScroll}>
              {(['original', 'circle', 'square', 'rounded'] as AvatarStyle[]).map((style) => (
                <TouchableOpacity
                  key={style}
                  style={[
                    styles.styleButton,
                    avatarStyle === style && styles.styleButtonActive,
                  ]}
                  onPress={() => setAvatarStyle(style)}
                >
                  <Text
                    style={[
                      styles.styleButtonText,
                      avatarStyle === style && styles.styleButtonTextActive,
                    ]}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.customizeSection}>
            <Text style={styles.customizeLabel}>Border Style</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.styleScroll}>
              {(['none', 'simple', 'gradient', 'glow'] as BorderStyle[]).map((style) => (
                <TouchableOpacity
                  key={style}
                  style={[
                    styles.styleButton,
                    borderStyle === style && styles.styleButtonActive,
                  ]}
                  onPress={() => setBorderStyle(style)}
                >
                  <Text
                    style={[
                      styles.styleButtonText,
                      borderStyle === style && styles.styleButtonTextActive,
                    ]}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Avatar Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <View style={styles.previewContainer}>
            <View style={styles.previewAvatarWrapper}>
              <Image
                source={{ uri: selectedAvatar }}
                style={[
                  styles.previewAvatar,
                  { borderRadius: getAvatarBorderRadius() },
                ]}
              />
              {renderBorder()}
            </View>
            <Text style={styles.previewText}>How your new avatar will look</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={canSave ? [theme.colors.primary, '#9333EA'] : ['#D1D5DB', '#9CA3AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            <Ionicons name="save" size={20} color="white" style={styles.saveButtonIcon} />
            <Text style={styles.saveButtonText}>Save Avatar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[2],
    paddingBottom: theme.spacing[3],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  closeButton: {
    padding: theme.spacing[1],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[4],
    gap: theme.spacing[6],
  },
  currentAvatarSection: {
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  currentAvatarContainer: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: theme.spacing[2],
    right: theme.spacing[2],
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  currentAvatarTitle: {
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
    marginTop: theme.spacing[3],
  },
  currentAvatarSubtitle: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
  },
  section: {
    gap: theme.spacing[3],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  uploadOption: {
    flex: 1,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  uploadOptionBlue: {
    backgroundColor: '#EFF6FF',
  },
  uploadOptionGreen: {
    backgroundColor: '#F0FDF4',
  },
  uploadOptionText: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#374151',
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  presetAvatar: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  presetAvatarSelected: {
    borderColor: theme.colors.primary,
  },
  presetAvatarImage: {
    width: '100%',
    height: '100%',
  },
  presetAvatarCheck: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customizeSection: {
    marginBottom: theme.spacing[3],
  },
  customizeLabel: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#374151',
    marginBottom: theme.spacing[2],
  },
  styleScroll: {
    marginHorizontal: -theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
  },
  styleButton: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#F3F4F6',
    marginRight: theme.spacing[2],
  },
  styleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  styleButtonText: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#374151',
  },
  styleButtonTextActive: {
    color: '#FFFFFF',
  },
  previewContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[6],
    alignItems: 'center',
  },
  previewAvatarWrapper: {
    position: 'relative',
    width: 96,
    height: 96,
  },
  previewAvatar: {
    width: 96,
    height: 96,
  },
  borderSimple: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderColor: theme.colors.primary,
  },
  borderGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  gradientBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  borderGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderColor: theme.colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  previewText: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
    marginTop: theme.spacing[2],
  },
  saveButton: {
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[4],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
  },
  saveButtonIcon: {
    marginRight: theme.spacing[2],
  },
  saveButtonText: {
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#FFFFFF',
  },
});


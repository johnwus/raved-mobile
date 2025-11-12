import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  Switch,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../hooks/useAuth';
import { locationSuggestions } from '../../utils/mockData';
import { usePostsStore } from '../../store/postsStore';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { uploadApi } from '../../services/uploadApi';

const popularTagsList = ['OOTD', 'CampusStyle', 'Vintage', 'Thrifted', 'StudyFit'];

export default function CreatePostScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { createPost } = usePostsStore();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<any[]>([]);
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationResults, setLocationResults] = useState<any[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const locationDebounce = useRef<any>(null);
  const [_validSale, setValidSale] = useState(true);
  
  // Marketplace state
  const [isForSale, setIsForSale] = useState(false);
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('new');
  const [size, setSize] = useState('');
  const [category, setCategory] = useState('clothing');
  const [itemDescription, setItemDescription] = useState('');
  const [paymentMethods, setPaymentMethods] = useState({
    momo: false,
    cash: false,
    bankTransfer: false,
  });
  const [negotiable, setNegotiable] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [meetupLocation, setMeetupLocation] = useState('');

  const pickMedia = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets) {
        const newMedia = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type === 'video' ? 'video' : 'image',
          id: Date.now() + Math.random(),
        }));
        setMedia([...media, ...newMedia]);
      }
    } catch {
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const removeMedia = (id: string) => {
    setMedia(media.filter(item => item.id !== id));
  };

  const addTag = () => {
    const trimmedTag = tagInput.trim().replace('#', '');
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addPopularTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  // Validate sale fields when for-sale is enabled
  const validateSale = () => {
    if (!isForSale) return true;
    const priceNum = parseFloat(price);
    const hasPrice = !isNaN(priceNum) && priceNum > 0;
    const validCategory = ['clothing','shoes','accessories','bags','jewelry'].includes(category);
    const validCondition = ['new','like-new','good','fair'].includes(condition);
    const validPhone = phoneNumber ? /^\+?\d{7,15}$/.test(phoneNumber.replace(/[\s-]/g, '')) : true;
    const ok = hasPrice && validCategory && validCondition && validPhone;
    setValidSale(ok);
    return ok;
  };

  const handlePost = async () => {
    if (!caption.trim() && media.length === 0) {
      Alert.alert('Error', 'Please add a caption or media to your post');
      return;
    }

    // Client-side validation
    if (!validateSale()) {
      Alert.alert('Missing details', 'Please provide a valid price, category, condition and phone (if provided) for sale items.');
      return;
    }

    setLoading(true);
    try {
      // Upload media to backend if present
      let uploadedMedia: { url: string; type: 'image' | 'video' }[] = [];
      if (media.length > 0) {
        const uploads = await Promise.all(
          media.map(async (m) => {
            const blob = await (await fetch(m.uri)).blob();
            const res = m.type === 'video' ? await uploadApi.uploadVideo(blob as any) : await uploadApi.uploadImage(blob as any);
            return { url: res.url, type: m.type } as { url: string; type: 'image' | 'video' };
          })
        );
        uploadedMedia = uploads;
      }

      const postData = {
        type: media.length > 0 ? (media[0].type === 'video' ? 'video' : media.length > 1 ? 'carousel' : 'image') : 'text',
        caption: caption.trim(),
        media: uploadedMedia,
        location: location || undefined,
        tags: tags,
        visibility: 'public' as const,
        isForSale,
        saleDetails: isForSale ? {
          itemName: itemDescription || caption.slice(0, 50),
          price: parseFloat(price) || 0,
          category,
          condition,
          size: size || undefined,
          paymentMethods: Object.entries(paymentMethods).filter(([,v]) => v).map(([k]) => k),
          meetupLocation: meetupLocation || undefined,
          sellerPhone: phoneNumber || undefined,
          negotiable,
        } : undefined,
      };

      await createPost(postData);
      Alert.alert('Success', 'Your post has been shared!');
      router.back();
    } catch (error: any) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity>
          <Text style={styles.draftButton}>Save Draft</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.userHeader}>
            <Avatar uri={user?.avatar || ''} size={48} />
            <View style={styles.userInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.userName}>{user?.name}</Text>
                <View style={styles.dot} />
                <Text style={styles.userFaculty}>{user?.faculty}</Text>
              </View>
              <View style={styles.visibilityRow}>
                <Ionicons name="globe" size={14} color="#6B7280" />
                <Text style={styles.visibilityText}>Everyone can see</Text>
              </View>
            </View>
          </View>

          {/* Caption Input */}
          <View style={styles.captionContainer}>
            <TextInput
              style={styles.captionInput}
              placeholder="What's your style story today? Share your outfit inspiration, fashion finds, or campus looks..."
              placeholderTextColor="#9CA3AF"
              multiline
              value={caption}
              onChangeText={setCaption}
              maxLength={2000}
            />
            <Text style={styles.charCount}>
              {caption.length}/2000
            </Text>
          </View>
        </View>

        {/* Media Upload */}
        <View style={styles.uploadCard}>
          {media.length === 0 ? (
            <TouchableOpacity 
              style={styles.uploadArea}
              onPress={pickMedia}
            >
              <View style={styles.uploadIcon}>
                <Ionicons name="camera" size={32} color={theme.colors.primary} />
              </View>
              <Text style={styles.uploadTitle}>Add photos or videos</Text>
              <Text style={styles.uploadSubtitle}>
                Share your outfit, style inspiration, or fashion moments
              </Text>
              <Button
                title="Choose Media"
                onPress={pickMedia}
                variant="primary"
                size="medium"
                leftIcon={<Ionicons name="add" size={16} color="white" />}
                style={styles.uploadButton}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.mediaPreview}>
              <FlatList
                data={media}
                numColumns={2}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <View style={styles.mediaItem}>
                    <Image source={{ uri: item.uri }} style={styles.mediaThumbnail} />
                    <TouchableOpacity 
                      style={styles.removeMediaButton}
                      onPress={() => removeMedia(item.id)}
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                    {item.type === 'video' && (
                      <View style={styles.videoIndicator}>
                        <Ionicons name="play" size={12} color="white" />
                      </View>
                    )}
                  </View>
                )}
              />
            </View>
          )}
        </View>

        {/* Location Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📍 Location</Text>
            <TouchableOpacity
              onPress={async () => {
                try {
                  const { status } = await Location.requestForegroundPermissionsAsync();
                  if (status !== 'granted') {
                    Alert.alert('Permission required', 'Location permission is needed.');
                    return;
                  }
                  const pos = await Location.getCurrentPositionAsync({});
                  // Try reverse geocoding via geocoding service if configured
                  try {
                    const { geocoding } = await import('../../services/geocoding');
                    const results = await geocoding.search(`${pos.coords.latitude}, ${pos.coords.longitude}`);
                    if (results[0]?.name) setLocation(results[0].name);
                    else setLocation('Current location');
                  } catch {
                    setLocation('Current location');
                  }
                } catch (e) {
                  console.error('Use current location failed', e);
                }
              }}
            >
              <Text style={styles.locationAction}>
                <Ionicons name="locate" size={12} /> Use current location
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.locationInputContainer}>
            <Ionicons name="location" size={20} color={theme.colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.locationInput}
              placeholder="Where are you? (e.g., Campus Library, Downtown Mall...)"
              placeholderTextColor="#9CA3AF"
              value={location}
              onChangeText={(text) => {
                setLocation(text);
                setShowLocationSuggestions(true);
                if (locationDebounce.current) clearTimeout(locationDebounce.current);
                locationDebounce.current = setTimeout(async () => {
                  try {
                    setLocationLoading(true);
                    const { geocoding } = await import('../../services/geocoding');
                    const results = await geocoding.search(text);
                    setLocationResults(results);
                  } catch {}
                  finally {
                    setLocationLoading(false);
                  }
                }, 300);
              }}
              onFocus={() => setShowLocationSuggestions(true)}
            />
          </View>

          {showLocationSuggestions && location && (
            <View style={styles.locationSuggestions}>
              {locationLoading && (
                <Text style={{ padding: 8, color: '#6B7280' }}>Searching…</Text>
              )}
              {(locationResults.length ? locationResults : locationSuggestions)
                .filter((s: any) => (s.name || '').toLowerCase().includes(location.toLowerCase()))
                .slice(0, 5)
                .map((suggestion: any, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.locationSuggestion}
                    onPress={() => {
                      setLocation(suggestion.name);
                      setShowLocationSuggestions(false);
                    }}
                  >
                    <Ionicons name="location" size={16} color={theme.colors.primary} />
                    <View style={styles.suggestionInfo}>
                      <Text style={styles.suggestionName}>{suggestion.name}</Text>
                      {!!suggestion.type && (
                        <Text style={styles.suggestionDetails}>
                          {suggestion.type}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>

        {/* Fashion Tags */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🏷️ Fashion Tags</Text>
          
          <View style={styles.tagInputContainer}>
            <Ionicons name="pricetag" size={20} color={theme.colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.tagInput}
              placeholder="Add tags like #OOTD #CampusStyle #Vintage..."
              placeholderTextColor="#9CA3AF"
              value={tagInput}
              onChangeText={setTagInput}
              onSubmitEditing={addTag}
              returnKeyType="done"
            />
          </View>

          <Text style={styles.popularTagsLabel}>Popular tags:</Text>
          <View style={styles.popularTags}>
            {popularTagsList.map(tag => (
              <TouchableOpacity
                key={tag}
                style={styles.popularTag}
                onPress={() => addPopularTag(tag)}
              >
                <Text style={styles.popularTagText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {tags.length > 0 && (
            <View style={styles.selectedTags}>
              {tags.map(tag => (
                <View key={tag} style={styles.selectedTag}>
                  <Text style={styles.selectedTagText}>#{tag}</Text>
                  <TouchableOpacity onPress={() => removeTag(tag)}>
                    <Ionicons name="close" size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Marketplace Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>🛍️ Marketplace</Text>
          
          <View style={styles.marketplaceToggle}>
            <View style={styles.toggleHeader}>
              <View style={styles.toggleLabel}>
                <Ionicons name="cart" size={20} color={theme.colors.success} />
                <Text style={styles.toggleTitle}>Make items available for sale</Text>
              </View>
              <Switch
                value={isForSale}
                onValueChange={setIsForSale}
                trackColor={{ false: '#D1D5DB', true: theme.colors.success }}
                thumbColor={isForSale ? theme.colors.success : '#9CA3AF'}
              />
            </View>

            {isForSale && (
              <View style={styles.saleDetails}>
                <View style={styles.saleRow}>
                  <View style={styles.saleInput}>
                    <Text style={styles.saleLabel}>Price (₵)</Text>
                    <TextInput
                      style={styles.saleInputField}
                      placeholder="25.00"
                      placeholderTextColor="#9CA3AF"
                      value={price}
                      onChangeText={setPrice}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.saleInput}>
                    <Text style={styles.saleLabel}>Condition</Text>
                    <View style={styles.selectChips}>
                      {['new','like-new','good','fair'].map((c) => (
                        <TouchableOpacity key={c} style={[styles.chip, condition===c && styles.chipActive]} onPress={() => setCondition(c)}>
                          <Text style={[styles.chipText, condition===c && styles.chipTextActive]}>{c==='like-new' ? 'Like New' : c.charAt(0).toUpperCase()+c.slice(1)}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.saleRow}>
                  <View style={styles.saleInput}>
                    <Text style={styles.saleLabel}>Category</Text>
                    <View style={styles.selectChips}>
                      {['clothing','shoes','accessories','bags','jewelry'].map((cat) => (
                        <TouchableOpacity key={cat} style={[styles.chip, category===cat && styles.chipActive]} onPress={() => setCategory(cat)}>
                          <Text style={[styles.chipText, category===cat && styles.chipTextActive]}>{cat.charAt(0).toUpperCase()+cat.slice(1)}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <View style={styles.saleInput}>
                    <Text style={styles.saleLabel}>Size</Text>
                    <View style={styles.selectChips}>
                      {['XS','S','M','L','XL','XXL','One Size'].map((s) => (
                        <TouchableOpacity key={s} style={[styles.chip, size===s && styles.chipActive]} onPress={() => setSize(s)}>
                          <Text style={[styles.chipText, size===s && styles.chipTextActive]}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={styles.saleRow}>
                  <View style={styles.saleInput}>
                    <Text style={styles.saleLabel}>Item Description</Text>
                    <TextInput
                      style={[styles.saleInputField, { minHeight: 80, textAlignVertical: 'top' }]}
                      placeholder="Describe the item..."
                      placeholderTextColor="#9CA3AF"
                      value={itemDescription}
                      onChangeText={setItemDescription}
                      multiline
                    />
                  </View>
                </View>

                <View style={styles.paymentMethods}>
                  <Text style={styles.paymentLabel}>💳 Payment & Contact</Text>
                  <View style={styles.paymentOptions}>
                    <View style={styles.paymentOption}>
                      <Switch
                        value={paymentMethods.momo}
                        onValueChange={value => setPaymentMethods(prev => ({ ...prev, momo: value }))}
                        trackColor={{ false: '#D1D5DB', true: theme.colors.success }}
                      />
                      <Text style={styles.paymentText}>Mobile Money</Text>
                    </View>
                    <View style={styles.paymentOption}>
                      <Switch
                        value={paymentMethods.cash}
                        onValueChange={value => setPaymentMethods(prev => ({ ...prev, cash: value }))}
                        trackColor={{ false: '#D1D5DB', true: theme.colors.success }}
                      />
                      <Text style={styles.paymentText}>Cash (In Person)</Text>
                    </View>
                    <View style={styles.paymentOption}>
                      <Switch
                        value={paymentMethods.bankTransfer}
                        onValueChange={value => setPaymentMethods(prev => ({ ...prev, bankTransfer: value }))}
                        trackColor={{ false: '#D1D5DB', true: theme.colors.success }}
                      />
                      <Text style={styles.paymentText}>Bank Transfer</Text>
                    </View>
                    <View style={styles.paymentOption}>
                      <Switch
                        value={negotiable}
                        onValueChange={setNegotiable}
                        trackColor={{ false: '#D1D5DB', true: theme.colors.success }}
                      />
                      <Text style={styles.paymentText}>Price Negotiable</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.saleRow}>
                  <View style={styles.saleInput}>
                    <Text style={styles.saleLabel}>Seller Phone</Text>
                    <TextInput
                      style={styles.saleInputField}
                      placeholder="0241234567"
                      placeholderTextColor="#9CA3AF"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={styles.saleInput}>
                    <Text style={styles.saleLabel}>Meetup Location</Text>
                    <TextInput
                      style={styles.saleInputField}
                      placeholder="Campus Library / Negotiable"
                      placeholderTextColor="#9CA3AF"
                      value={meetupLocation}
                      onChangeText={setMeetupLocation}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={pickMedia}>
            <Ionicons name="image" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="videocam" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="location" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
        
        <Button
          title={loading ? "Sharing..." : "Share"}
          onPress={handlePost}
          variant="primary"
          size="large"
          style={StyleSheet.flatten([
            styles.postButton,
            ((!caption.trim() && media.length === 0) || loading) && styles.postButtonDisabled
          ])}
          disabled={(!caption.trim() && media.length === 0) || loading}
          leftIcon={<Ionicons name="send" size={16} color="white" />}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  draftButton: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  userCard: {
    margin: theme.spacing[4],
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[4],
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    marginBottom: 4,
  },
  userName: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6B7280',
  },
  userFaculty: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
  },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  visibilityText: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  captionContainer: {
    marginTop: theme.spacing[2],
  },
  captionInput: {
    fontSize: theme.typography.fontSize[16],
    minHeight: 120,
    textAlignVertical: 'top',
    color: '#111827',
  },
  charCount: {
    fontSize: theme.typography.fontSize[12],
    textAlign: 'right',
    marginTop: theme.spacing[2],
    color: '#6B7280',
  },
  uploadCard: {
    margin: theme.spacing[4],
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[4],
  },
  uploadArea: {
    padding: theme.spacing[6],
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: theme.borderRadius['2xl'],
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${theme.colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  uploadButton: {
    marginTop: theme.spacing[2],
  },
  mediaPreview: {
    gap: theme.spacing[2],
  },
  mediaItem: {
    width: '47%',
    aspectRatio: 1,
    margin: '1.5%',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 4,
    borderRadius: 4,
  },
  sectionCard: {
    margin: theme.spacing[4],
    padding: theme.spacing[4],
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
  },
  locationAction: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  locationInput: {
    flex: 1,
    fontSize: theme.typography.fontSize[16],
    paddingVertical: theme.spacing[3],
    paddingLeft: 44,
    paddingRight: 12,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  locationSuggestions: {
    marginTop: theme.spacing[2],
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  locationSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing[3],
    gap: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#111827',
    marginBottom: 2,
  },
  suggestionDetails: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  tagInput: {
    flex: 1,
    fontSize: theme.typography.fontSize[16],
    paddingVertical: theme.spacing[3],
    paddingLeft: 44,
    paddingRight: 12,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: '#F9FAFB',
    color: '#111827',
  },
  popularTagsLabel: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
    marginBottom: theme.spacing[2],
  },
  popularTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  popularTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1.5],
    borderRadius: theme.borderRadius.xl,
  },
  popularTagText: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#111827',
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1.5],
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1.5],
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.primary,
  },
  selectedTagText: {
    color: 'white',
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.medium,
  },
  marketplaceToggle: {
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: `${theme.colors.success}40`,
    backgroundColor: `${theme.colors.success}20`,
  },
  toggleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  toggleTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.success,
  },
  saleDetails: {
    marginTop: theme.spacing[4],
    gap: theme.spacing[4],
  },
  saleRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  saleInput: {
    flex: 1,
  },
  saleLabel: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.success,
    marginBottom: theme.spacing[1.5],
  },
  saleInputField: {
    borderWidth: 1,
    borderColor: `${theme.colors.success}40`,
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    fontSize: theme.typography.fontSize[14],
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },
  saleSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: `${theme.colors.success}40`,
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    backgroundColor: '#FFFFFF',
  },
  saleSelectText: {
    fontSize: theme.typography.fontSize[14],
    color: '#111827',
  },
  paymentMethods: {
    gap: theme.spacing[3],
  },
  selectChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  chip: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1.5],
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: theme.colors.success,
  },
  chipText: {
    fontSize: theme.typography.fontSize[12],
    color: '#111827',
    fontWeight: theme.typography.fontWeight.medium,
  },
  chipTextActive: {
    color: 'white',
  },
  paymentLabel: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.success,
  },
  paymentOptions: {
    gap: theme.spacing[2],
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  paymentText: {
    fontSize: theme.typography.fontSize[14],
    color: '#111827',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  actionButton: {
    padding: theme.spacing[2],
  },
  postButton: {
    minWidth: 120,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
});

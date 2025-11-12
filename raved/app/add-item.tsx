import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../theme';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../hooks/useAuth';
import { useStore } from '../hooks/useStore';

const categories = ['clothing', 'shoes', 'accessories', 'bags', 'jewelry'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
const conditions = ['new', 'like-new', 'good', 'fair'];
const meetupLocations = [
  'Campus Library',
  'Student Union Building',
  'Main Gate',
  'Cafeteria',
  'Location Negotiable',
];

export default function AddItemScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isPremium: _isPremium } = useStore();
  
  const [images, setImages] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('clothing');
  const [size, setSize] = useState('');
  const [condition, setCondition] = useState('new');
  const [price, setPrice] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [meetupLocation, setMeetupLocation] = useState('');

  const handlePickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const uris = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...uris].slice(0, 6)); // Max 6 images
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const togglePaymentMethod = (method: string) => {
    setPaymentMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleSave = () => {
    if (!name.trim() || !price || images.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields and add at least one photo');
      return;
    }

    // TODO: Save item to store
    Alert.alert('Success', 'Item added to store successfully!');
    router.back();
  };

  const canSave = name.trim() && price && images.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Add Item to Store</Text>
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
        {/* Item Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Item Photos</Text>
          {images.length === 0 ? (
            <TouchableOpacity
              style={styles.uploadArea}
              onPress={handlePickImages}
            >
              <View style={styles.uploadIconContainer}>
                <Ionicons name="camera" size={32} color="#16A34A" />
              </View>
              <Text style={styles.uploadTitle}>Add item photos</Text>
              <Text style={styles.uploadSubtitle}>
                Show your item from multiple angles
              </Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handlePickImages}
              >
                <LinearGradient
                  colors={['#16A34A', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.uploadButtonGradient}
                >
                  <Ionicons name="add" size={16} color="white" />
                  <Text style={styles.uploadButtonText}>Choose Photos</Text>
                </LinearGradient>
              </TouchableOpacity>
            </TouchableOpacity>
          ) : (
            <View style={styles.imagesGrid}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 6 && (
                <TouchableOpacity
                  style={styles.addMoreButton}
                  onPress={handlePickImages}
                >
                  <Ionicons name="add" size={24} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Item Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Item Information</Text>
          <View style={styles.form}>
            <Input
              label="Item Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Vintage Denim Jacket, Designer Handbag..."
              style={styles.input}
            />

            <Input
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the item, its condition, why you're selling it, styling tips..."
              multiline
              numberOfLines={3}
              style={styles.input}
            />

            <View style={styles.row}>
              <View style={[styles.halfWidth, styles.halfWidthLeft]}>
                <Input
                  label="Brand"
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="e.g., Zara, H&M, Vintage..."
                  style={styles.input}
                />
              </View>
              <View style={[styles.halfWidth, styles.halfWidthRight]}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.selectContainer}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.selectOption,
                        category === cat && styles.selectOptionActive,
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.selectOptionText,
                          category === cat && styles.selectOptionTextActive,
                        ]}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.thirdWidth, styles.thirdWidthLeft]}>
                <Text style={styles.label}>Size</Text>
                <View style={styles.selectWrapper}>
                  {sizes.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[
                        styles.sizeOption,
                        size === s && styles.sizeOptionActive,
                      ]}
                      onPress={() => setSize(s)}
                    >
                      <Text
                        style={[
                          styles.sizeOptionText,
                          size === s && styles.sizeOptionTextActive,
                        ]}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={[styles.thirdWidth, styles.thirdWidthMiddle]}>
                <Text style={styles.label}>Condition</Text>
                <View style={styles.selectWrapper}>
                  {conditions.map((cond) => (
                    <TouchableOpacity
                      key={cond}
                      style={[
                        styles.conditionOption,
                        condition === cond && styles.conditionOptionActive,
                      ]}
                      onPress={() => setCondition(cond)}
                    >
                      <Text
                        style={[
                          styles.conditionOptionText,
                          condition === cond && styles.conditionOptionTextActive,
                        ]}
                      >
                        {cond === 'like-new' ? 'Like New' : cond.charAt(0).toUpperCase() + cond.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={[styles.thirdWidth, styles.thirdWidthRight]}>
                <Input
                  label="Price (₵)"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  placeholder="25.00"
                  style={styles.input}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Payment & Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment & Contact</Text>
          
          <View style={styles.paymentMethods}>
            <Text style={styles.label}>Payment Methods Accepted</Text>
            <View style={styles.checkboxGrid}>
              {['Mobile Money', 'Cash (In Person)', 'Bank Transfer', 'Price Negotiable'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={styles.checkboxItem}
                  onPress={() => togglePaymentMethod(method)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      paymentMethods.includes(method) && styles.checkboxChecked,
                    ]}
                  >
                    {paymentMethods.includes(method) && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>{method}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Input
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            placeholder="0241234567"
            style={styles.input}
          />

          <Text style={styles.label}>Preferred Meetup Location</Text>
          <View style={styles.selectWrapper}>
            {meetupLocations.map((loc) => (
              <TouchableOpacity
                key={loc}
                style={[
                  styles.locationOption,
                  meetupLocation === loc && styles.locationOptionActive,
                ]}
                onPress={() => setMeetupLocation(loc)}
              >
                <Text
                  style={[
                    styles.locationOptionText,
                    meetupLocation === loc && styles.locationOptionTextActive,
                  ]}
                >
                  {loc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Seller Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Seller Information</Text>
          <View style={styles.sellerCard}>
            <Avatar uri={user?.avatar || ''} size={48} />
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{user?.name || 'Unknown'}</Text>
              <Text style={styles.sellerFaculty}>{user?.faculty || 'No faculty'}</Text>
            </View>
          </View>
        </View>

        {/* Add to Store Button */}
        <TouchableOpacity
          style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!canSave}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={canSave ? ['#16A34A', '#059669'] : ['#D1D5DB', '#9CA3AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.saveButtonGradient}
          >
            <Ionicons name="storefront" size={20} color="white" style={styles.saveButtonIcon} />
            <Text style={styles.saveButtonText}>Add to Store</Text>
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
  section: {
    gap: theme.spacing[3],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#374151',
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[6],
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  uploadTitle: {
    fontSize: theme.typography.fontSize[16],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
    marginBottom: theme.spacing[3],
  },
  uploadButton: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[2],
  },
  uploadButtonText: {
    color: 'white',
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  imageWrapper: {
    width: '30%',
    aspectRatio: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.borderRadius.lg,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addMoreButton: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  form: {
    gap: theme.spacing[4],
  },
  input: {
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing[4],
  },
  halfWidth: {
    flex: 1,
  },
  halfWidthLeft: {
    marginRight: theme.spacing[2],
  },
  halfWidthRight: {
    marginLeft: theme.spacing[2],
  },
  thirdWidth: {
    flex: 1,
  },
  thirdWidthLeft: {
    marginRight: theme.spacing[1],
  },
  thirdWidthMiddle: {
    marginHorizontal: theme.spacing[1],
  },
  thirdWidthRight: {
    marginLeft: theme.spacing[1],
  },
  label: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#374151',
    marginBottom: theme.spacing[2],
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  selectOption: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  selectOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  selectOptionText: {
    fontSize: theme.typography.fontSize[12],
    color: '#374151',
  },
  selectOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeight.medium,
  },
  selectWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  sizeOption: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  sizeOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  sizeOptionText: {
    fontSize: theme.typography.fontSize[12],
    color: '#374151',
  },
  sizeOptionTextActive: {
    color: '#FFFFFF',
  },
  conditionOption: {
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  conditionOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  conditionOptionText: {
    fontSize: theme.typography.fontSize[12],
    color: '#374151',
  },
  conditionOptionTextActive: {
    color: '#FFFFFF',
  },
  paymentMethods: {
    gap: theme.spacing[2],
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    width: '48%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  checkboxLabel: {
    fontSize: theme.typography.fontSize[14],
    color: '#374151',
    flex: 1,
  },
  locationOption: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  locationOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  locationOptionText: {
    fontSize: theme.typography.fontSize[14],
    color: '#374151',
  },
  locationOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeight.medium,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    backgroundColor: '#F9FAFB',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[4],
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
  },
  sellerFaculty: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
    marginTop: 2,
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


import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { useAuth } from '../hooks/useAuth';

const faculties = [
  'Arts & Humanities',
  'Business',
  'Engineering',
  'Science',
  'Medicine',
  'Law',
  'Education',
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username?.replace('@', '') || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [faculty, setFaculty] = useState(user?.faculty || '');
  const [location, setLocation] = useState(user?.location || '');
  const [website, setWebsite] = useState(user?.website || '');

  const handleSave = () => {
    if (!name.trim() || !username.trim()) {
      Alert.alert('Error', 'Name and username are required');
      return;
    }

    Alert.alert('Success', 'Profile updated successfully!');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.handle} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Avatar uri={user?.avatar || ''} size={96} />
            <TouchableOpacity 
              style={styles.changeAvatarButton}
              onPress={() => router.push('/avatar-picker' as any)}
            >
              <Ionicons name="camera" size={12} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        {/* Profile Form */}
        <View style={styles.form}>
          <Input
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your full name"
            style={styles.input}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.usernameContainer}>
              <Text style={styles.usernamePrefix}>@</Text>
              <TextInput
                style={styles.usernameInput}
                value={username}
                onChangeText={setUsername}
                placeholder="username"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={styles.bioInput}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              multiline
              numberOfLines={3}
              maxLength={150}
            />
            <Text style={styles.charCount}>
              {bio.length}/150 characters
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Faculty</Text>
            <View style={styles.selectContainer}>
              <Text style={styles.selectText}>
                {faculty || 'Select Faculty'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="#6B7280" />
            </View>
          </View>

          <Input
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="University of Ghana, Legon"
            style={styles.input}
          />

          <Input
            label="Website"
            value={website}
            onChangeText={setWebsite}
            placeholder="https://yourwebsite.com"
            keyboardType="url"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Cancel"
            onPress={() => router.back()}
            variant="outline"
            size="large"
            style={styles.cancelButton}
          />
          <Button
            title="Save Changes"
            onPress={handleSave}
            variant="primary"
            size="large"
            style={styles.saveButton}
          />
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
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing[6],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing[2],
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  avatarHint: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  form: {
    padding: theme.spacing[4],
    gap: theme.spacing[4],
  },
  input: {
    marginBottom: 0,
  },
  inputGroup: {
    gap: theme.spacing[2],
  },
  label: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#374151',
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: theme.borderRadius.xl,
    backgroundColor: '#FFFFFF',
    paddingLeft: theme.spacing[4],
  },
  usernamePrefix: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
  },
  usernameInput: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    paddingLeft: theme.spacing[2],
    paddingRight: theme.spacing[4],
    fontSize: theme.typography.fontSize[14],
    color: '#111827',
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: theme.borderRadius.xl,
    backgroundColor: '#FFFFFF',
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize[14],
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: theme.typography.fontSize[10],
    color: '#6B7280',
    textAlign: 'right',
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: theme.borderRadius.xl,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  selectText: {
    fontSize: theme.typography.fontSize[14],
    color: '#111827',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    paddingTop: theme.spacing[2],
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});


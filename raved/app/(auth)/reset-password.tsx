import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { authApi } from '../../services/authApi';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await authApi.requestPasswordReset(email);
      Alert.alert('Email Sent', 'Check your email for a reset link.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      const message = e?.response?.data?.error || 'Failed to send reset email. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={20} color={theme.colors.primary} />
        <Text style={styles.title}>Reset Password</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Enter your student email and we’ll send a reset link.
        </Text>

        <Input
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@university.edu"
          leftIcon={<Ionicons name="mail" size={20} color="#9CA3AF" />}
        />

        <Button
          title="Send reset link"
          onPress={handleSubmit}
          variant="primary"
          size="large"
          loading={loading}
          style={{ marginTop: theme.spacing[4] }}
          disabled={!email || loading}
        />

        <Button
          title="Back to Login"
          onPress={() => router.replace('/(auth)/login')}
          variant="secondary"
          size="large"
          style={{ marginTop: theme.spacing[2] }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  content: {
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  subtitle: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
    lineHeight: 20,
  },
});

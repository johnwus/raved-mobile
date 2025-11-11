import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface PasswordResetSheetProps {
  visible: boolean;
  onClose: () => void;
}

export const PasswordResetSheet: React.FC<PasswordResetSheetProps> = ({
  visible,
  onClose,
}) => {
  const [email, setEmail] = useState('');

  const handleReset = () => {
    // TODO: Implement password reset logic
    console.log('Reset password for:', email);
    alert('Password reset link sent! Check your email.');
    setEmail('');
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} height="40%">
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your student email and we'll send a reset link.
        </Text>
        
        <Input
          value={email}
          onChangeText={setEmail}
          placeholder="you@university.edu"
          style={styles.input}
          leftIcon={<Ionicons name="mail" size={20} color="#9CA3AF" />}
        />
        
        <Button
          title="Send reset link"
          onPress={handleReset}
          variant="primary"
          size="large"
          style={styles.button}
          disabled={!email}
        />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  title: {
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
  },
  subtitle: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
    lineHeight: 20,
  },
  input: {
    marginTop: theme.spacing[3],
  },
  button: {
    marginTop: theme.spacing[3],
  },
});


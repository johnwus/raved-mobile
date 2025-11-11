import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../../theme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { RegistrationSheet } from '../../components/sheets/RegistrationSheet';
import { PasswordResetSheet } from '../../components/sheets/PasswordResetSheet';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { Storage } from '../../services/storage';

export default function LoginScreen() {
  const router = useRouter();
  const { login, requiresTwoFactor, verifyTwoFactor } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(identifier, password);
      if (requiresTwoFactor) {
        setShowTwoFactor(true);
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login error:', error);
      // TODO: Show error message to user
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorSubmit = async () => {
    setLoading(true);
    try {
      const pendingUserId = await Storage.get('pendingUserId', '');
      await verifyTwoFactor(pendingUserId, twoFactorCode);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('2FA error:', error);
      // TODO: Show error message to user
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Logo & Title */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Ionicons name="flash" size={28} color={theme.colors.primary} />
              </View>
              <Text style={styles.title}>Raved</Text>
              <Text style={styles.subtitle}>Student Fashion Social Platform</Text>
            </View>

            {/* Login Form */}
            <View style={styles.formContainer}>
              <View style={styles.form}>
                {/* Identifier Input */}
                <Input
                  label="Email, Username, or Phone"
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="alex@gmail.com, @alexjohnson, or 0241234567"
                  leftIcon={<Ionicons name="person" size={20} color="#9CA3AF" />}
                  helperText="You can sign in with your email, username, or phone number"
                />

                {/* Password Input */}
                <View style={styles.passwordContainer}>
                  <Input
                    label="Password"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    leftIcon={<Ionicons name="lock-closed" size={20} color="#9CA3AF" />}
                    rightIcon={
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons 
                          name={showPassword ? "eye-off" : "eye"} 
                          size={20} 
                          color="#9CA3AF" 
                        />
                      </TouchableOpacity>
                    }
                  />
                  <TouchableOpacity onPress={() => setShowResetPassword(true)} style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Remember Me */}
                <View style={styles.rememberMeContainer}>
                  <TouchableOpacity 
                    style={styles.checkboxContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <View style={[
                      styles.checkbox,
                      rememberMe && styles.checkboxChecked
                    ]}>
                      {rememberMe && (
                        <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                      )}
                    </View>
                    <Text style={styles.rememberMeText}>Remember me</Text>
                  </TouchableOpacity>
                </View>

                {/* Sign In Button */}
                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  variant="primary"
                  size="large"
                  style={styles.signInButton}
                  loading={loading}
                />
              </View>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>No account?</Text>
                <TouchableOpacity onPress={() => setShowRegistration(true)}>
                  <Text style={styles.registerLink}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By continuing you agree to our{' '}
                <Text style={styles.termsLink}>Terms</Text> and{' '}
                <Text style={styles.termsLink}>Privacy</Text>.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Registration Sheet */}
      <RegistrationSheet
        visible={showRegistration}
        onClose={() => setShowRegistration(false)}
      />

      {/* Password Reset Sheet */}
      <PasswordResetSheet
        visible={showResetPassword}
        onClose={() => setShowResetPassword(false)}
      />

      {/* 2FA Modal */}
      {showTwoFactor && (
        <View style={styles.twoFactorModal}>
          <View style={styles.twoFactorContent}>
            <Text style={styles.twoFactorTitle}>Enter 2FA Code</Text>
            <Text style={styles.twoFactorSubtitle}>
              We've sent a verification code to your phone
            </Text>
            <Input
              label="Verification Code"
              value={twoFactorCode}
              onChangeText={setTwoFactorCode}
              placeholder="Enter 6-digit code"
            />
            <Button
              title="Verify"
              onPress={handleTwoFactorSubmit}
              variant="primary"
              size="large"
              loading={loading}
              style={styles.verifyButton}
            />
            <TouchableOpacity onPress={() => setShowTwoFactor(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc', // slate-50
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[8],
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing[8],
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: `${theme.colors.primary}20`, // 20% opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  title: {
    fontSize: theme.typography.fontSize[30],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: '#111827', // gray-900
    marginBottom: theme.spacing[1],
  },
  subtitle: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280', // gray-500
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[5],
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: theme.spacing[6],
  },
  form: {
    gap: theme.spacing[4],
  },
  passwordContainer: {
    gap: theme.spacing[2],
  },
  forgotPassword: {
    alignSelf: 'flex-start',
  },
  forgotPasswordText: {
    fontSize: theme.typography.fontSize[12],
    color: theme.colors.primary,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    marginRight: theme.spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  rememberMeText: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280', // gray-500
  },
  signInButton: {
    width: '100%',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing[4],
  },
  registerText: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280', // gray-500
    marginRight: theme.spacing[1],
  },
  registerLink: {
    fontSize: theme.typography.fontSize[14],
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  termsContainer: {
    alignItems: 'center',
  },
  termsText: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280', // gray-500
    textAlign: 'center',
  },
  termsLink: {
    textDecorationLine: 'underline',
  },
  twoFactorModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  twoFactorContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[5],
    margin: theme.spacing[5],
    width: '90%',
    maxWidth: 400,
  },
  twoFactorTitle: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  twoFactorSubtitle: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: theme.spacing[4],
  },
  verifyButton: {
    width: '100%',
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  cancelText: {
    fontSize: theme.typography.fontSize[14],
    color: theme.colors.primary,
    textAlign: 'center',
  },
});


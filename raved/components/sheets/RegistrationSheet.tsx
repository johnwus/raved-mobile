import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { validateUsername, validateEmail, validatePhone, calculatePasswordStrength } from '../../utils/validation';
import { useAuth } from '../../hooks/useAuth';

interface RegistrationSheetProps {
  visible: boolean;
  onClose: () => void;
}

type RegistrationStep = 1 | 2 | 3 | 4 | 5 | 6;

export const RegistrationSheet: React.FC<RegistrationSheetProps> = ({
  visible,
  onClose,
}) => {
  const router = useRouter();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    emailCode: '',
    phoneCode: '',
    emailVerified: false,
    phoneVerified: false,
    university: '',
    studentId: '',
    faculty: '',
    password: '',
    confirmPassword: '',
    agreedToTerms: false,
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => (prev + 1) as RegistrationStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as RegistrationStep);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      phone: '',
      emailCode: '',
      phoneCode: '',
      emailVerified: false,
      phoneVerified: false,
      university: '',
      studentId: '',
      faculty: '',
      password: '',
      confirmPassword: '',
      agreedToTerms: false,
    });
    onClose();
  };

  const handleCreateAccount = async () => {
    try {
      await register(formData);
      handleClose();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const progressPercentage = (currentStep / 6) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1 onNext={nextStep} onClose={handleClose} />;
      case 2:
        return (
          <Step2
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <Step3
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <Step4
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <Step5
            data={formData}
            updateData={updateFormData}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 6:
        return (
          <Step6
            data={formData}
            updateData={updateFormData}
            onBack={prevStep}
            onClose={handleCreateAccount}
          />
        );
      default:
        return null;
    }
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose} height="95%">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {currentStep > 1 && (
              <TouchableOpacity onPress={prevStep} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#6B7280" />
              </TouchableOpacity>
            )}
            <View style={styles.headerTitle}>
              <Text style={styles.title}>
                {currentStep === 1 ? 'Create Account' : getStepTitle(currentStep)}
              </Text>
              <Text style={styles.subtitle}>
                {currentStep === 1 ? 'Join the Raved community' : getStepSubtitle(currentStep)}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressStep}>
                Step {currentStep} of 6
              </Text>
              <Text style={styles.progressPercent}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {renderStep()}
        </ScrollView>
      </View>
    </BottomSheet>
  );
};

const getStepTitle = (step: RegistrationStep): string => {
  const titles: Record<RegistrationStep, string> = {
    1: 'Welcome to Raved',
    2: 'Personal Information',
    3: 'Contact Information',
    4: 'Verify Your Account',
    5: 'Academic Information',
    6: 'Secure Your Account',
  };
  return titles[step];
};

const getStepSubtitle = (step: RegistrationStep): string => {
  const subtitles: Record<RegistrationStep, string> = {
    1: 'Join the fashion community',
    2: 'Tell us about yourself',
    3: 'How can we reach you?',
    4: 'Confirm your email and phone number',
    5: 'Connect with your campus community',
    6: 'Create a strong password and agree to our terms',
  };
  return subtitles[step];
};

// Step 1: Welcome
const Step1: React.FC<{ onNext: () => void; onClose: () => void }> = ({ onNext, onClose }) => {
  return (
    <View style={stepStyles.container}>
      <View style={stepStyles.content}>
        <View style={stepStyles.iconContainer}>
          <View style={stepStyles.welcomeIcon}>
            <Ionicons name="sparkles" size={32} color="#FFFFFF" />
          </View>
        </View>
        
        <Text style={stepStyles.welcomeTitle}>Welcome to Raved!</Text>
        <Text style={stepStyles.welcomeSubtitle}>
          Join Ghana's premier campus fashion community
        </Text>

        <View style={stepStyles.features}>
          <View style={stepStyles.feature}>
            <View style={[stepStyles.featureIcon, { backgroundColor: '#8B5CF6' }]}>
              <Ionicons name="people" size={20} color="#FFFFFF" />
            </View>
            <View style={stepStyles.featureText}>
              <Text style={stepStyles.featureTitle}>Connect with Fashion Lovers</Text>
              <Text style={stepStyles.featureDescription}>
                Share your style and discover trends
              </Text>
            </View>
          </View>

          <View style={stepStyles.feature}>
            <View style={[stepStyles.featureIcon, { backgroundColor: '#10B981' }]}>
              <Ionicons name="bag" size={20} color="#FFFFFF" />
            </View>
            <View style={stepStyles.featureText}>
              <Text style={stepStyles.featureTitle}>Buy & Sell Fashion Items</Text>
              <Text style={stepStyles.featureDescription}>
                Campus marketplace for students
              </Text>
            </View>
          </View>

          <View style={stepStyles.feature}>
            <View style={[stepStyles.featureIcon, { backgroundColor: '#F59E0B' }]}>
              <Ionicons name="trophy" size={20} color="#FFFFFF" />
            </View>
            <View style={stepStyles.featureText}>
              <Text style={stepStyles.featureTitle}>Compete for Prizes</Text>
              <Text style={stepStyles.featureDescription}>
                Win cash rewards monthly
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={stepStyles.actions}>
        <Button
          title="Get Started"
          onPress={onNext}
          variant="primary"
          size="large"
          style={stepStyles.primaryButton}
          leftIcon={<Ionicons name="rocket" size={20} color="#FFFFFF" />}
        />
        
        <View style={stepStyles.loginContainer}>
          <Text style={stepStyles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={stepStyles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Step 2: Personal Information
const Step2: React.FC<{
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, updateData, onNext, onBack }) => {
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);

  const validateUsernameField = (username: string) => {
    const result = validateUsername(username);
    setUsernameValid(result.valid);
    return result.valid;
  };

  const isStepValid = data.firstName && data.lastName && usernameValid;

  return (
    <View style={stepStyles.container}>
      <View style={stepStyles.content}>
        <View style={stepStyles.stepHeader}>
          <View style={[stepStyles.stepIcon, { backgroundColor: '#3B82F6' }]}>
            <Ionicons name="person" size={24} color="#FFFFFF" />
          </View>
          <Text style={stepStyles.stepTitle}>Personal Information</Text>
          <Text style={stepStyles.stepSubtitle}>Tell us about yourself</Text>
        </View>

        <View style={stepStyles.form}>
          <View style={stepStyles.nameRow}>
            <View style={stepStyles.nameInput}>
              <Input
                label="First Name *"
                value={data.firstName}
                onChangeText={(text) => updateData({ firstName: text })}
                placeholder="Alex"
              />
            </View>
            <View style={stepStyles.nameInput}>
              <Input
                label="Last Name *"
                value={data.lastName}
                onChangeText={(text) => updateData({ lastName: text })}
                placeholder="Johnson"
              />
            </View>
          </View>

          <Input
            label="Username *"
            value={data.username}
            onChangeText={(text) => {
              updateData({ username: text });
              if (text.length > 0) {
                validateUsernameField(text);
              } else {
                setUsernameValid(null);
              }
            }}
            placeholder="alexjohnson"
            leftIcon={<Text style={stepStyles.atSymbol}>@</Text>}
            rightIcon={
              usernameValid !== null && (
                <Ionicons
                  name={usernameValid ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={usernameValid ? '#10B981' : '#EF4444'}
                />
              )
            }
            helperText="Choose a unique username (3-20 characters, letters, numbers, underscore)"
          />

          <View style={stepStyles.infoBox}>
            <Ionicons name="bulb" size={20} color="#3B82F6" />
            <View style={stepStyles.infoText}>
              <Text style={stepStyles.infoTitle}>
                Your username is your unique identity
              </Text>
              <Text style={stepStyles.infoDescription}>
                This is how other users will find and mention you on Raved. Choose something memorable!
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={stepStyles.actions}>
        <Button
          title="Back"
          onPress={onBack}
          variant="secondary"
          size="large"
          style={stepStyles.button}
          leftIcon={<Ionicons name="arrow-back" size={16} color="#374151" />}
        />
        <Button
          title="Next"
          onPress={onNext}
          variant="primary"
          size="large"
          style={stepStyles.button}
          disabled={!isStepValid}
          rightIcon={<Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
};

// Step 3: Contact Information
const Step3: React.FC<{
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, updateData, onNext, onBack }) => {
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);

  const validateEmailField = (email: string) => {
    const result = validateEmail(email);
    setEmailValid(result.valid);
    return result.valid;
  };

  const validatePhoneField = (phone: string) => {
    const result = validatePhone(phone);
    setPhoneValid(result.valid);
    return result.valid;
  };

  const isStepValid = emailValid && phoneValid;

  return (
    <View style={stepStyles.container}>
      <View style={stepStyles.content}>
        <View style={stepStyles.stepHeader}>
          <View style={[stepStyles.stepIcon, { backgroundColor: '#10B981' }]}>
            <Ionicons name="mail" size={24} color="#FFFFFF" />
          </View>
          <Text style={stepStyles.stepTitle}>Contact Information</Text>
          <Text style={stepStyles.stepSubtitle}>How can we reach you?</Text>
        </View>

        <View style={stepStyles.form}>
          <Input
            label="Email Address *"
            value={data.email}
            onChangeText={(text) => {
              updateData({ email: text });
              if (text.length > 0) {
                validateEmailField(text);
              } else {
                setEmailValid(null);
              }
            }}
            placeholder="alex.johnson@gmail.com"
            leftIcon={<Ionicons name="mail" size={20} color="#9CA3AF" />}
            rightIcon={
              emailValid !== null && (
                <Ionicons
                  name={emailValid ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={emailValid ? '#10B981' : '#EF4444'}
                />
              )
            }
            helperText="We'll send a verification code to this email"
          />

          <Input
            label="Phone Number *"
            value={data.phone}
            onChangeText={(text) => {
              updateData({ phone: text });
              if (text.length > 0) {
                validatePhoneField(text);
              } else {
                setPhoneValid(null);
              }
            }}
            placeholder="0241234567"
            leftIcon={<Ionicons name="call" size={20} color="#9CA3AF" />}
            rightIcon={
              phoneValid !== null && (
                <Ionicons
                  name={phoneValid ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={phoneValid ? '#10B981' : '#EF4444'}
                />
              )
            }
            helperText="We'll send a verification SMS to this number"
          />

          <View style={[stepStyles.infoBox, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="shield-checkmark" size={20} color="#16A34A" />
            <View style={stepStyles.infoText}>
              <Text style={[stepStyles.infoTitle, { color: '#166534' }]}>
                Secure & Private
              </Text>
              <Text style={[stepStyles.infoDescription, { color: '#166534' }]}>
                Your contact information is encrypted and will only be used for account security and important notifications.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={stepStyles.actions}>
        <Button
          title="Back"
          onPress={onBack}
          variant="secondary"
          size="large"
          style={stepStyles.button}
          leftIcon={<Ionicons name="arrow-back" size={16} color="#374151" />}
        />
        <Button
          title="Next"
          onPress={onNext}
          variant="primary"
          size="large"
          style={stepStyles.button}
          disabled={!isStepValid}
          rightIcon={<Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
};

// Step 4: Verification (simplified for now)
const Step4: React.FC<{
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, updateData, onNext, onBack }) => {
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');

  const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleSendEmailCode = () => {
    const code = generateCode();
    console.log('Email verification code:', code);
    alert(`Demo Mode: Email verification code is ${code}\n\nIn production, this would be sent to ${data.email}`);
    setEmailCodeSent(true);
  };

  const handleSendPhoneCode = () => {
    const code = generateCode();
    console.log('SMS verification code:', code);
    alert(`Demo Mode: SMS verification code is ${code}\n\nIn production, this would be sent to ${data.phone}`);
    setPhoneCodeSent(true);
  };

  const verifyEmailCode = () => {
    // Mock verification - in real app, verify against server
    setEmailVerified(true);
    updateData({ emailVerified: true });
  };

  const verifyPhoneCode = () => {
    // Mock verification - in real app, verify against server
    setPhoneVerified(true);
    updateData({ phoneVerified: true });
  };

  const isStepValid = emailVerified && phoneVerified;

  return (
    <View style={stepStyles.container}>
      <View style={stepStyles.content}>
        <View style={stepStyles.stepHeader}>
          <View style={[stepStyles.stepIcon, { backgroundColor: '#F59E0B' }]}>
            <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
          </View>
          <Text style={stepStyles.stepTitle}>Verify Your Account</Text>
          <Text style={stepStyles.stepSubtitle}>Confirm your email and phone number</Text>
        </View>

        <View style={stepStyles.form}>
          {/* Email Verification */}
          <View style={stepStyles.verificationSection}>
            <View style={stepStyles.verificationHeader}>
              <View style={stepStyles.verificationTitle}>
                <Ionicons name="mail" size={20} color={theme.colors.primary} />
                <Text style={stepStyles.verificationLabel}>Email Verification</Text>
                {emailVerified && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
              </View>
            </View>
            
            <View style={stepStyles.verificationInfo}>
              <Text style={stepStyles.verificationText}>
                We'll send a verification code to: {' '}
                <Text style={stepStyles.verificationEmail}>{data.email}</Text>
              </Text>
            </View>

            <View style={stepStyles.codeInputRow}>
              <TextInput
                style={[
                  stepStyles.codeInput,
                  emailVerified && stepStyles.codeInputVerified
                ]}
                value={emailCode}
                onChangeText={setEmailCode}
                placeholder="123456"
                maxLength={6}
                keyboardType="number-pad"
                editable={!emailVerified}
                textAlign="center"
                placeholderTextColor="#9CA3AF"
              />
              <Button
                title={emailCodeSent ? "Resend Code" : "Send Code"}
                onPress={handleSendEmailCode}
                variant={emailVerified ? "secondary" : "primary"}
                size="medium"
                disabled={emailVerified}
                style={stepStyles.codeButton}
              />
            </View>
            {emailCode.length === 6 && !emailVerified && (
              <TouchableOpacity onPress={verifyEmailCode} style={stepStyles.verifyButton}>
                <Text style={stepStyles.verifyButtonText}>Verify Code</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Phone Verification */}
          <View style={stepStyles.verificationSection}>
            <View style={stepStyles.verificationHeader}>
              <View style={stepStyles.verificationTitle}>
                <Ionicons name="call" size={20} color={theme.colors.primary} />
                <Text style={stepStyles.verificationLabel}>Phone Verification</Text>
                {phoneVerified && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
              </View>
            </View>
            
            <View style={stepStyles.verificationInfo}>
              <Text style={stepStyles.verificationText}>
                We'll send an SMS code to: {' '}
                <Text style={stepStyles.verificationEmail}>{data.phone}</Text>
              </Text>
            </View>

            <View style={stepStyles.codeInputRow}>
              <TextInput
                style={[
                  stepStyles.codeInput,
                  phoneVerified && stepStyles.codeInputVerified
                ]}
                value={phoneCode}
                onChangeText={setPhoneCode}
                placeholder="123456"
                maxLength={6}
                keyboardType="number-pad"
                editable={!phoneVerified}
                textAlign="center"
                placeholderTextColor="#9CA3AF"
              />
              <Button
                title={phoneCodeSent ? "Resend SMS" : "Send SMS"}
                onPress={handleSendPhoneCode}
                variant={phoneVerified ? "secondary" : "primary"}
                size="medium"
                disabled={phoneVerified}
                style={stepStyles.codeButton}
              />
            </View>
            {phoneCode.length === 6 && !phoneVerified && (
              <TouchableOpacity onPress={verifyPhoneCode} style={stepStyles.verifyButton}>
                <Text style={stepStyles.verifyButtonText}>Verify Code</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[stepStyles.infoBox, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="information-circle" size={20} color="#D97706" />
            <View style={stepStyles.infoText}>
              <Text style={[stepStyles.infoTitle, { color: '#92400E' }]}>
                Demo Mode
              </Text>
              <Text style={[stepStyles.infoDescription, { color: '#92400E' }]}>
                For demonstration, verification codes will be displayed in alerts. 
                In production, real SMS and email services would be used.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={stepStyles.actions}>
        <Button
          title="Back"
          onPress={onBack}
          variant="secondary"
          size="large"
          style={stepStyles.button}
          leftIcon={<Ionicons name="arrow-back" size={16} color="#374151" />}
        />
        <Button
          title="Next"
          onPress={onNext}
          variant="primary"
          size="large"
          style={stepStyles.button}
          disabled={!isStepValid}
          rightIcon={<Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
};

// Step 5: Academic Information
const Step5: React.FC<{
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, updateData, onNext, onBack }) => {
  const faculties = [
    'Business',
    'Engineering',
    'Arts',
    'Science',
    'Medicine',
    'Law',
    'Education',
    'Social Sciences',
    'Other',
  ];

  return (
    <View style={stepStyles.container}>
      <View style={stepStyles.content}>
        <View style={stepStyles.stepHeader}>
          <View style={[stepStyles.stepIcon, { backgroundColor: '#8B5CF6' }]}>
            <Ionicons name="school" size={24} color="#FFFFFF" />
          </View>
          <Text style={stepStyles.stepTitle}>Academic Information</Text>
          <Text style={stepStyles.stepSubtitle}>
            Optional - Help us connect you with your campus community
          </Text>
        </View>

        <View style={stepStyles.form}>
          <View style={[stepStyles.infoBox, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="information-circle" size={20} color="#1E40AF" />
            <View style={stepStyles.infoText}>
              <Text style={[stepStyles.infoTitle, { color: '#1E3A8A' }]}>
                University Integration Coming Soon!
              </Text>
              <Text style={[stepStyles.infoDescription, { color: '#1E3A8A' }]}>
                These fields are optional for now. Full university integration will be available 
                once we partner with your institution.
              </Text>
            </View>
          </View>

          <Input
            label="University"
            value={data.university}
            onChangeText={(text) => updateData({ university: text })}
            placeholder="University of Ghana"
          />

          <Input
            label="Student ID"
            value={data.studentId}
            onChangeText={(text) => updateData({ studentId: text })}
            placeholder="20230001"
          />

          <View style={stepStyles.facultyGrid}>
            {faculties.map((faculty) => (
              <TouchableOpacity
                key={faculty}
                style={[
                  stepStyles.facultyOption,
                  data.faculty === faculty && stepStyles.facultyOptionSelected
                ]}
                onPress={() => updateData({ faculty })}
              >
                <Text style={[
                  stepStyles.facultyText,
                  data.faculty === faculty && stepStyles.facultyTextSelected
                ]}>
                  {faculty}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={stepStyles.actions}>
        <Button
          title="Back"
          onPress={onBack}
          variant="secondary"
          size="large"
          style={stepStyles.button}
          leftIcon={<Ionicons name="arrow-back" size={16} color="#374151" />}
        />
        <Button
          title="Next"
          onPress={onNext}
          variant="primary"
          size="large"
          style={stepStyles.button}
          rightIcon={<Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
};

// Step 6: Security & Terms
const Step6: React.FC<{
  data: any;
  updateData: (data: any) => void;
  onBack: () => void;
  onClose: () => void;
}> = ({ data, updateData, onBack, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

  const handlePasswordChange = (text: string) => {
    updateData({ password: text });
    const strength = calculatePasswordStrength(text);
    setPasswordStrength(strength.strength);
    
    if (data.confirmPassword) {
      setPasswordMatch(text === data.confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    updateData({ confirmPassword: text });
    setPasswordMatch(data.password === text);
  };

  const isStepValid = 
    data.password && 
    data.confirmPassword && 
    passwordStrength >= 3 && 
    passwordMatch === true && 
    data.agreedToTerms;

  const strengthInfo = calculatePasswordStrength(data.password);

  return (
    <View style={stepStyles.container}>
      <View style={stepStyles.content}>
        <View style={stepStyles.stepHeader}>
          <View style={[stepStyles.stepIcon, { backgroundColor: '#EF4444' }]}>
            <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
          </View>
          <Text style={stepStyles.stepTitle}>Secure Your Account</Text>
          <Text style={stepStyles.stepSubtitle}>
            Create a strong password and agree to our terms
          </Text>
        </View>

        <View style={stepStyles.form}>
          {/* Password Input */}
          <View style={stepStyles.passwordSection}>
            <Input
              label="Password *"
              value={data.password}
              onChangeText={handlePasswordChange}
              placeholder="Create a strong password"
              secureTextEntry={!showPassword}
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
            
            {/* Password Strength Indicator */}
            {data.password && (
              <View style={stepStyles.strengthContainer}>
                <View style={stepStyles.strengthBars}>
                  {[1, 2, 3, 4].map((index) => (
                    <View
                      key={index}
                      style={[
                        stepStyles.strengthBar,
                        index <= passwordStrength && {
                          backgroundColor: strengthInfo.color
                        }
                      ]}
                    />
                  ))}
                </View>
                <Text style={[
                  stepStyles.strengthText,
                  { color: strengthInfo.color }
                ]}>
                  {strengthInfo.text}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View style={stepStyles.passwordSection}>
            <Input
              label="Confirm Password *"
              value={data.confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              }
            />
            
            {/* Password Match Indicator */}
            {data.confirmPassword && (
              <View style={stepStyles.matchContainer}>
                <Ionicons
                  name={passwordMatch ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={passwordMatch ? '#10B981' : '#EF4444'}
                />
                <Text style={[
                  stepStyles.matchText,
                  { color: passwordMatch ? '#10B981' : '#EF4444' }
                ]}>
                  {passwordMatch ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            )}
          </View>

          {/* Password Requirements */}
          <View style={[stepStyles.infoBox, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="shield-checkmark" size={20} color="#DC2626" />
            <View style={stepStyles.infoText}>
              <Text style={[stepStyles.infoTitle, { color: '#991B1B' }]}>
                Password Requirements
              </Text>
              <View style={stepStyles.requirementsList}>
                <Text style={[stepStyles.requirement, { 
                  color: data.password?.length >= 8 ? '#16A34A' : '#991B1B' 
                }]}>
                  • At least 8 characters long
                </Text>
                <Text style={[stepStyles.requirement, { 
                  color: /[a-z]/.test(data.password) && /[A-Z]/.test(data.password) ? '#16A34A' : '#991B1B' 
                }]}>
                  • Include uppercase and lowercase letters
                </Text>
                <Text style={[stepStyles.requirement, { 
                  color: /\d/.test(data.password) ? '#16A34A' : '#991B1B' 
                }]}>
                  • Include at least one number
                </Text>
                <Text style={[stepStyles.requirement, { 
                  color: /[!@#$%^&*(),.?":{}|<>]/.test(data.password) ? '#16A34A' : '#991B1B' 
                }]}>
                  • Include at least one special character
                </Text>
              </View>
            </View>
          </View>

          {/* Terms Agreement */}
          <View style={[stepStyles.infoBox, { backgroundColor: '#F3F4F6' }]}>
            <View style={stepStyles.termsContainer}>
              <TouchableOpacity 
                style={stepStyles.termsCheckbox}
                onPress={() => updateData({ agreedToTerms: !data.agreedToTerms })}
              >
                <View style={[
                  stepStyles.checkbox,
                  data.agreedToTerms && stepStyles.checkboxChecked
                ]}>
                  {data.agreedToTerms && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={stepStyles.termsText}>
                  I agree to the{' '}
                  <Text style={stepStyles.termsLink}>Terms of Service</Text>{' '}
                  and{' '}
                  <Text style={stepStyles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              <Text style={stepStyles.termsNote}>
                By creating an account, you agree to our terms and confirm you're 13 or older.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={stepStyles.actions}>
        <Button
          title="Back"
          onPress={onBack}
          variant="secondary"
          size="large"
          style={stepStyles.button}
          leftIcon={<Ionicons name="arrow-back" size={16} color="#374151" />}
        />
        <Button
          title="Create Account"
          onPress={onClose}
          variant="primary"
          size="large"
          style={stepStyles.button}
          disabled={!isStepValid}
          leftIcon={<Ionicons name="person-add" size={16} color="#FFFFFF" />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[4],
  },
  backButton: {
    padding: theme.spacing[2],
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  closeButton: {
    padding: theme.spacing[2],
  },
  progressContainer: {
    marginBottom: theme.spacing[4],
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing[2],
  },
  progressStep: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
    fontWeight: theme.typography.fontWeight.medium,
  },
  progressPercent: {
    fontSize: theme.typography.fontSize[12],
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: theme.spacing[4],
  },
});

const stepStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginTop: theme.spacing[8],
  },
  button: {
    flex: 1,
  },
  primaryButton: {
    width: '100%',
  },
  
  // Step 1 Styles
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: theme.typography.fontSize[24],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  welcomeSubtitle: {
    fontSize: theme.typography.fontSize[16],
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },
  features: {
    gap: theme.spacing[4],
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.xl,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing[3],
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
    color: '#111827',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing[4],
  },
  loginText: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
  },
  loginLink: {
    fontSize: theme.typography.fontSize[14],
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Step 2+ Styles
  stepHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing[6],
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  stepTitle: {
    fontSize: theme.typography.fontSize[20],
    fontWeight: theme.typography.fontWeight.bold,
    color: '#111827',
    marginBottom: theme.spacing[1],
  },
  stepSubtitle: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
  },
  form: {
    gap: theme.spacing[4],
  },
  nameRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  nameInput: {
    flex: 1,
  },
  atSymbol: {
    fontSize: theme.typography.fontSize[16],
    color: '#9CA3AF',
    fontWeight: theme.typography.fontWeight.medium,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.xl,
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
    lineHeight: 16,
  },
  
  // Step 4: Verification Styles
  verificationSection: {
    marginBottom: theme.spacing[6],
  },
  verificationHeader: {
    marginBottom: theme.spacing[3],
  },
  verificationTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  verificationLabel: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#374151',
    flex: 1,
  },
  verificationInfo: {
    backgroundColor: '#F9FAFB',
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing[3],
  },
  verificationText: {
    fontSize: theme.typography.fontSize[14],
    color: '#6B7280',
  },
  verificationEmail: {
    fontWeight: theme.typography.fontWeight.medium,
    color: '#111827',
  },
  codeInputRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    alignItems: 'center',
  },
  codeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[3],
    fontSize: theme.typography.fontSize[18],
    fontWeight: theme.typography.fontWeight.medium,
    backgroundColor: '#FFFFFF',
  },
  codeInputVerified: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
    color: '#166534',
  },
  codeButton: {
    minWidth: 120,
  },
  verifyButton: {
    marginTop: theme.spacing[2],
    padding: theme.spacing[2],
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  
  // Step 5: Academic Information Styles
  facultyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  facultyOption: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[3],
    minWidth: '30%',
  },
  facultyOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  facultyText: {
    fontSize: theme.typography.fontSize[14],
    color: '#374151',
    textAlign: 'center',
  },
  facultyTextSelected: {
    color: '#FFFFFF',
    fontWeight: theme.typography.fontWeight.medium,
  },
  
  // Step 6: Security & Terms Styles
  passwordSection: {
    marginBottom: theme.spacing[4],
  },
  strengthContainer: {
    marginTop: theme.spacing[2],
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: theme.spacing[1],
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.medium,
  },
  matchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
    marginTop: theme.spacing[1],
  },
  matchText: {
    fontSize: theme.typography.fontSize[12],
    fontWeight: theme.typography.fontWeight.medium,
  },
  requirementsList: {
    marginTop: theme.spacing[2],
  },
  requirement: {
    fontSize: theme.typography.fontSize[12],
    lineHeight: 16,
    marginBottom: theme.spacing[1],
  },
  termsContainer: {
    width: '100%',
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing[2],
  },
  termsText: {
    flex: 1,
    fontSize: theme.typography.fontSize[14],
    color: '#374151',
    lineHeight: 20,
    marginLeft: theme.spacing[2],
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  termsNote: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280',
    lineHeight: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.base,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
});


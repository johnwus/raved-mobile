import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { theme } from '../../theme';

interface InputProps extends Omit<TextInputProps, 'style' | 'onChangeText' | 'value'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  style,
  inputStyle,
  ...rest
}) => {
  return (
    <View style={style}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      <View style={[
        styles.inputContainer,
        error && styles.inputContainerError,
      ]}>
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF" // gray-400
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          {...rest}
        />
        
        {rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {(error || helperText) && (
        <Text style={[
          styles.helperText,
          error && styles.helperTextError,
        ]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: theme.typography.fontSize[14],
    fontWeight: theme.typography.fontWeight.medium,
    color: '#374151', // gray-700
    marginBottom: theme.spacing[2],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: theme.borderRadius.xl,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing[4],
  },
  inputContainerError: {
    borderColor: '#EF4444', // red-500
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    fontSize: theme.typography.fontSize[16],
    color: '#111827', // gray-900
  },
  multilineInput: {
    textAlignVertical: 'top',
  },
  leftIcon: {
    marginRight: theme.spacing[2],
  },
  rightIcon: {
    marginLeft: theme.spacing[2],
  },
  helperText: {
    fontSize: theme.typography.fontSize[12],
    color: '#6B7280', // gray-500
    marginTop: theme.spacing[1],
  },
  helperTextError: {
    color: '#EF4444', // red-500
  },
});


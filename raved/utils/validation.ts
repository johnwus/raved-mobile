// Validation utilities matching HTML prototype

export const validateUsername = (username: string): { valid: boolean; message?: string } => {
  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters' };
  }
  if (username.length > 20) {
    return { valid: false, message: 'Username must be less than 20 characters' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  return { valid: true };
};

export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  return { valid: true };
};

export const validatePhone = (phone: string): { valid: boolean; message?: string } => {
  // Ghana phone number format: 0XXXXXXXXX
  const phoneRegex = /^0[234567][0-9]{8}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: 'Please enter a valid Ghana phone number (e.g., 0241234567)' };
  }
  return { valid: true };
};

export const calculatePasswordStrength = (password: string): { strength: number; text: string; color: string } => {
  let strength = 0;
  
  if (password.length >= 8) strength += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
  
  const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];
  
  return {
    strength,
    text: texts[strength] || 'Very Weak',
    color: colors[strength] || '#EF4444',
  };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};


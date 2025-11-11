import api from './api';

export interface LoginData {
  identifier: string; // email or phone
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  faculty: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}

export interface SMSResetData {
  phone: string;
  code: string;
  newPassword: string;
}

export const authApi = {
  // Login
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Registration
  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Email Verification
  sendEmailVerification: async () => {
    const response = await api.post('/auth/send-verification-email');
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  // Password Reset
  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data: ResetPasswordData) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  // SMS Verification
  sendSMSVerification: async () => {
    const response = await api.post('/auth/send-sms-verification');
    return response.data;
  },

  verifySMSCode: async (code: string) => {
    const response = await api.post('/auth/verify-sms-code', { code });
    return response.data;
  },

  // SMS Password Reset
  requestSMSPasswordReset: async (phone: string) => {
    const response = await api.post('/auth/sms-forgot-password', { phone });
    return response.data;
  },

  resetPasswordWithSMS: async (data: SMSResetData) => {
    const response = await api.post('/auth/sms-reset-password', data);
    return response.data;
  },

  // Two-Factor Authentication
  enableSMSTwoFactor: async () => {
    const response = await api.post('/auth/enable-sms-2fa');
    return response.data;
  },

  disableSMSTwoFactor: async () => {
    const response = await api.post('/auth/disable-sms-2fa');
    return response.data;
  },

  sendSMSTwoFactorCode: async (userId: string) => {
    const response = await api.post('/auth/send-sms-2fa-code', { userId });
    return response.data;
  },

  verifySMSTwoFactorCode: async (userId: string, code: string) => {
    const response = await api.post('/auth/verify-sms-2fa-code', { userId, code });
    return response.data;
  },

  // Token Refresh
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

export default authApi;
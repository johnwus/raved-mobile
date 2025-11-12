import axios from 'axios';

const API_BASE_URL = __DEV__
  ? (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000') + '/api/v1' // Use ENV or localhost in dev
  : 'https://api.raved.com/api/v1'; // Production URL with API version

const apiPublic = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiPublic;

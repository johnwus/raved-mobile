import axios from 'axios';

const API_BASE_URL = __DEV__
  ? 'http://192.168.100.28:3000/api/v1' // Development URL - use local network IP for Expo access
  : 'https://api.raved.com/api/v1'; // Production URL with API version

const apiPublic = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiPublic;

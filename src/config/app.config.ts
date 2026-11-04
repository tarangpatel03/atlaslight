import Config from 'react-native-config';
import { API_BASE_PATH } from '@/api/routes';

/**
 * Reads the API address from the root .env file through react-native-config (see .env.example).
 * Release builds must use https://; plain HTTP is allowed in debug builds only.
 */
const resolveApiUrl = (): string => {
  const url = Config.API_URL;
  if (!url) {
    throw new Error('API_URL is missing. Copy .env.example to .env, set it and rebuild the app.');
  }
  if (!__DEV__ && !url.startsWith('https://')) {
    throw new Error('API_URL must be an https:// address in release builds.');
  }
  return url.replace(/\/+$/, '');
};

export const appConfig = {
  apiBaseUrl: `${resolveApiUrl()}${API_BASE_PATH}`,
};

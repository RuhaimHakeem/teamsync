import * as SecureStore from 'expo-secure-store';
import type { AuthResponse } from '../types';

const ACCESS_TOKEN_KEY = 'teamsync_access_token';
const REFRESH_TOKEN_KEY = 'teamsync_refresh_token';

export async function saveTokens(auth: Pick<AuthResponse, 'accessToken' | 'refreshToken'>) {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, auth.accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, auth.refreshToken);
}

export async function getAccessToken() {
  return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

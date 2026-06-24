import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

const PUSH_TOKEN_KEY = 'teamsync_push_token';

export async function registerForPushNotifications() {
  try {
    const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();
    if (!projectId || projectId === 'replace-with-your-eas-project-id') {
      console.log(
        'Push notification registration skipped: set EXPO_PUBLIC_EAS_PROJECT_ID in apps/mobile/.env.',
      );
      return;
    }

    const current = (await Notifications.getPermissionsAsync()) as unknown as {
      granted?: boolean;
      status?: string;
    };
    let isGranted = current.granted ?? current.status === 'granted';

    if (!isGranted) {
      const requested = (await Notifications.requestPermissionsAsync()) as unknown as {
        granted?: boolean;
        status?: string;
      };
      isGranted = requested.granted ?? requested.status === 'granted';
    }

    if (!isGranted) {
      console.log('Push notification permission not granted');
      return;
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('Expo push token:', token.data);
    await SecureStore.setItemAsync(PUSH_TOKEN_KEY, token.data);
  } catch (error) {
    console.log('Push notification registration failed:', error);
  }
}

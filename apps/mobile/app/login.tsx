import { useRouter } from 'expo-router';
import { useState } from 'react';
import { login } from '../src/lib/api';
import { saveTokens } from '../src/lib/authStorage';
import { clearCachedTasks } from '../src/lib/taskCache';
import { registerForPushNotifications } from '../src/lib/notifications';
import { LoginScreen } from '../src/screens/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  async function handleLogin(email: string, password: string) {
    setLoginError('');

    if (!email.trim() || !password.trim()) {
      setLoginError('Email and password are required.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const auth = await login(email, password);
      await saveTokens(auth);
      await clearCachedTasks();
      await registerForPushNotifications();
      router.replace('/dashboard');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setIsLoggingIn(false);
    }
  }

  return (
    <LoginScreen
      error={loginError}
      isLoggingIn={isLoggingIn}
      onLogin={(email, password) => void handleLogin(email, password)}
    />
  );
}

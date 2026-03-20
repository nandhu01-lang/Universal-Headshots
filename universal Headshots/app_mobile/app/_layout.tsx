import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState, useRef } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';
import { authService } from '../services/authService';
import { notificationService, NotificationTypes } from '../services/notificationService';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Set up push notifications
  useEffect(() => {
    const setupNotifications = async () => {
      // Request permissions on app start
      const hasPermission = await notificationService.requestPermissions();
      if (hasPermission) {
        console.log('[App] Push notifications enabled');
        
        // Listen for when user taps a notification
        notificationService.addNotificationResponseListener((response) => {
          const { type } = response.notification.request.content.data || {};
          console.log('[App] Notification tapped:', type);
          // Handle navigation based on notification type
        });
      }
    };
    
    if (loaded) {
      setupNotifications();
    }
  }, [loaded]);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function AuthRedirector() {
  const segments = useSegments();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [initializing, setInitializing] = useState(true);
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((u: any) => {
      setUser(u);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (initializing || !segments || (segments as any).length === 0) return;

    const currentPath = segments.join('/');
    if (lastPath.current === currentPath) return;

    const rootSegment = segments[0];
    const inAuthGroup = rootSegment === '(auth)';
    const onWelcome = rootSegment === 'welcome';
    const isPublic = ['support', 'privacy', 'terms', 'features'].includes(rootSegment);
    const onTabs = rootSegment === '(tabs)';

    console.log('[AuthRedirector] Segment:', rootSegment, 'User:', user ? user.uid : 'null', 'onWelcome:', onWelcome);

    if (!user) {
      // Allow access to tabs (guest mode) or public pages
      if (onTabs || onWelcome || inAuthGroup || isPublic) {
        return;
      }
      // Redirect to welcome but allow guest to continue
      console.log('[AuthRedirector] Guest user -> Welcome');
      lastPath.current = 'welcome';
      router.replace('/welcome');
    } else {
      if (onWelcome || inAuthGroup) {
        console.log('[AuthRedirector] Forced Redirect -> Dashboard');
        lastPath.current = '(tabs)';
        router.replace('/(tabs)');
      }
    }
  }, [user, segments, initializing]);

  return null;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthRedirector />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="support" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="privacy" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="terms" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="features" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'GET PRO' }} />
      </Stack>
    </ThemeProvider>
  );
}

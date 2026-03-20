import { initializeApp, getApps } from 'firebase/app';
// @ts-ignore - getReactNativePersistence may show a lint error in some SDK versions but is required for Expo
import { initializeAuth, onAuthStateChanged, getAuth, getReactNativePersistence } from 'firebase/auth';
import type { User } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase Auth with persistence for React Native, safely
let auth: any;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('[FirebaseConfig] Initialized new Auth instance with persistence');
} catch (e: any) {
  if (e.code === 'auth/already-initialized') {
    auth = getAuth(app);
    console.log('[FirebaseConfig] Using existing Auth instance (already initialized)');
  } else {
    // Other error: fallback to getAuth and log
    console.error('[FirebaseConfig] Error during initializeAuth:', e);
    auth = getAuth(app);
  }
}

export { auth, onAuthStateChanged, User };

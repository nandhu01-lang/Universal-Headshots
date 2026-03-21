import { supabase } from './supabaseConfig';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

/**
 * Universal Headshots - Auth Service (Production via Supabase)
 * Handles user sessions and Supabase interaction.
 */

export const authService = {
  /**
   * Get current authenticated user session.
   */
  getCurrentUser: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
  },

  /**
   * Listen for auth state changes
   */
  onAuthStateChanged: (callback: (user: any) => void) => {
    supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
    // Return a dummy unsubscribe function
    return () => {};
  },

  /**
   * Email/Password Sign Up
   */
  signUp: async (email: string, pass: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
      });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Email/Password Sign In
   */
  signIn: async (email: string, pass: string) => {
    try {
      console.log('[AuthService] Attempting Sign In:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) {
        console.error('[AuthService] Sign In Error:', error.message);
        return { success: false, error: error.message };
      }
      console.log('[AuthService] Sign In Success:', data.user?.id);
      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('[AuthService] Sign In Exception:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Google Sign In (Handled via URL redirect in React Native, this is a placeholder/basic impl)
   * Note: In a real Expo app, you would use expo-auth-session and Supabase id_token flow.
   */
  signInWithGoogle: async () => {
    try {
      console.log('[AuthService] Attempting Google Sign In');
      // For full React Native Google Auth, we recommend using @react-native-google-signin/google-signin
      // returning dummy failure for now as it requires specific Google Cloud setup
      return { success: false, error: 'Google sign-in requires native configuration' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Apple Sign In (Using expo-apple-authentication)
   */
  signInWithApple: async () => {
    try {
      console.log('[AuthService] Attempting Apple Sign In');
      const nonce = Math.random().toString(36).substring(2, 15);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.identityToken) {
        throw new Error('No identity token provided by Apple');
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
        nonce,
      });

      if (error) {
        console.error('[AuthService] Apple Sign In Error:', error.message);
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user };
    } catch (error: any) {
      console.error('[AuthService] Apple Sign In Exception:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Anonymous/Guest Sign In
   */
  signInAnonymously: async () => {
    try {
      // Supabase supports anonymous sign-ins
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Log out
   */
  logout: async () => {
    await supabase.auth.signOut();
  },

  /**
   * Get ID Token (JWT)
   */
  getIdToken: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }
};

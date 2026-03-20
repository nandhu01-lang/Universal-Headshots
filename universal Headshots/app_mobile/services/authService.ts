import { auth, onAuthStateChanged } from './firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  AppleAuthProvider,
  signInWithCredential
} from 'firebase/auth';

/**
 * Universal Headshots - Auth Service (Production)
 * Handles user sessions and Firebase interaction.
 */

// Auth providers
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export const authService = {
  /**
   * Get current authenticated user.
   */
  getCurrentUser: () => {
    return auth.currentUser;
  },

  /**
   * Listen for auth state changes
   */
  onAuthStateChanged: (callback: any) => {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Email/Password Sign Up
   */
  signUp: async (email: string, pass: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      return { success: true, user: res.user };
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
      const res = await signInWithEmailAndPassword(auth, email, pass);
      console.log('[AuthService] Sign In Success:', res.user.uid);
      return { success: true, user: res.user };
    } catch (error: any) {
      console.error('[AuthService] Sign In Error:', error.code, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Google Sign In
   */
  signInWithGoogle: async () => {
    try {
      console.log('[AuthService] Attempting Google Sign In');
      const res = await signInWithPopup(auth, googleProvider);
      console.log('[AuthService] Google Sign In Success:', res.user.uid);
      return { success: true, user: res.user };
    } catch (error: any) {
      console.error('[AuthService] Google Sign In Error:', error.code, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Apple Sign In
   */
  signInWithApple: async () => {
    try {
      console.log('[AuthService] Attempting Apple Sign In');
      // Configure Apple provider
      appleProvider.addScope('email');
      appleProvider.addScope('name');
      
      const res = await signInWithPopup(auth, appleProvider);
      console.log('[AuthService] Apple Sign In Success:', res.user.uid);
      return { success: true, user: res.user };
    } catch (error: any) {
      console.error('[AuthService] Apple Sign In Error:', error.code, error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Anonymous/Guest Sign In (for free tier)
   */
  signInAnonymously: async () => {
    try {
      const { signInAnonymously } = await import('firebase/auth');
      const res = await signInAnonymously(auth);
      return { success: true, user: res.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  /**
   * Log out
   */
  logout: async () => {
    await signOut(auth);
  },

  /**
   * Get Firebase ID Token
   */
  getIdToken: async () => {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }
};

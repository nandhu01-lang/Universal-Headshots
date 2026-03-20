import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin only if not already initialized
if (!admin.apps.length) {
  try {
    // Try to initialize with default credentials (works in GCP)
    admin.initializeApp({
      storageBucket: process.env.GCS_BUCKET_NAME || 'universalheadshot'
    });
    console.log('[Firebase] Firebase initialized (default credentials)');
  } catch (error) {
    console.warn('⚠️ Firebase Admin failed to initialize:', error.message);
  }
}

// Safely export services (with mocks if initialization failed)
const isInitialized = admin.apps.length > 0;

export const db = isInitialized ? admin.firestore() : {};
export const bucket = isInitialized ? admin.storage().bucket() : {
  file: () => ({ createWriteStream: () => ({ on: () => {}, end: () => {} }) }),
};
export const auth = isInitialized ? admin.auth() : {};
export { admin };

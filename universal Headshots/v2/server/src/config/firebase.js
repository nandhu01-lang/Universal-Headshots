import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try multiple sources for Firebase credentials
let serviceAccount = null;

// 1. Try FIREBASE_CONFIG env var (JSON string)
if (process.env.FIREBASE_CONFIG) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
    console.log('[Firebase] Using FIREBASE_CONFIG env var');
  } catch (e) {
    console.warn('[Firebase] Failed to parse FIREBASE_CONFIG');
  }
}

// 2. Try file path
if (!serviceAccount) {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || join(__dirname, 'service-account.json');
  if (existsSync(serviceAccountPath)) {
    try {
      serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      console.log('[Firebase] Using service account file');
    } catch (e) {
      console.warn('[Firebase] Failed to read service account file');
    }
  }
}

// Initialize Firebase Admin only if not already initialized
if (!admin.apps.length) {
  try {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.GCS_BUCKET_NAME || 'universalheadshot'
      });
      console.log('[Firebase] Firebase Admin initialized successfully');
    } else {
      // Try default credentials (GCP environment)
      admin.initializeApp({
        storageBucket: process.env.GCS_BUCKET_NAME || 'universalheadshot'
      });
      console.log('[Firebase] Firebase initialized without custom credentials');
    }
  } catch (error) {
    console.warn('⚠️ Firebase Admin failed to initialize. Falling back to empty exports.');
    console.error(error);
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

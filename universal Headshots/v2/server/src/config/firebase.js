import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || join(__dirname, 'service-account.json');

// Initialize Firebase Admin only if not already initialized
if (!admin.apps.length) {
  try {
    if (existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.GCS_BUCKET_NAME || 'universalheadshot'
      });
    } else {
      // Potentially running in a GCP environment with default credentials
      admin.initializeApp({
        storageBucket: process.env.GCS_BUCKET_NAME || 'universalheadshot'
      });
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

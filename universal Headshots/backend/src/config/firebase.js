import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'src/config/service-account.json';

try {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
  });

  console.log('🔥 Firebase Admin Initialized');
} catch (error) {
  console.error('❌ Firebase Init Error:', error.message);
  // Optional: Mock fallback for local dev if service account is missing
}

export const db = admin.firestore();
export const auth = admin.auth();
export const bucket = admin.storage().bucket();

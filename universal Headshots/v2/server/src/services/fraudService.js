import db from '../config/supabase.js';

/**
 * Fraud Prevention Service
 * Supports both Supabase and Firebase (falls back to Firebase if Supabase not configured)
 */

async function checkFraudSupabase(deviceId) {
  if (!deviceId || deviceId === 'SIMULATOR') {
    return { allowed: true };
  }

  const result = await db.fraudPrevention.check(deviceId);
  return result;
}

async function markFreeTrialUsedSupabase(deviceId) {
  if (!deviceId || deviceId === 'SIMULATOR') return;
  
  await db.fraudPrevention.markFreeUsed(deviceId);
}

// Fallback to Firebase if Supabase not configured
async function checkFraudFirebase(deviceId) {
  const { db: firestore } = await import('../config/firebase.js');
  
  if (!deviceId || deviceId === 'SIMULATOR') {
    return { allowed: true };
  }

  try {
    const fraudRef = firestore.collection('fraud_prevention').doc(deviceId);
    const doc = await fraudRef.get();

    if (doc.exists && doc.data().freeUsed) {
      return { 
        allowed: false, 
        message: 'STARTER PACK UPSELL', 
        reason: 'Free tier already claimed on this device.' 
      };
    }
  } catch (e) {
    console.warn('Firebase not available for fraud check');
  }

  return { allowed: true };
}

async function markFreeTrialUsedFirebase(deviceId) {
  const { db: firestore, admin } = await import('../config/firebase.js');
  
  if (!deviceId || deviceId === 'SIMULATOR') return;
  
  try {
    await firestore.collection('fraud_prevention').doc(deviceId).set({
      freeUsed: true,
      lastSeen: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn('Firebase not available for marking free trial');
  }
}

// Main exports - uses Supabase if available, falls back to Firebase
export async function checkFraud(deviceId) {
  if (db.supabase) {
    return checkFraudSupabase(deviceId);
  }
  return checkFraudFirebase(deviceId);
}

export async function markFreeTrialUsed(deviceId) {
  if (db.supabase) {
    return markFreeTrialUsedSupabase(deviceId);
  }
  return markFreeTrialUsedFirebase(deviceId);
}

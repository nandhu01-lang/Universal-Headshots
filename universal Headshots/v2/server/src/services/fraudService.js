import { db } from '../config/firebase.js';

/**
 * Capture Device Fingerprint for Fraud Prevention.
 * Supports Android MediaDRM and iOS IDFV.
 */
export async function checkFraud(deviceId) {
  if (!deviceId || deviceId === 'SIMULATOR') {
    return { allowed: true };
  }

  const fraudRef = db.collection('fraud_prevention').doc(deviceId);
  const doc = await fraudRef.get();

  if (doc.exists && doc.data().freeUsed) {
    return { 
      allowed: false, 
      message: 'STARTER PACK UPSELL', 
      reason: 'Free tier already claimed on this device.' 
    };
  }

  return { allowed: true };
}

export async function markFreeTrialUsed(deviceId) {
  if (!deviceId || deviceId === 'SIMULATOR') return;
  
  await db.collection('fraud_prevention').doc(deviceId).set({
    freeUsed: true,
    lastSeen: new Date().toISOString()
  }, { merge: true });
}

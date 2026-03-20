import { db } from '../config/firebase.js';

/**
 * Global Pro AI - Fraud Prevention Service
 * Checks if a deviceId has already claimed a free trial.
 */
export async function checkFraud(deviceId) {
  if (!deviceId) return { allowed: false, reason: 'Device ID required' };

  const fraudRef = db.collection('FraudPrevention').doc(deviceId);
  const doc = await fraudRef.get();

  if (doc.exists && doc.data().freeTrialClaimed) {
    return { 
      allowed: false, 
      reason: 'FREE_TRIAL_EXHAUSTED',
      upsell: 'PRO_PACK'
    };
  }

  return { allowed: true };
}

/**
 * Mark a deviceId as having claimed a free trial.
 */
export async function claimFreeTrial(deviceId) {
  const fraudRef = db.collection('FraudPrevention').doc(deviceId);
  await fraudRef.set({
    freeTrialClaimed: true,
    claimedAt: new Date().toISOString()
  });
}

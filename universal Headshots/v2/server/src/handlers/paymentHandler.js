import { db, admin } from '../config/firebase.js';
import logger from '../utils/logger.js';

/**
 * Handle RevenueCat Webhooks for Universal Headshots purchases.
 * 
 * Product IDs (update these to match your RevenueCat dashboard):
 * - universal_headshots_starter ($9.99) - 20 images, 5 styles
 * - universal_headshots_pro ($19.99) - 50 images, unlimited styles
 * - universal_headshots_bonus_small ($7) - Edit 2 → 8 images  
 * - universal_headshots_bonus_medium ($12) - Edit 5 → 20 images
 * - universal_headshots_bonus_large ($18) - Edit 10 → 40 images
 */
export async function handleRevenueCatWebhook(req, res) {
  try {
    // Security: Verify secret to prevent unauthorized calls
    const authSecret = req.headers['x-platform-secret'];
    if (authSecret !== process.env.REVENUECAT_WEBHOOK_SECRET) {
      logger.warn({ ip: req.ip }, '⚠️ Unauthorized Webhook Attempt');
      return res.status(401).send('Unauthorized');
    }

    const { event } = req.body;
    const { 
      type, 
      app_user_id, 
      product_id, 
      price_in_purchased_currency 
    } = event;

    logger.info({ eventType: type, productId: product_id, userId: app_user_id }, '📦 RevenueCat Webhook Received');

    if (type === 'INITIAL_PURCHASE' || type === 'RENEWAL' || type === 'PRODUCT_CHANGE') {
      const userRef = db.collection('users').doc(app_user_id);
      
      // Determine credits and tier based on product ID
      let imageCreditsToAdd = 0;
      let refineCreditsToAdd = 0;
      let tier = null;

      // Main Tiers
      if (product_id.includes('pro') && product_id.includes('19.99')) {
        imageCreditsToAdd = 50;
        tier = 'PRO';
        refineCreditsToAdd = 5; // Bonus credits with Pro
      } else if (product_id.includes('starter') && product_id.includes('9.99')) {
        imageCreditsToAdd = 20;
        tier = 'STARTER';
        refineCreditsToAdd = 2; // Bonus credits with Starter
      }
      // Bonus Packs
      else if (product_id.includes('bonus_large') || product_id.includes('18')) {
        refineCreditsToAdd = 10; // Edit 10 images → 40 generated
      } else if (product_id.includes('bonus_medium') || product_id.includes('12')) {
        refineCreditsToAdd = 5; // Edit 5 images → 20 generated
      } else if (product_id.includes('bonus_small') || product_id.includes('7')) {
        refineCreditsToAdd = 2; // Edit 2 images → 8 generated
      }

      const updateData: any = {
        updatedAt: new Date().toISOString()
      };

      if (imageCreditsToAdd > 0) {
        updateData.imageCredits = admin.firestore.FieldValue.increment(imageCreditsToAdd);
      }
      if (refineCreditsToAdd > 0) {
        updateData.refineCredits = admin.firestore.FieldValue.increment(refineCreditsToAdd);
      }
      if (tier) {
        updateData.tier = tier;
      }

      await userRef.set(updateData, { merge: true });

      logger.info({ 
        userId: app_user_id, 
        productId: product_id, 
        imageCredits: imageCreditsToAdd,
        refineCredits: refineCreditsToAdd,
        tier 
      }, `💰 Payment Processed Successfully`);
    }

    // Handle cancellations
    if (type === 'CANCELLATION' || type === 'EXPIRATION') {
      const userRef = db.collection('users').doc(app_user_id);
      await userRef.set({
        tier: 'FREE',
        subscriptionStatus: 'cancelled',
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      logger.info({ userId: app_user_id }, '❌ Subscription Cancelled');
    }

    res.status(200).send('OK');
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, '❌ Webhook Error');
    res.status(500).send('Webhook Processing Failed');
  }
}

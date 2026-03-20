import { db } from '../config/firebase.js';

/**
 * Global Pro AI - RevenueCat Payment Handler
 * Listens for 'Pro Pack' purchases and updates user credits/tier.
 */
export async function handleRevenueCatWebhook(req, res) {
  const { event } = req.body;

  if (!event || event.type !== 'INITIAL_PURCHASE') {
    return res.status(200).send('Event ignored');
  }

  const { app_user_id, product_id } = event;

  // PRO PACK (₹1799 / $29.99)
  if (product_id === 'global_pro_pack' || product_id === 'pro_pack_2999') {
    try {
      const userRef = db.collection('Users').doc(app_user_id);
      
      await userRef.set({
        tier: 'PRO',
        credits: 100, // Grant 100 headshot credits
        updatedAt: new Date().toISOString()
      }, { merge: true });

      console.log(`💎 Pro Pack fulfilled for user: ${app_user_id}`);
      return res.status(200).send('Fulfillment Success');
    } catch (error) {
      console.error('❌ Payment Fulfillment Error:', error);
      return res.status(500).send('Internal Server Error');
    }
  }

  res.status(200).send('Product not handled');
}

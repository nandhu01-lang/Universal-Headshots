import axios from 'axios';
import logger from '../utils/logger.js';

/**
 * Universal Headshots - Push Notification Service
 * Sends push notifications to Expo devices
 */

const EXPO_pushUrl = 'https://exp.host/--/api/v2/push/tokens';

/**
 * Send push notification to Expo token
 */
export async function sendPushNotification(expoToken, title, body, data = {}) {
  if (!expoToken) {
    logger.warn('[Push] No token provided');
    return;
  }

  try {
    const message = {
      to: expoToken,
      title,
      body,
      data,
      sound: 'default',
    };

    await axios.post(EXPO_pushUrl, message, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.info({ token: expoToken.substring(0, 20) + '...', title }, '📬 Push notification sent');
  } catch (error) {
    logger.error({ error: error.message }, '❌ Push notification failed');
  }
}

/**
 * Send batch push notifications
 */
export async function sendBatchPushNotifications(tokens, title, body, data = {}) {
  if (!tokens || tokens.length === 0) return;

  const messages = tokens.map(token => ({
    to: token,
    title,
    body,
    data,
    sound: 'default',
  }));

  try {
    await axios.post(EXPO_pushUrl, messages, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    logger.info({ count: tokens.length, title }, '📬 Batch push notifications sent');
  } catch (error) {
    logger.error({ error: error.message }, '❌ Batch push notification failed');
  }
}

/**
 * Notify user that headshots are ready
 */
export async function notifyHeadshotsReady(userId, expoToken, imageCount) {
  return sendPushNotification(
    expoToken,
    '🎉 Headshots Ready!',
    `Your ${imageCount} AI headshots are ready to view. Tap to see your professional photos!`,
    { type: 'headshots_complete', userId, imageCount }
  );
}

/**
 * Notify user of payment success
 */
export async function notifyPaymentSuccess(userId, expoToken, tier) {
  return sendPushNotification(
    expoToken,
    '💳 Payment Successful!',
    `Welcome to ${tier}! Your enhanced features are now active.`,
    { type: 'payment_success', userId, tier }
  );
}

/**
 * Notify user of bonus pack
 */
export async function notifyBonusPackReady(userId, expoToken, packName) {
  return sendPushNotification(
    expoToken,
    '🎁 Bonus Pack Ready!',
    `Your ${packName} bonus pack is ready. Tap to generate more headshots!`,
    { type: 'bonus_pack_ready', userId, packName }
  );
}

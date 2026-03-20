import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * Universal Headshots - Push Notification Service
 * Handles device registration and notification delivery
 */

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  /**
   * Request notification permissions
   */
  requestPermissions: async (): Promise<boolean> => {
    if (!Device.isDevice) {
      console.log('[Notifications] Must use physical device for push notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return false;
    }

    // Set up Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('headshots', {
        name: 'Headshot Generation',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8b5cf6',
      });
    }

    return true;
  },

  /**
   * Get push token for this device
   */
  getPushToken: async (): Promise<string | null> => {
    try {
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) return null;

      const token = await Notifications.getExpoPushTokenAsync();
      console.log('[Notifications] Push token obtained:', token.data);
      return token.data;
    } catch (error) {
      console.error('[Notifications] Error getting push token:', error);
      return null;
    }
  },

  /**
   * Register device for push notifications
   * Call this when user logs in or on first app launch
   */
  registerDevice: async (userId: string): Promise<string | null> => {
    const pushToken = await notificationService.getPushToken();
    if (!pushToken) return null;

    // TODO: Send push token to your backend to store in database
    // This allows sending targeted notifications to specific users
    console.log('[Notifications] Registering device for user:', userId);
    
    return pushToken;
  },

  /**
   * Local notification - for testing or immediate feedback
   */
  sendLocalNotification: async (
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: null, // Send immediately
    });
  },

  /**
   * Schedule a notification for later
   */
  scheduleNotification: async (
    title: string,
    body: string,
    triggerSeconds: number,
    data?: Record<string, any>
  ): Promise<string> => {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: true,
      },
      trigger: {
        seconds: triggerSeconds,
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      },
    });
    return id;
  },

  /**
   * Cancel all scheduled notifications
   */
  cancelAllNotifications: async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  /**
   * Add notification response listener
   */
  addNotificationReceivedListener: (
    callback: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription => {
    return Notifications.addNotificationReceivedListener(callback);
  },

  /**
   * Add notification response listener (when user taps notification)
   */
  addNotificationResponseListener: (
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription => {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};

/**
 * Notification types for the app
 */
export const NotificationTypes = {
  HEADSHOTS_COMPLETE: 'headshots_complete',
  HEADSHOTS_FAILED: 'headshots_failed',
  PAYMENT_SUCCESS: 'payment_success',
  BONUS_PACK_READY: 'bonus_pack_ready',
};

/**
 * Send notification helpers
 */
export const notifyHeadshotsComplete = (imageCount: number) => {
  return notificationService.sendLocalNotification(
    '🎉 Headshots Ready!',
    `Your ${imageCount} AI headshots are ready to view. Tap to see your professional photos!`,
    { type: NotificationTypes.HEADSHOTS_COMPLETE, imageCount }
  );
};

export const notifyHeadshotsFailed = (reason?: string) => {
  return notificationService.sendLocalNotification(
    '⚠️ Generation Failed',
    reason || 'There was an issue generating your headshots. Please try again.',
    { type: NotificationTypes.HEADSHOTS_FAILED }
  );
};

export const notifyPaymentSuccess = (tier: string) => {
  return notificationService.sendLocalNotification(
    '💳 Payment Successful!',
    `Welcome to ${tier}! Your enhanced features are now active.`,
    { type: NotificationTypes.PAYMENT_SUCCESS, tier }
  );
};

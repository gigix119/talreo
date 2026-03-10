/**
 * Notifications adapter — placeholder for future Expo Notifications.
 *
 * TODO: Install expo-notifications
 * TODO: Request permissions
 * TODO: Map alerts -> local notifications
 * TODO: Handle push notifications for budget_exceeded, goal_completed
 * TODO: Register for push token (for remote notifications)
 */
import type { Alert } from '@/types/database';

export const notificationsService = {
  /**
   * Schedule or send a notification for an alert.
   * When expo-notifications is integrated:
   * - Local: scheduleLocalNotificationAsync({ title, body, ... })
   * - Push: send to backend which pushes via FCM/APNs
   */
  async notifyForAlert(_alert: Alert): Promise<void> {
    // TODO: await Notifications.scheduleNotificationAsync({ ... })
  },

  /**
   * Check if user has notifications enabled (from user_settings).
   */
  async shouldNotify(_userId: string): Promise<boolean> {
    // TODO: fetch user_settings.notifications_enabled
    return false;
  },

  /**
   * Request notification permissions.
   */
  async requestPermissions(): Promise<boolean> {
    // TODO: await Notifications.requestPermissionsAsync()
    return false;
  },
};

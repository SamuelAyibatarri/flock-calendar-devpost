import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDER_STORAGE_KEY = 'flock:daily_reminder_enabled';
const SCHEDULED_NOTIFICATION_ID_KEY = 'flock:scheduled_notification_id';
const CHANNEL_ID = 'flock-care-alerts';

// Configure foreground presentation behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Initialize the Android notification channel */
export async function initNotifications(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Flock Care Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#f59e0b',
        enableVibrate: true,
        enableLights: true,
      });
    } catch (e) {
      console.warn('[Notifications] Channel setup error:', e);
    }
  }
}

/** Request notification permission (Android 13+ and iOS) */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch {
    return false;
  }
}

/** Trigger an immediate local test notification */
export async function triggerImmediateNotification(
  title: string = '🐓 Flock Care Alert',
  body: string = 'Batch 1: Newcastle Vaccine & Deworming due today (80 layers)'
): Promise<boolean> {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  await initNotifications();

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      data: { type: 'care_reminder' },
      ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
    },
    trigger: null, // null triggers immediately
  });

  return true;
}

/** Schedule daily morning care reminder at 7:00 AM */
export async function scheduleDailyMorningReminder(hour = 7, minute = 0): Promise<boolean> {
  const granted = await requestNotificationPermission();
  if (!granted) return false;

  await initNotifications();
  await cancelDailyMorningReminder();

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🐓 Good Morning! Flock Care Routine',
        body: 'Check today’s tasks, egg collection, and recurring flock care.',
        sound: true,
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    await AsyncStorage.setItem(REMINDER_STORAGE_KEY, 'true');
    await AsyncStorage.setItem(SCHEDULED_NOTIFICATION_ID_KEY, id);
    return true;
  } catch (e) {
    console.warn('[Notifications] Schedule error:', e);
    return false;
  }
}

/** Cancel any scheduled daily reminder */
export async function cancelDailyMorningReminder(): Promise<void> {
  try {
    const existingId = await AsyncStorage.getItem(SCHEDULED_NOTIFICATION_ID_KEY);
    if (existingId) {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    }
    await AsyncStorage.setItem(REMINDER_STORAGE_KEY, 'false');
    await AsyncStorage.removeItem(SCHEDULED_NOTIFICATION_ID_KEY);
  } catch (e) {
    console.warn('[Notifications] Cancel error:', e);
  }
}

/** Check if daily reminder is currently enabled */
export async function isDailyReminderEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(REMINDER_STORAGE_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

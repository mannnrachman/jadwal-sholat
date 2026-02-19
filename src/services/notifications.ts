import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification';
import type { AladhanData, AppSettings, PrayerTimings } from '../types/index';

let scheduledTimeouts: ReturnType<typeof setTimeout>[] = [];

function parseTimeToDate(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
}

function playNotificationSound() {
  const playWithDuration = (src: string, durationMs: number) =>
    new Promise<void>((resolve, reject) => {
      try {
        const audio = new Audio(src);
        audio.volume = 0.9;
        audio.currentTime = 0;
        audio.play().then(() => {
          const stopTimer = setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
          }, durationMs);
          audio.addEventListener(
            'ended',
            () => {
              clearTimeout(stopTimer);
            },
            { once: true }
          );
          resolve();
        }).catch(() => reject(new Error('play failed')));
      } catch {
        reject(new Error('audio init failed'));
      }
    });

  playWithDuration('/sounds/adzan-short.mp3', 7500)
    .catch(() => playWithDuration('/sounds/adzan-short.wav', 7500))
    .catch(() => playWithDuration('/sounds/notification.wav', 2500))
    .catch(() => {});
}

async function triggerPrayerNotification(title: string, body: string) {
  try {
    await sendNotification({ title, body });
  } catch {
    // Fallback to Web Notification API when native bridge fails
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch {
        // Ignore fallback failure
      }
    }
  }
}

const NOTIFICATION_MAP: { key: keyof PrayerTimings; title: string; body: string }[] = [
  { key: 'Imsak', title: 'Waktu Imsak', body: 'Berhenti makan dan minum' },
  { key: 'Fajr', title: 'Waktu Subuh', body: 'Telah masuk waktu Subuh' },
  { key: 'Dhuhr', title: 'Waktu Dzuhur', body: 'Telah masuk waktu Dzuhur' },
  { key: 'Asr', title: 'Waktu Ashar', body: 'Telah masuk waktu Ashar' },
  { key: 'Maghrib', title: 'Waktu Maghrib', body: 'Berbuka Puasa!' },
  { key: 'Isha', title: 'Waktu Isya', body: 'Telah masuk waktu Isya' },
];

export function clearAllNotifications() {
  for (const t of scheduledTimeouts) {
    clearTimeout(t);
  }
  scheduledTimeouts = [];
}

export async function scheduleNotifications(data: AladhanData, settings: AppSettings) {
  if (!settings.notificationsEnabled) return;

  // Ensure permission
  let permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }
  if (!permissionGranted) return;

  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }

  clearAllNotifications();

  const now = new Date();

  for (const item of NOTIFICATION_MAP) {
    const time = data.timings[item.key];
    const prayerDate = parseTimeToDate(time);
    const msUntil = prayerDate.getTime() - now.getTime();
    const notificationBody = `${item.body} (${time})`;

    if (msUntil > 0) {
      const timeout = setTimeout(async () => {
        await triggerPrayerNotification(item.title, notificationBody);

        if (settings.soundEnabled) {
          playNotificationSound();
        }
      }, msUntil);

      scheduledTimeouts.push(timeout);
    } else if (msUntil >= -60000) {
      await triggerPrayerNotification(item.title, notificationBody);
      if (settings.soundEnabled) {
        playNotificationSound();
      }
    }
  }
}

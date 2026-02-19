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
  try {
    const audio = new Audio('/sounds/notification.wav');
    audio.volume = 0.7;
    audio.play().catch(() => {});
  } catch {
    // Sound playback is best-effort
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

  clearAllNotifications();

  const now = new Date();

  for (const item of NOTIFICATION_MAP) {
    const time = data.timings[item.key];
    const prayerDate = parseTimeToDate(time);
    const msUntil = prayerDate.getTime() - now.getTime();

    if (msUntil > 0) {
      const timeout = setTimeout(() => {
        sendNotification({
          title: item.title,
          body: `${item.body} (${time})`,
        });

        if (settings.soundEnabled) {
          playNotificationSound();
        }
      }, msUntil);

      scheduledTimeouts.push(timeout);
    }
  }
}

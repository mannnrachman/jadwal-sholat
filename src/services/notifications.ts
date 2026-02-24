import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification';
import type { AladhanData, AppSettings, PrayerTimings } from '../types/index';

let scheduledTimeouts: ReturnType<typeof setTimeout>[] = [];

function showInAppToast(title: string, body: string) {
  if (typeof document === 'undefined') return;

  let container = document.getElementById('prayer-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'prayer-toast-container';
    container.style.position = 'fixed';
    container.style.top = '12px';
    container.style.right = '12px';
    container.style.zIndex = '9999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '8px';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.pointerEvents = 'auto';
  toast.style.background = 'rgba(17, 24, 39, 0.95)';
  toast.style.color = '#f9fafb';
  toast.style.border = '1px solid rgba(255,255,255,0.12)';
  toast.style.borderRadius = '10px';
  toast.style.padding = '10px 12px';
  toast.style.minWidth = '220px';
  toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
  toast.innerHTML = `<div style="font-weight:600; margin-bottom:2px;">${title}</div><div style="font-size:12px; opacity:0.95;">${body}</div>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
    if (container && container.children.length === 0) {
      container.remove();
    }
  }, 7000);
}

function parseTimeToDate(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
}

export function playNotificationSound() {
  const playFull = (src: string) =>
    new Promise<void>((resolve, reject) => {
      try {
        const audio = new Audio(src);
        audio.volume = 0.9;
        audio.currentTime = 0;
        audio.play().then(() => {
          audio.addEventListener('ended', () => resolve(), { once: true });
          audio.addEventListener('error', () => reject(new Error('audio error')), { once: true });
        }).catch(() => reject(new Error('play failed')));
      } catch {
        reject(new Error('audio init failed'));
      }
    });

  playFull('/sounds/adzan-short.mp3')
    .catch(() => playFull('/sounds/adzan-short.wav'))
    .catch(() => playFull('/sounds/notification.wav'))
    .catch(() => {});
}

async function triggerPrayerNotification(title: string, body: string) {
  let delivered = false;

  try {
    await sendNotification({ title, body });
    delivered = true;
  } catch {
    // Ignore and continue to fallbacks
  }

  if (!delivered && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification(title, { body });
      delivered = true;
    } catch {
      // Ignore fallback failure
    }
  }

  if (!delivered) {
    showInAppToast(title, body);
  }

  if (delivered) {
    // Also show compact in-app indicator for consistency when app is open
    if (typeof document !== 'undefined' && !document.hidden) {
      showInAppToast(title, body);
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

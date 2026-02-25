import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification';
import type { AladhanData, AppSettings, PrayerTimings } from '../types/index';

// Polling-based scheduler — tahan throttle WebView, tahan sleep/wake, no duplicate
let pollingInterval: ReturnType<typeof setInterval> | null = null;
let pollingData: AladhanData | null = null;
let pollingSettings: AppSettings | null = null;

// Key format: "YYYY-MM-DD-PrayerKey" — reset otomatis saat hari berganti
const firedKeys = new Set<string>();

function todayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function firedKey(prayerKey: string): string {
  return `${todayDateStr()}-${prayerKey}`;
}

function purgeStaleFiredKeys() {
  const todayPrefix = todayDateStr();
  for (const key of firedKeys) {
    if (!key.startsWith(todayPrefix)) {
      firedKeys.delete(key);
    }
  }
}

function checkAndFirePrayers() {
  if (!pollingData || !pollingSettings) return;
  if (!pollingSettings.notificationsEnabled) return;

  const now = new Date();

  for (const item of NOTIFICATION_MAP) {
    const time = pollingData.timings[item.key];
    if (!time) continue;

    const prayerDate = parseTimeToDate(time);
    const msUntil = prayerDate.getTime() - now.getTime();
    const key = firedKey(item.key);

    // Window: dari tepat waktu sampai +90 detik, tidak boleh sudah pernah dikirim
    if (msUntil <= 0 && msUntil >= -90000 && !firedKeys.has(key)) {
      firedKeys.add(key);
      const body = `${item.body} (${time})`;
      triggerPrayerNotification(item.title, body).catch(() => {});
      if (pollingSettings.soundEnabled) {
        playNotificationSound();
      }
    }
  }
}

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
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  pollingData = null;
  pollingSettings = null;
}

export async function scheduleNotifications(data: AladhanData, settings: AppSettings) {
  // Update data untuk polling loop
  pollingData = data;
  pollingSettings = settings;

  if (!settings.notificationsEnabled) {
    clearAllNotifications();
    return;
  }

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

  // Buang key hari kemarin
  purgeStaleFiredKeys();

  // Pre-mark semua waktu sholat yang sudah lewat >90 detik sebagai fired
  // Ini mencegah catch-up saat app pertama kali dibuka / refresh
  const now = new Date();
  for (const item of NOTIFICATION_MAP) {
    const time = data.timings[item.key];
    if (!time) continue;
    const prayerDate = parseTimeToDate(time);
    const msUntil = prayerDate.getTime() - now.getTime();
    if (msUntil < -90000) {
      firedKeys.add(firedKey(item.key));
    }
  }

  // Mulai polling jika belum jalan
  if (!pollingInterval) {
    pollingInterval = setInterval(checkAndFirePrayers, 15000);
  }
}

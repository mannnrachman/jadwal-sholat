import { invoke } from '@tauri-apps/api/core';
import type { AladhanData, AppSettings } from './types/index';
import { fetchPrayerTimes } from './api/aladhan';
import { detectLocation } from './api/geolocation';
import { loadSettings, saveSettings, isFirstLaunch } from './services/settings';
import { scheduleNotifications, clearAllNotifications } from './services/notifications';
import { renderApp, updatePrayerTimes, updateDate, updateCountdown, updateLocation } from './ui/render';
import { initCitySearch } from './ui/city-search';
import './style.css';

let currentSettings: AppSettings;
let currentData: AladhanData | null = null;
let countdownInterval: ReturnType<typeof setInterval> | null = null;

function setMethodHint(message: string, isError = false) {
  const hintEl = document.getElementById('method-hint');
  if (!hintEl) return;
  hintEl.textContent = message;
  hintEl.style.color = isError ? '#dc2626' : 'var(--text-muted)';
}

async function refreshPrayerTimes() {
  try {
    const response = await fetchPrayerTimes(
      currentSettings.latitude,
      currentSettings.longitude,
      currentSettings.method,
      currentSettings.methodSettings
    );
    currentData = response.data;

    updatePrayerTimes(currentData);
    updateDate(currentData);
    updateCountdown(currentData);

    await scheduleNotifications(currentData, currentSettings);
    return true;
  } catch (err) {
    console.error('Failed to fetch prayer times:', err);
    return false;
  }
}

function startCountdownTimer() {
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    if (currentData) {
      updateCountdown(currentData);
    }
  }, 1000);
}

async function handleMethodChange(methodId: number, methodSettings: string) {
  const methodSelect = document.getElementById('method-select') as HTMLSelectElement | null;
  const selectedMethodName = methodSelect?.selectedOptions?.[0]?.textContent?.trim() || 'metode terpilih';
  const previousKeyTimes = currentData
    ? `${currentData.timings.Fajr}|${currentData.timings.Dhuhr}|${currentData.timings.Asr}|${currentData.timings.Maghrib}|${currentData.timings.Isha}`
    : '';

  if (methodSelect) methodSelect.disabled = true;
  setMethodHint('Menerapkan metode dan memuat ulang jadwal...');

  currentSettings.method = methodId;
  currentSettings.methodSettings = methodSettings;
  await saveSettings({ method: methodId, methodSettings });
  const ok = await refreshPrayerTimes();
  const currentKeyTimes = currentData
    ? `${currentData.timings.Fajr}|${currentData.timings.Dhuhr}|${currentData.timings.Asr}|${currentData.timings.Maghrib}|${currentData.timings.Isha}`
    : '';
  const changed = previousKeyTimes !== '' && currentKeyTimes !== '' && previousKeyTimes !== currentKeyTimes;

  if (methodSelect) methodSelect.disabled = false;
  if (ok) {
    if (changed) {
      setMethodHint(`Metode ${selectedMethodName} diterapkan. Jadwal berhasil diperbarui otomatis.`);
    } else {
      setMethodHint(`Metode ${selectedMethodName} diterapkan. Jadwal hari ini bisa saja tetap sama (normal).`);
    }
  } else {
    setMethodHint('Gagal memuat jadwal. Coba pilih metode lagi atau klik Refresh.', true);
  }
}

async function handleCitySelect(city: string, lat: number, lon: number) {
  currentSettings.city = city;
  currentSettings.latitude = lat;
  currentSettings.longitude = lon;
  await saveSettings({ city, latitude: lat, longitude: lon });
  updateLocation(currentSettings);
  await refreshPrayerTimes();
}

async function handleQuit() {
  clearAllNotifications();
  await invoke('quit_app');
}

async function init() {
  // First launch: detect location
  if (await isFirstLaunch()) {
    try {
      const loc = await detectLocation();
      await saveSettings({
        city: loc.city,
        country: loc.country,
        latitude: loc.lat,
        longitude: loc.lon,
        timezone: loc.timezone,
      });
    } catch {
      // Use defaults
    }
  }

  currentSettings = await loadSettings();

  renderApp(
    currentSettings,
    handleMethodChange,
    refreshPrayerTimes,
    handleQuit,
    () => {} // location click handled by city-search init
  );

  initCitySearch(currentSettings, handleCitySelect);

  await refreshPrayerTimes();
  setMethodHint('Perubahan metode diterapkan otomatis.');
  startCountdownTimer();

  // Refresh every hour
  setInterval(refreshPrayerTimes, 3600000);
}

// Expose for Rust tray menu
(window as unknown as Record<string, unknown>).refreshPrayerTimes = refreshPrayerTimes;

init();

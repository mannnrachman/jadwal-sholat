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
  } catch (err) {
    console.error('Failed to fetch prayer times:', err);
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
  currentSettings.method = methodId;
  currentSettings.methodSettings = methodSettings;
  await saveSettings({ method: methodId, methodSettings });
  await refreshPrayerTimes();
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
  startCountdownTimer();

  // Refresh every hour
  setInterval(refreshPrayerTimes, 3600000);
}

// Expose for Rust tray menu
(window as unknown as Record<string, unknown>).refreshPrayerTimes = refreshPrayerTimes;

init();

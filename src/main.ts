import { invoke } from '@tauri-apps/api/core';
import type { AladhanData, AppSettings } from './types/index';
import { fetchPrayerTimes } from './api/aladhan';
import { detectLocation } from './api/geolocation';
import { fetchMyQuranPrayerTimes, searchMyQuranCity } from './api/myquran';
import { loadSettings, saveSettings, shouldRunInitialLocationDetection, saveJadwal, loadJadwal } from './services/settings';
import { scheduleNotifications, clearAllNotifications } from './services/notifications';
import { renderApp, updatePrayerTimes, updateDate, updateCountdown, updateLocation } from './ui/render';
import { initCitySearch } from './ui/city-search';
import './style.css';

let currentSettings: AppSettings;
let currentData: AladhanData | null = null;
let countdownInterval: ReturnType<typeof setInterval> | null = null;
let retryTimeout: ReturnType<typeof setTimeout> | null = null;

function setApiSourceHint(usingMyQuran: boolean) {
  const el = document.getElementById('api-source-hint');
  if (el) {
    el.textContent = usingMyQuran ? 'Jadwal: myQuran (Kemenag)' : 'Jadwal: Aladhan (fallback)';
    el.style.color = usingMyQuran ? 'var(--text-muted)' : '#f59e0b';
  }
}

function setMethodHint(message: string, isError = false) {
  const hintEl = document.getElementById('method-hint');
  if (!hintEl) return;
  hintEl.textContent = message;
  hintEl.style.color = isError ? '#dc2626' : 'var(--text-muted)';
}

async function refreshPrayerTimes() {
  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }
  try {
    const today = new Date();
    let freshAladhanData: AladhanData | null = null;
    let usingMyQuran = false;
    const [myquranResult, aladhanResult] = await Promise.allSettled([
      currentSettings.myquranCityId
        ? fetchMyQuranPrayerTimes(currentSettings.myquranCityId, today)
        : Promise.reject(new Error('no myquran city id')),
      fetchPrayerTimes(
        currentSettings.latitude,
        currentSettings.longitude,
        currentSettings.method,
        currentSettings.methodSettings,
        today
      ),
    ]);

    if (aladhanResult.status === 'fulfilled') {
      freshAladhanData = aladhanResult.value.data;
      currentData = freshAladhanData;

      if ((currentSettings.latitude === 0 || currentSettings.longitude === 0) && freshAladhanData.meta) {
        currentSettings.latitude = freshAladhanData.meta.latitude;
        currentSettings.longitude = freshAladhanData.meta.longitude;
        await saveSettings({
          latitude: freshAladhanData.meta.latitude,
          longitude: freshAladhanData.meta.longitude,
        });
      }
    }

    if (myquranResult.status === 'fulfilled' && freshAladhanData) {
      Object.assign(freshAladhanData.timings, myquranResult.value);
      usingMyQuran = true;
    } else if (aladhanResult.status === 'rejected') {
      throw new Error('Both APIs failed');
    }

    if (!freshAladhanData) {
      throw new Error('No prayer data available');
    }

    updatePrayerTimes(freshAladhanData);
    updateDate(freshAladhanData);
    updateCountdown(freshAladhanData);
    setApiSourceHint(usingMyQuran);

    // Simpan ke cache supaya startup berikutnya tidak butuh network
    await saveJadwal(freshAladhanData);

    await scheduleNotifications(freshAladhanData, currentSettings);
    return true;
  } catch (err) {
    console.error('Failed to fetch prayer times:', err);
    // Retry otomatis setelah 30 detik jika gagal
    retryTimeout = setTimeout(() => {
      retryTimeout = null;
      refreshPrayerTimes();
    }, 30000);
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

async function handleCitySelect(city: string, lat: number, lon: number, myquranCityId: string) {
  currentSettings.city = city;
  if (lat !== 0 && lon !== 0) {
    currentSettings.latitude = lat;
    currentSettings.longitude = lon;
  }
  currentSettings.myquranCityId = myquranCityId;
  await saveSettings({
    city,
    myquranCityId,
    locationInitialized: true,
    latitude: currentSettings.latitude,
    longitude: currentSettings.longitude,
  });
  updateLocation(currentSettings);
  await refreshPrayerTimes();
}

async function handleQuit() {
  clearAllNotifications();
  await invoke('quit_app');
}

async function init() {
  // First launch: detect location
  if (await shouldRunInitialLocationDetection()) {
    try {
      const loc = await detectLocation();
      await saveSettings({
        city: loc.city,
        country: loc.country,
        latitude: loc.lat,
        longitude: loc.lon,
        timezone: loc.timezone,
        locationInitialized: true,
      });

      try {
        const cities = await searchMyQuranCity(loc.city);
        if (cities.length > 0) {
          await saveSettings({
            myquranCityId: cities[0].id,
            city: cities[0].lokasi,
          });
        }
      } catch {
        // Aladhan fallback will still work
      }
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
    () => {}, // location click handled by city-search init
    () => invoke('open_url', { url: 'https://github.com/mannnrachman/jadwal-sholat/releases' })
  );

  initCitySearch(handleCitySelect);

  // Coba load jadwal dari cache dulu — langsung schedule tanpa tunggu network
  const cachedJadwal = await loadJadwal();
  if (cachedJadwal) {
    currentData = cachedJadwal;
    updatePrayerTimes(cachedJadwal);
    updateDate(cachedJadwal);
    updateCountdown(cachedJadwal);
    await scheduleNotifications(cachedJadwal, currentSettings);
  }

  // Fetch fresh di background (tidak blocking)
  refreshPrayerTimes();
  setMethodHint('Perubahan metode diterapkan otomatis.');
  startCountdownTimer();

  // Refresh setiap jam
  setInterval(refreshPrayerTimes, 3600000);
}

// Expose for Rust tray menu
(window as unknown as Record<string, unknown>).refreshPrayerTimes = refreshPrayerTimes;

init();

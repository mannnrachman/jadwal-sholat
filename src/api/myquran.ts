import type { MyQuranCity, MyQuranResponse, PrayerTimings } from '../types/index';

function formatDate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function stripTime(value: string): string {
  return value?.split(' ')[0]?.trim() ?? '';
}

function isJadwalEntry(value: unknown): value is {
  tanggal: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
  date: string;
} {
  return typeof value === 'object' && value !== null && 'imsak' in value && 'maghrib' in value;
}

function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

export async function searchMyQuranCity(keyword: string): Promise<MyQuranCity[]> {
  if (!keyword.trim()) {
    return [];
  }

  const q = encodeURIComponent(keyword.trim());
  const response = await fetchWithTimeout(`https://api.myquran.com/v3/sholat/kota/cari/${q}`);
  if (!response.ok) {
    throw new Error(`myQuran city search error: ${response.status}`);
  }

  const payload = await response.json();
  if (!payload?.status) {
    return [];
  }

  return Array.isArray(payload.data) ? payload.data : [];
}

export async function fetchAllMyQuranCities(): Promise<MyQuranCity[]> {
  const response = await fetchWithTimeout('https://api.myquran.com/v3/sholat/kota/semua', 15000);
  if (!response.ok) {
    throw new Error(`myQuran cities error: ${response.status}`);
  }

  const payload = await response.json();
  if (!payload?.status) {
    return [];
  }

  return Array.isArray(payload.data) ? payload.data : [];
}

export async function fetchMyQuranPrayerTimes(cityId: string, date: Date = new Date()): Promise<PrayerTimings> {
  const dateStr = formatDate(date);
  const response = await fetchWithTimeout(`https://api.myquran.com/v3/sholat/jadwal/${encodeURIComponent(cityId)}/${dateStr}`);

  if (!response.ok) {
    throw new Error(`myQuran prayer times error: ${response.status}`);
  }

  const payload: MyQuranResponse = await response.json();
  if (!payload?.status || !payload?.data?.jadwal) {
    throw new Error('Invalid myQuran prayer times response');
  }

  const jadwalRaw = payload.data.jadwal;
  const jadwal = isJadwalEntry(jadwalRaw)
    ? jadwalRaw
    : Object.values(jadwalRaw).find((entry) => isJadwalEntry(entry));
  if (!jadwal) {
    throw new Error('Empty myQuran jadwal response');
  }

  const maghrib = stripTime(jadwal.maghrib);

  return {
    Imsak: stripTime(jadwal.imsak),
    Fajr: stripTime(jadwal.subuh),
    Sunrise: stripTime(jadwal.terbit),
    Dhuhr: stripTime(jadwal.dzuhur),
    Asr: stripTime(jadwal.ashar),
    Maghrib: maghrib,
    Isha: stripTime(jadwal.isya),
    Sunset: maghrib,
    Midnight: '00:00',
  };
}

import type { CalculationMethod, CityEntry } from './types/index';

export const CALCULATION_METHODS: CalculationMethod[] = [
  { id: 20, name: 'Kemenag RI', methodSettings: '' },
  { id: 99, name: 'Muhammadiyah', methodSettings: '18,null,18' },
  { id: 3, name: 'Muslim World League (MWL)', methodSettings: '' },
  { id: 2, name: 'ISNA (North America)', methodSettings: '' },
  { id: 5, name: 'Egyptian General Authority', methodSettings: '' },
  { id: 4, name: 'Umm Al-Qura, Makkah', methodSettings: '' },
  { id: 1, name: 'Univ. Islamic Sciences, Karachi', methodSettings: '' },
  { id: 11, name: 'MUIS (Singapore)', methodSettings: '' },
];

export const INDONESIAN_CITIES: CityEntry[] = [
  { city: 'Banjarmasin', lat: -3.3186, lon: 114.5944 },
  { city: 'Jakarta', lat: -6.2088, lon: 106.8456 },
  { city: 'Surabaya', lat: -7.2575, lon: 112.7521 },
  { city: 'Bandung', lat: -6.9175, lon: 107.6191 },
  { city: 'Medan', lat: 3.5952, lon: 98.6722 },
  { city: 'Semarang', lat: -6.9666, lon: 110.4196 },
  { city: 'Makassar', lat: -5.1477, lon: 119.4327 },
  { city: 'Yogyakarta', lat: -7.7956, lon: 110.3695 },
  { city: 'Palembang', lat: -2.9761, lon: 104.7754 },
  { city: 'Balikpapan', lat: -1.2379, lon: 116.8529 },
  { city: 'Pontianak', lat: -0.0263, lon: 109.3425 },
  { city: 'Denpasar', lat: -8.6705, lon: 115.2126 },
  { city: 'Manado', lat: 1.4748, lon: 124.8421 },
  { city: 'Padang', lat: -0.9471, lon: 100.4172 },
  { city: 'Pekanbaru', lat: 0.5071, lon: 101.4478 },
  { city: 'Malang', lat: -7.9666, lon: 112.6326 },
  { city: 'Samarinda', lat: -0.4948, lon: 117.1436 },
  { city: 'Batam', lat: 1.0456, lon: 104.0305 },
  { city: 'Jambi', lat: -1.6101, lon: 103.6131 },
  { city: 'Mataram', lat: -8.5833, lon: 116.1167 },
  { city: 'Aceh (Banda Aceh)', lat: 5.5483, lon: 95.3238 },
  { city: 'Kupang', lat: -10.1772, lon: 123.6070 },
  { city: 'Ambon', lat: -3.6954, lon: 128.1814 },
  { city: 'Jayapura', lat: -2.5337, lon: 140.7181 },
  { city: 'Gorontalo', lat: 0.5435, lon: 123.0568 },
  { city: 'Kendari', lat: -3.9985, lon: 122.5130 },
  { city: 'Palu', lat: -0.9003, lon: 119.8779 },
  { city: 'Bengkulu', lat: -3.7928, lon: 102.2608 },
  { city: 'Ternate', lat: 0.7736, lon: 127.3666 },
  { city: 'Tarakan', lat: 3.3005, lon: 117.6326 },
];

export const DEFAULT_SETTINGS = {
  city: 'Banjarmasin',
  country: 'Indonesia',
  latitude: -3.3186,
  longitude: 114.5944,
  timezone: 'Asia/Makassar',
  method: 20,
  methodSettings: '',
  notificationsEnabled: true,
  soundEnabled: true,
};

export const PRAYER_DISPLAY = [
  { key: 'Imsak', label: 'Imsak', icon: '\u{1F319}' },
  { key: 'Fajr', label: 'Subuh', icon: '\u{1F304}' },
  { key: 'Dhuhr', label: 'Dzuhur', icon: '\u{2600}\u{FE0F}' },
  { key: 'Asr', label: 'Ashar', icon: '\u{1F324}\u{FE0F}' },
  { key: 'Maghrib', label: 'Maghrib', icon: '\u{1F307}' },
  { key: 'Isha', label: 'Isya', icon: '\u{1F319}' },
];

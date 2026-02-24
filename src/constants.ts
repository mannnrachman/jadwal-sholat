import type { CalculationMethod } from './types/index';

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

export const DEFAULT_SETTINGS = {
  city: 'Banjarmasin',
  country: 'Indonesia',
  latitude: -3.3186,
  longitude: 114.5944,
  timezone: 'Asia/Makassar',
  method: 20,
  methodSettings: '',
  myquranCityId: '',
  locationInitialized: false,
  notificationsEnabled: true,
  soundEnabled: true,
};

export const PRAYER_DISPLAY = [
  { key: 'Imsak', label: 'Imsak', icon: '\u{25D4}' },
  { key: 'Fajr', label: 'Subuh', icon: '\u{2606}' },
  { key: 'Dhuhr', label: 'Dzuhur', icon: '\u{2600}' },
  { key: 'Asr', label: 'Ashar', icon: '\u{25D1}' },
  { key: 'Maghrib', label: 'Maghrib', icon: '\u{25D3}' },
  { key: 'Isha', label: 'Isya', icon: '\u{263D}' },
];

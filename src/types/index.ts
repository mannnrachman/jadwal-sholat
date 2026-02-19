export interface PrayerTimings {
  Imsak: string;
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Midnight: string;
}

export interface HijriMonth {
  number: number;
  en: string;
  ar: string;
}

export interface HijriDate {
  date: string;
  day: string;
  year: string;
  month: HijriMonth;
  weekday: { en: string; ar: string };
  holidays: string[];
}

export interface GregorianDate {
  date: string;
  day: string;
  month: { number: number; en: string };
  year: string;
  weekday: { en: string };
}

export interface AladhanData {
  timings: PrayerTimings;
  date: {
    readable: string;
    gregorian: GregorianDate;
    hijri: HijriDate;
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: { id: number; name: string };
  };
}

export interface AladhanResponse {
  code: number;
  status: string;
  data: AladhanData;
}

export interface GeoLocation {
  city: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
}

export interface AppSettings {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  method: number;
  methodSettings: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

export interface CalculationMethod {
  id: number;
  name: string;
  methodSettings: string;
}

export interface CityEntry {
  city: string;
  lat: number;
  lon: number;
}

export interface FastingStatus {
  isFasting: boolean;
  isRamadan: boolean;
  nextEvent: {
    name: string;
    time: string;
    timeLeft: string;
  };
  statusText: string;
}

export interface PrayerEntry {
  key: string;
  label: string;
  icon: string;
  time: string;
}

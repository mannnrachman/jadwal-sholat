import type { GeoLocation } from '../types/index';
import { DEFAULT_SETTINGS } from '../constants';

export async function detectLocation(): Promise<GeoLocation> {
  // Primary: ipapi.co
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      return {
        city: data.city || DEFAULT_SETTINGS.city,
        country: data.country_name || DEFAULT_SETTINGS.country,
        lat: data.latitude || DEFAULT_SETTINGS.latitude,
        lon: data.longitude || DEFAULT_SETTINGS.longitude,
        timezone: data.timezone || DEFAULT_SETTINGS.timezone,
      };
    }
  } catch {
    // Fall through to fallback
  }

  // Fallback: ip-api.com
  try {
    const res = await fetch('http://ip-api.com/json/');
    if (res.ok) {
      const data = await res.json();
      return {
        city: data.city || DEFAULT_SETTINGS.city,
        country: data.country || DEFAULT_SETTINGS.country,
        lat: data.lat || DEFAULT_SETTINGS.latitude,
        lon: data.lon || DEFAULT_SETTINGS.longitude,
        timezone: data.timezone || DEFAULT_SETTINGS.timezone,
      };
    }
  } catch {
    // Fall through to default
  }

  // Default: Banjarmasin
  return {
    city: DEFAULT_SETTINGS.city,
    country: DEFAULT_SETTINGS.country,
    lat: DEFAULT_SETTINGS.latitude,
    lon: DEFAULT_SETTINGS.longitude,
    timezone: DEFAULT_SETTINGS.timezone,
  };
}

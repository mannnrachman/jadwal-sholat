import type { GeoLocation } from '../types/index';
import { DEFAULT_SETTINGS } from '../constants';

function sanitizeCityName(city: string): string {
  return city
    .replace(/^\s*(kota|kab\.?|kabupaten)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

export async function detectLocation(): Promise<GeoLocation> {
  // Primary: ipapi.co
  try {
    const res = await fetchWithTimeout('https://ipapi.co/json/');
    if (res.ok) {
      const data = await res.json();
      return {
        city: sanitizeCityName(data.city || DEFAULT_SETTINGS.city),
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
    const res = await fetchWithTimeout('http://ip-api.com/json/');
    if (res.ok) {
      const data = await res.json();
      return {
        city: sanitizeCityName(data.city || DEFAULT_SETTINGS.city),
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

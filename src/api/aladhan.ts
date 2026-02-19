import type { AladhanResponse } from '../types/index';

function formatDate(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function stripTimezone(time: string): string {
  return time.replace(/\s*\(.*\)$/, '').trim();
}

export async function fetchPrayerTimes(
  lat: number,
  lon: number,
  method: number,
  methodSettings: string = '',
  date?: Date
): Promise<AladhanResponse> {
  const d = date || new Date();
  const dateStr = formatDate(d);

  // adjustment=-1 menyesuaikan tampilan tanggal Hijri dengan penetapan Kemenag RI (rukyat/MABIMS)
  // yang umumnya 1 hari lebih lambat dari kalender Hijri astronomis yang digunakan aladhan.com
  let url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=${method}&adjustment=-1`;

  if (method === 99 && methodSettings) {
    url += `&methodSettings=${methodSettings}`;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Aladhan API error: ${response.status}`);
  }

  const data: AladhanResponse = await response.json();

  // Strip timezone suffixes from all timings
  const timings = data.data.timings;
  for (const key of Object.keys(timings) as (keyof typeof timings)[]) {
    timings[key] = stripTimezone(timings[key]);
  }

  return data;
}

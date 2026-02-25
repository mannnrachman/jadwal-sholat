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

// Koreksi tanggal Hijri: aladhan.com menggunakan hisab astronomis (Muhammadiyah),
// sedangkan Kemenag/pemerintah RI menggunakan rukyat MABIMS yang umumnya 1 hari lebih lambat.
// Contoh: aladhan → 2 Ramadhan = seharusnya 1 Ramadhan per Kemenag
const HIJRI_MONTH_NAMES_EN = [
  '', 'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'
];
const HIJRI_MONTH_NAMES_AR = [
  '', 'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];
// Panjang bulan Hijri tabular: bulan ganjil 30 hari, genap 29 hari
function hijriMonthLength(month: number): number {
  return month % 2 === 1 ? 30 : 29;
}

function applyKemenagOffset(data: AladhanResponse, offset: number): void {
  const hijri = data.data.date.hijri;
  let day = parseInt(hijri.day) + offset;
  let month = hijri.month.number;
  let year = parseInt(hijri.year);

  if (day < 1) {
    month -= 1;
    if (month < 1) { month = 12; year -= 1; }
    day = hijriMonthLength(month) + day; // day negatif, jadi dikurangi dari panjang bulan
  } else if (day > hijriMonthLength(month)) {
    day = day - hijriMonthLength(month);
    month += 1;
    if (month > 12) { month = 1; year += 1; }
  }

  hijri.day = String(day);
  hijri.year = String(year);
  hijri.month.number = month;
  hijri.month.en = HIJRI_MONTH_NAMES_EN[month] ?? hijri.month.en;
  hijri.month.ar = HIJRI_MONTH_NAMES_AR[month] ?? hijri.month.ar;
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
  let url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=${method}`;

  if (method === 99 && methodSettings) {
    url += `&methodSettings=${methodSettings}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  let response: Response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
  if (!response.ok) {
    throw new Error(`Aladhan API error: ${response.status}`);
  }

  const data: AladhanResponse = await response.json();

  // Strip timezone suffixes from all timings
  const timings = data.data.timings;
  for (const key of Object.keys(timings) as (keyof typeof timings)[]) {
    timings[key] = stripTimezone(timings[key]);
  }

  // Koreksi tanggal Hijri berdasarkan metode:
  // - Kemenag RI (method 20): rukyat/MABIMS → 1 hari lebih lambat dari hisab astronomis aladhan → offset -1
  // - Muhammadiyah & metode lain: sudah sesuai kalkulasi astronomis → tidak perlu koreksi
  const hijriOffset = method === 20 ? -1 : 0;
  if (hijriOffset !== 0) {
    applyKemenagOffset(data, hijriOffset);
  }

  return data;
}

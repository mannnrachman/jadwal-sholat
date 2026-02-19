import type { AladhanData, FastingStatus, PrayerTimings } from '../types/index';

function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
}

function formatTimeLeft(ms: number): string {
  if (ms <= 0) return '0m';
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}j ${minutes}m lagi`;
  }
  return `${minutes}m lagi`;
}

const PRAYER_ORDER: { key: keyof PrayerTimings; label: string }[] = [
  { key: 'Imsak', label: 'Imsak' },
  { key: 'Fajr', label: 'Subuh' },
  { key: 'Sunrise', label: 'Terbit' },
  { key: 'Dhuhr', label: 'Dzuhur' },
  { key: 'Asr', label: 'Ashar' },
  { key: 'Maghrib', label: 'Maghrib' },
  { key: 'Isha', label: 'Isya' },
];

export function getCountdownStatus(data: AladhanData): FastingStatus {
  const now = new Date();
  const isRamadan = data.date.hijri.month.number === 9;

  const imsakTime = parseTime(data.timings.Imsak);
  const maghribTime = parseTime(data.timings.Maghrib);

  const isFasting = isRamadan && now >= imsakTime && now < maghribTime;

  // Find next event
  let nextEvent = { name: 'Imsak', time: data.timings.Imsak, timeLeft: '' };

  for (const prayer of PRAYER_ORDER) {
    const prayerTime = parseTime(data.timings[prayer.key]);
    if (now < prayerTime) {
      const msLeft = prayerTime.getTime() - now.getTime();
      nextEvent = {
        name: prayer.label,
        time: data.timings[prayer.key],
        timeLeft: formatTimeLeft(msLeft),
      };
      break;
    }
  }

  // If all today's prayers passed, next is tomorrow's Imsak
  const lastPrayer = parseTime(data.timings.Isha);
  if (now >= lastPrayer) {
    nextEvent = {
      name: 'Imsak (besok)',
      time: data.timings.Imsak,
      timeLeft: 'Besok',
    };
  }

  let statusText: string;
  if (!isRamadan) {
    statusText = 'Bukan Ramadan';
  } else if (isFasting) {
    statusText = 'Sedang Berpuasa';
  } else {
    statusText = 'Tidak Berpuasa';
  }

  return { isFasting, isRamadan, nextEvent, statusText };
}

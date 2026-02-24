import type { AladhanData, AppSettings, PrayerEntry } from '../types/index';
import { PRAYER_DISPLAY, CALCULATION_METHODS } from '../constants';
import { getCountdownStatus } from '../services/countdown';

export function renderApp(
  settings: AppSettings,
  onMethodChange: (methodId: number, methodSettings: string) => void,
  onRefresh: () => void,
  onQuit: () => void,
  onLocationClick: () => void,
  onUpdate: () => void
) {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div class="card">
      <div class="header">
        <span class="header-icon">\u{262A}</span>
        <span class="header-title">Jadwal Sholat</span>
      </div>

      <div class="location-section" id="location-area">
        <span class="location-icon">\u{27A4}</span>
        <span id="location-text">${settings.city}, ${settings.country}</span>
      </div>

      <div class="date-section">
        <span id="date-gregorian">Loading...</span>
        <span id="date-hijri"></span>
      </div>

      <div class="prayer-list" id="prayer-list">
        <div class="loading">Memuat jadwal...</div>
      </div>

      <div class="status-section" id="status-section">
        <span id="status-text">Loading...</span>
        <div class="fasting-progress-wrap" id="fasting-progress-wrap" style="display:none">
          <div class="fasting-progress-bar" id="fasting-progress-bar">
            <div class="fasting-progress-fill" id="fasting-progress-fill"></div>
          </div>
        </div>
        <div class="next-prayer" id="next-prayer-info">
          <span id="next-prayer-name"></span>
          <span id="next-prayer-timeleft"></span>
        </div>
      </div>

      <div class="footer">
        <div class="method-selector">
          <div class="method-label">Metode Perhitungan</div>
          <select id="method-select">
            ${CALCULATION_METHODS.map(
              (m) =>
                `<option value="${m.id}" data-settings="${m.methodSettings}" ${
                  m.id === settings.method ? 'selected' : ''
                }>${m.name}</option>`
            ).join('')}
          </select>
          <div id="method-hint" class="method-hint">Perubahan metode diterapkan otomatis.</div>
        </div>
        <div class="footer-buttons">
          <button id="btn-refresh" class="btn btn-secondary">Refresh</button>
          <button id="btn-quit" class="btn btn-danger">Quit</button>
        </div>
        <div class="footer-update">
          <button id="btn-update" class="btn-update">Cek Pembaruan &#x2197;</button>
        </div>
      </div>
    </div>

    <div class="city-overlay" id="city-overlay" style="display:none">
      <div class="city-search-panel">
        <div class="city-search-header">
          <span>Pilih Kabupaten/Kota</span>
          <button id="city-close" class="btn-close">\u{2715}</button>
        </div>
        <input type="text" id="city-search-input" placeholder="Cari kabupaten/kota..." autocomplete="off" />
        <div id="city-list" class="city-list"></div>
        <button id="btn-detect" class="btn btn-primary city-detect">Deteksi Otomatis</button>
      </div>
    </div>
  `;

  // Event listeners
  document.getElementById('method-select')!.addEventListener('change', (e) => {
    const select = e.target as HTMLSelectElement;
    const option = select.selectedOptions[0];
    const methodId = Number(select.value);
    const methodSettings = option.dataset.settings || '';
    onMethodChange(methodId, methodSettings);
  });

  document.getElementById('btn-refresh')!.addEventListener('click', onRefresh);
  document.getElementById('btn-quit')!.addEventListener('click', onQuit);
  document.getElementById('location-area')!.addEventListener('click', onLocationClick);
  document.getElementById('btn-update')!.addEventListener('click', onUpdate);
}

export function updatePrayerTimes(data: AladhanData) {
  const listEl = document.getElementById('prayer-list')!;
  const timings = data.timings;

  const entries: PrayerEntry[] = PRAYER_DISPLAY.map((p) => ({
    key: p.key,
    label: p.label,
    icon: p.icon,
    time: timings[p.key as keyof typeof timings] || '--:--',
  }));

  // Determine which is next prayer
  const now = new Date();
  let nextPrayerKey = '';
  for (const entry of entries) {
    const [h, m] = entry.time.split(':').map(Number);
    const prayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    if (prayerDate > now) {
      nextPrayerKey = entry.key;
      break;
    }
  }

  listEl.innerHTML = entries
    .map(
      (e) => `
    <div class="prayer-row ${e.key === nextPrayerKey ? 'prayer-next' : ''}">
      <span class="prayer-icon">${e.icon}</span>
      <span class="prayer-label">${e.label}</span>
      <span class="prayer-time">${e.time}</span>
    </div>
  `
    )
    .join('');
}

export function updateDate(data: AladhanData) {
  const greg = data.date.gregorian;
  const hijri = data.date.hijri;

  document.getElementById('date-gregorian')!.textContent =
    `${greg.day} ${greg.month.en} ${greg.year}`;
  document.getElementById('date-hijri')!.textContent =
    `${hijri.day} ${hijri.month.en} ${hijri.year} H`;
}

export function updateCountdown(data: AladhanData) {
  const status = getCountdownStatus(data);

  const section = document.getElementById('status-section')!;
  const text = document.getElementById('status-text')!;
  const progressWrap = document.getElementById('fasting-progress-wrap')!;
  const progressFill = document.getElementById('fasting-progress-fill')!;
  const progressBar = document.getElementById('fasting-progress-bar')!;
  const nextName = document.getElementById('next-prayer-name')!;
  const nextTimeLeft = document.getElementById('next-prayer-timeleft')!;

  section.classList.toggle('status-fasting', status.isFasting);
  text.textContent = status.statusText;

  if (status.isFasting && status.fastingProgress !== undefined) {
    const pct = Math.round(status.fastingProgress);
    progressWrap.style.display = 'block';
    progressFill.style.width = `${pct}%`;

    // Hitung sisa waktu hingga Maghrib
    const now = new Date();
    const [mH, mM] = data.timings.Maghrib.split(':').map(Number);
    const maghribTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), mH, mM);
    const msLeft = maghribTime.getTime() - now.getTime();
    let sisaLabel = '';
    if (msLeft > 0) {
      const totalMins = Math.floor(msLeft / 60000);
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      sisaLabel = h > 0 ? `${h}j ${m}m lagi` : `${m}m lagi`;
    }

    progressBar.title = `${pct}% telah berlalu${sisaLabel ? ` • ${sisaLabel} hingga buka` : ''}`;
  } else {
    progressWrap.style.display = 'none';
  }

  if (status.nextEvent.timeLeft) {
    nextName.textContent = status.nextEvent.name;
    nextTimeLeft.textContent = status.nextEvent.timeLeft;
  } else {
    nextName.textContent = '';
    nextTimeLeft.textContent = '';
  }
}

export function updateLocation(settings: AppSettings) {
  const el = document.getElementById('location-text');
  if (el) {
    el.textContent = `${settings.city}, ${settings.country}`;
  }
}

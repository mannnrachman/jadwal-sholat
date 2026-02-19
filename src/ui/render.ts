import type { AladhanData, AppSettings, PrayerEntry } from '../types/index';
import { PRAYER_DISPLAY, CALCULATION_METHODS } from '../constants';
import { getCountdownStatus } from '../services/countdown';

export function renderApp(
  settings: AppSettings,
  onMethodChange: (methodId: number, methodSettings: string) => void,
  onRefresh: () => void,
  onQuit: () => void,
  onLocationClick: () => void
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
        <span class="status-dot" id="status-dot"></span>
        <span id="status-text">Loading...</span>
        <span id="countdown-text" class="countdown"></span>
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
      </div>
    </div>

    <div class="city-overlay" id="city-overlay" style="display:none">
      <div class="city-search-panel">
        <div class="city-search-header">
          <span>Pilih Kota</span>
          <button id="city-close" class="btn-close">\u{2715}</button>
        </div>
        <input type="text" id="city-search-input" placeholder="Cari kota..." autocomplete="off" />
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

  const dot = document.getElementById('status-dot')!;
  const text = document.getElementById('status-text')!;
  const countdown = document.getElementById('countdown-text')!;

  dot.className = 'status-dot ' + (status.isFasting ? 'dot-green' : 'dot-gray');
  text.textContent = status.statusText;
  countdown.textContent =
    status.nextEvent.timeLeft
      ? `${status.nextEvent.name} ${status.nextEvent.time} (${status.nextEvent.timeLeft})`
      : '';
}

export function updateLocation(settings: AppSettings) {
  const el = document.getElementById('location-text');
  if (el) {
    el.textContent = `${settings.city}, ${settings.country}`;
  }
}

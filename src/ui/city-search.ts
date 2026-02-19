import type { AppSettings } from '../types/index';
import { INDONESIAN_CITIES } from '../constants';
import { detectLocation } from '../api/geolocation';

export function initCitySearch(
  settings: AppSettings,
  onCitySelect: (city: string, lat: number, lon: number) => void
) {
  const overlay = document.getElementById('city-overlay')!;
  const input = document.getElementById('city-search-input') as HTMLInputElement;
  const listEl = document.getElementById('city-list')!;
  const closeBtn = document.getElementById('city-close')!;
  const detectBtn = document.getElementById('btn-detect')!;

  function showOverlay() {
    overlay.style.display = 'flex';
    input.value = '';
    input.focus();
    renderCities('');
  }

  function hideOverlay() {
    overlay.style.display = 'none';
  }

  function renderCities(filter: string) {
    const filtered = INDONESIAN_CITIES.filter((c) =>
      c.city.toLowerCase().includes(filter.toLowerCase())
    );

    listEl.innerHTML = filtered
      .map(
        (c) => `
      <div class="city-item" data-city="${c.city}" data-lat="${c.lat}" data-lon="${c.lon}">
        ${c.city}
      </div>
    `
      )
      .join('');

    // Attach click handlers
    listEl.querySelectorAll('.city-item').forEach((el) => {
      el.addEventListener('click', () => {
        const city = (el as HTMLElement).dataset.city!;
        const lat = parseFloat((el as HTMLElement).dataset.lat!);
        const lon = parseFloat((el as HTMLElement).dataset.lon!);
        onCitySelect(city, lat, lon);
        hideOverlay();
      });
    });
  }

  input.addEventListener('input', () => {
    renderCities(input.value);
  });

  closeBtn.addEventListener('click', hideOverlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideOverlay();
  });

  detectBtn.addEventListener('click', async () => {
    detectBtn.textContent = 'Mendeteksi...';
    detectBtn.setAttribute('disabled', 'true');
    try {
      const loc = await detectLocation();
      onCitySelect(loc.city, loc.lat, loc.lon);
      hideOverlay();
    } catch {
      detectBtn.textContent = 'Gagal. Coba lagi';
    } finally {
      detectBtn.removeAttribute('disabled');
      detectBtn.textContent = 'Deteksi Otomatis';
    }
  });

  // Expose show function
  document.getElementById('location-area')!.addEventListener('click', showOverlay);
}

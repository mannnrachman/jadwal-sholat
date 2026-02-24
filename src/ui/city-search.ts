import type { MyQuranCity } from '../types/index';
import { detectLocation } from '../api/geolocation';
import { fetchAllMyQuranCities, searchMyQuranCity } from '../api/myquran';

export function initCitySearch(
  onCitySelect: (city: string, lat: number, lon: number, myquranCityId: string) => void
) {
  const overlay = document.getElementById('city-overlay')!;
  const input = document.getElementById('city-search-input') as HTMLInputElement;
  const listEl = document.getElementById('city-list')!;
  const closeBtn = document.getElementById('city-close')!;
  const detectBtn = document.getElementById('btn-detect')!;
  let allCitiesCache: MyQuranCity[] = [];
  let citiesLoading: Promise<void> | null = null;

  function setListLoading(message: string) {
    listEl.innerHTML = `<div class="loading">${message}</div>`;
  }

  async function ensureCitiesLoaded() {
    if (allCitiesCache.length > 0) return;
    if (citiesLoading) {
      await citiesLoading;
      return;
    }

    setListLoading('Memuat kabupaten/kota...');
    citiesLoading = (async () => {
      allCitiesCache = await fetchAllMyQuranCities();
    })();
    await citiesLoading;
    citiesLoading = null;
  }

  function showOverlay() {
    overlay.style.display = 'flex';
    input.value = '';
    input.focus();
    void renderCities('');
  }

  function hideOverlay() {
    overlay.style.display = 'none';
  }

  async function renderCities(filter: string) {
    try {
      await ensureCitiesLoaded();
      const keyword = filter.trim().toLowerCase();
      const filtered = allCitiesCache.filter((c) => c.lokasi.toLowerCase().includes(keyword));

      listEl.innerHTML = filtered
      .map(
        (c) => `
      <div class="city-item" data-id="${c.id}" data-city="${c.lokasi}">
        ${c.lokasi}
      </div>
    `
      )
      .join('');

      if (!filtered.length) {
        setListLoading('Tidak ada hasil.');
      }

      listEl.querySelectorAll('.city-item').forEach((el) => {
        el.addEventListener('click', () => {
          const city = (el as HTMLElement).dataset.city!;
          const myquranCityId = (el as HTMLElement).dataset.id!;
          onCitySelect(city, 0, 0, myquranCityId);
          hideOverlay();
        });
      });
    } catch {
      setListLoading('Gagal memuat data kota. Coba lagi.');
    }
  }

  input.addEventListener('input', () => {
    void renderCities(input.value);
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
      const matches = await searchMyQuranCity(loc.city);
      if (!matches.length) {
        detectBtn.textContent = 'Kota tidak ditemukan';
        return;
      }

      onCitySelect(matches[0].lokasi, loc.lat, loc.lon, matches[0].id);
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

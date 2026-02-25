# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.2] - 2026-02-25

### Fixed

- **Adzan tidak tepat waktu saat aplikasi baru dibuka**: Ganti mekanisme `setTimeout` jangka panjang dengan polling interval 15 detik yang cek `Date.now()` real-time. Tahan throttle WebView, tahan sleep/hibernate/wake, tidak pernah meleset jauh
- **Adzan bunyi saat startup (catch-up bug)**: Waktu sholat yang sudah lewat >90 detik saat app dibuka tidak lagi di-fire ulang secara salah
- **Adzan duplicate saat Refresh/hourly interval**: Tambah `firedKeys` set per hari — setiap waktu sholat hanya bisa bunyi sekali per hari
- **Network hang tanpa batas saat startup**: Semua fetch API (Aladhan, myQuran, geolocation) kini pakai `AbortController` dengan timeout 8 detik
- **Tidak ada jadwal saat network gagal waktu boot**: Jadwal terakhir yang berhasil kini di-cache di settings store dan langsung dipakai saat startup sebelum fetch selesai
- **Tidak ada indikator sumber jadwal aktif**: Tambah hint kecil di UI yang menunjukkan apakah jadwal berasal dari myQuran (Kemenag) atau Aladhan (fallback)
- **Fetch gagal tidak dicoba ulang**: Tambah auto-retry 30 detik saat fetch API gagal, sebelumnya hanya retry setelah 1 jam

## [1.1.1] - 2026-02-24

### Added

- Auto-start on OS login enabled by default after installation

### Fixed

- Tauri bundle version source aligned so generated installer filenames follow the intended app version

## [1.1.0] - 2026-02-24

### Added

- myQuran API v3 integration as primary prayer-times source for Indonesia (Kemenag-based city list)
- Dynamic city search backed by myQuran city endpoints (517+ kabupaten/kota)
- Release link button in app UI pointing to GitHub Releases page
- Screenshot assets for light/dark app preview in README

### Changed

- Prayer data flow now uses myQuran as primary source with Aladhan as fallback/hijri companion
- Fasting progress bar UX and status section layout for clearer next-prayer information
- Widget height/layout adjusted to keep full prayer list visible without internal schedule scrolling
- README rewritten to concise English format with API source section

### Fixed

- Initial location detection flow now uses explicit `locationInitialized` flag (instead of default-city check)
- Removed automatic adhan playback test hook during development startup
- Tooltip on fasting progress now includes percentage and remaining time context

## [1.0.0] - 2026-02-19

### Added

- Initial release of Jadwal Sholat desktop widget
- System tray icon with left-click toggle and right-click menu (Show / Refresh / Quit)
- Real-time prayer schedule: Imsak, Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha
- Live countdown to the next prayer time, updated every second
- Desktop notifications with adhan sound at each prayer time
- In-app toast notification as fallback display
- Hijri date display with automatic **-1 day correction** for Kemenag RI (rukyat/MABIMS) when using method 20
- Auto location detection via `ip-api.com` / `ipapi.co` on first launch
- City search with preset list of Indonesian cities + manual coordinate input
- 8 calculation methods: Kemenag RI, Muhammadiyah, MWL, ISNA, Egyptian, Umm Al-Qura, Karachi, MUIS
- Method hint feedback — shows confirmation when method is changed and detects if schedule actually differs
- Adaptive tray icon — switches between dark/light based on system theme (Windows registry on Windows, `dark-light` crate on macOS/Linux)
- Transparent, frameless, always-on-top widget window, positioned near tray icon
- Persistent settings via `tauri-plugin-store` (city, coordinates, method, notification/sound preferences)
- GitHub Actions CI: QA workflow (TypeScript check + Rust fmt/clippy) and Release workflow (cross-platform build via `tauri-apps/tauri-action`)
- README, LICENSE (MIT), and CONTRIBUTING guide

[1.0.0]: https://github.com/mannnrachman/jadwal-sholat/releases/tag/v1.0.0
[1.1.0]: https://github.com/mannnrachman/jadwal-sholat/releases/tag/v1.1.0
[1.1.1]: https://github.com/mannnrachman/jadwal-sholat/releases/tag/v1.1.1
[1.1.2]: https://github.com/mannnrachman/jadwal-sholat/releases/tag/v1.1.2

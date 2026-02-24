# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

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

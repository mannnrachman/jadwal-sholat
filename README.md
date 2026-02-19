# Jadwal Sholat

> A lightweight desktop system tray widget for Islamic prayer times. Runs quietly in the system tray, supports notifications with adhan sound, and adapts to your local timezone automatically.

![Version](https://img.shields.io/badge/version-1.0.0-green)
![Tauri](https://img.shields.io/badge/Tauri-2.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Rust](https://img.shields.io/badge/Rust-2021-orange)
![License](https://img.shields.io/badge/license-MIT-lightgrey)
[![QA](https://github.com/mannnrachman/jadwal-sholat/actions/workflows/qa.yml/badge.svg)](https://github.com/mannnrachman/jadwal-sholat/actions/workflows/qa.yml)
[![Release](https://github.com/mannnrachman/jadwal-sholat/actions/workflows/release.yml/badge.svg)](https://github.com/mannnrachman/jadwal-sholat/actions/workflows/release.yml)

---

## Features

- **Real-time prayer schedule** — Imsak, Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha
- **Automatic countdown** — live countdown to the next prayer time
- **Notifications + adhan sound** — alert plays exactly at prayer time
- **Hijri date display** — with correction applied for Kemenag RI rukyat/MABIMS method
- **Auto location detection** — geolocation on first launch
- **City search** — preset list of Indonesian cities + manual search
- **Multiple calculation methods** — Kemenag RI, Muhammadiyah, MWL, ISNA, and more
- **Adaptive tray icon** — automatically switches between dark/light based on system theme
- **Persistent settings** — city, method, and preferences saved automatically
- **Transparent frameless UI** — modern widget always on top, no taskbar clutter

---

## Tech Stack

| Layer             | Technology                                                     |
| ----------------- | -------------------------------------------------------------- |
| Desktop framework | [Tauri 2](https://tauri.app)                                   |
| Frontend          | TypeScript + Vite                                              |
| Backend (native)  | Rust                                                           |
| Prayer times API  | [Aladhan API](https://aladhan.com/prayer-times-api)            |
| Geolocation       | [ip-api.com](http://ip-api.com) + [ipapi.co](https://ipapi.co) |
| Settings storage  | `tauri-plugin-store`                                           |
| Notifications     | `tauri-plugin-notification`                                    |
| Tray positioning  | `tauri-plugin-positioner`                                      |

---

## OS Support

| OS                | Status     | Notes                                                                                                               |
| ----------------- | ---------- | ------------------------------------------------------------------------------------------------------------------- |
| **Windows 10/11** | ✅ Full    | Primary platform; taskbar theme detection via Windows registry                                                      |
| **macOS 11+**     | ✅ Full    | Tray icon and window positioning work natively                                                                      |
| **Linux**         | ⚠️ Limited | Depends on the desktop environment; tray icon not available on all DEs (e.g. GNOME requires AppIndicator extension) |

---

## Prerequisites

- [Node.js](https://nodejs.org) >= 18
- [Rust](https://rustup.rs) >= 1.77 (via `rustup`)
- [Tauri CLI v2](https://tauri.app/start/prerequisites/)
- **Windows**: Microsoft C++ Build Tools
- **Linux**: `libwebkit2gtk-4.1`, `libgtk-3-dev`, `libayatana-appindicator3-dev` (for tray support)

---

## Installation & Running

### 1. Clone the repository

```bash
git clone https://github.com/mannnrachman/jadwal-sholat.git
cd jadwal-sholat
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run in development mode

```bash
npm run tauri dev
```

### 4. Build for production

```bash
npm run tauri build
```

The installer will be available at `src-tauri/target/release/bundle/`.

---

## Usage

1. Launch the app — an icon will appear in the system tray
2. Click the tray icon to show/hide the widget
3. On first launch, your location is detected automatically
4. Click the city name to search and change your city manually
5. Select a calculation method from the dropdown at the bottom of the widget
6. Notifications and adhan sound will play automatically at each prayer time

### Right-click tray menu

| Menu    | Action                   |
| ------- | ------------------------ |
| Show    | Toggle widget visibility |
| Refresh | Reload schedule from API |
| Quit    | Exit the application     |

---

## Calculation Methods

Local prayer times are automatically calculated based on GPS coordinates (latitude/longitude) — timezone/GMT is adjusted automatically. **The method only affects the Fajr and Isha angles** (dawn/dusk threshold). Geographic names in method names refer to the organization that established the standard, not a usage restriction by region.

| ID  | Name                            |
| --- | ------------------------------- |
| 20  | Kemenag RI _(default)_          |
| 99  | Muhammadiyah                    |
| 3   | Muslim World League (MWL)       |
| 2   | ISNA (North America)            |
| 5   | Egyptian General Authority      |
| 4   | Umm Al-Qura, Makkah             |
| 1   | Univ. Islamic Sciences, Karachi |
| 11  | MUIS (Singapore)                |

---

## Project Structure

```
├── src/
│   ├── api/
│   │   ├── aladhan.ts        # Aladhan API integration + Kemenag Hijri correction
│   │   └── geolocation.ts    # Automatic location detection
│   ├── services/
│   │   ├── countdown.ts      # Prayer countdown logic
│   │   ├── notifications.ts  # Notifications & adhan sound
│   │   └── settings.ts       # Load/save persistent settings
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces & types
│   ├── ui/
│   │   ├── city-search.ts    # City search component
│   │   └── render.ts         # Main UI renderer
│   ├── constants.ts          # City list, methods, and default settings
│   ├── main.ts               # App entry point
│   └── style.css             # Widget styling
├── src-tauri/
│   ├── src/
│   │   ├── main.rs           # Tauri entry point
│   │   ├── lib.rs            # Plugin & command registration
│   │   └── tray.rs           # System tray setup & adaptive icon
│   ├── icons/                # App icons
│   ├── Cargo.toml
│   └── tauri.conf.json       # Tauri configuration
├── public/
│   └── sounds/               # Adhan audio files
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Hijri Date Note

Aladhan.com returns Hijri dates based on the astronomical calendar (hisab). Date correction is applied based on the selected method:

- **Kemenag RI (method 20)** — a **-1 day** offset is applied automatically as a pragmatic adjustment. The Aladhan API does not natively provide a rukyat/Kemenag version of the Hijri calendar, so this correction is the best approach available at the application level.
- **Muhammadiyah & other methods** — the Hijri date is displayed as-is from the Aladhan astronomical calendar, with no correction.

---

## Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) guide before submitting a pull request.

---

## License

[MIT](LICENSE)

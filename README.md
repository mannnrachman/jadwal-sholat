# Jadwal Sholat Widget

A lightweight desktop tray widget for daily prayer times.

[![GitHub release](https://img.shields.io/github/v/release/mannnrachman/jadwal-sholat?color=green)](https://github.com/mannnrachman/jadwal-sholat/releases/latest)
![Tauri](https://img.shields.io/badge/Tauri-2.x-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![Rust](https://img.shields.io/badge/Rust-2021-orange)

## Preview

<div align="center">
  <img src="public/images/light.png" alt="Jadwal Sholat - Light" height="520" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="public/images/dark.png" alt="Jadwal Sholat - Dark" height="520" />
</div>

## Features

- Real-time prayer schedule: Imsak, Fajr, Dhuhr, Asr, Maghrib, Isha
- Countdown to the next prayer time
- Fasting status with progress bar (Fajr → Maghrib)
- Notifications with adhan sound
- Fast city search (Indonesia)
- Adaptive tray icon for light/dark theme

## API Sources

- Primary prayer times (Indonesia / Kemenag-based): [myQuran API v3](https://api.myquran.com/)
- Hijri date + fallback prayer times: [Aladhan API](https://aladhan.com/prayer-times-api)
- IP geolocation: [ipapi.co](https://ipapi.co) with fallback [ip-api.com](http://ip-api.com)

## Download

Get the latest release from [Releases](https://github.com/mannnrachman/jadwal-sholat/releases/latest):

- Windows: `.msi` / `.exe`
- macOS: `.dmg`
- Linux: `.deb` / `.AppImage`

## Development

```bash
git clone https://github.com/mannnrachman/jadwal-sholat.git
cd jadwal-sholat
npm install
npm run tauri dev
```

Build production:

```bash
npm run tauri build
```

## License

[MIT](LICENSE)

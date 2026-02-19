# Contributing to Jadwal Sholat

Thank you for your interest in contributing! This document outlines the process for reporting issues, suggesting features, and submitting code changes.

---

## Repository

[https://github.com/mannnrachman/jadwal-sholat](https://github.com/mannnrachman/jadwal-sholat)

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:

   ```bash
   git clone https://github.com/your-username/jadwal-sholat.git
   cd jadwal-sholat
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Run in development mode:**

   ```bash
   npm run tauri dev
   ```

---

## How to Contribute

### Reporting Bugs

- Open an issue at [github.com/mannnrachman/jadwal-sholat/issues](https://github.com/mannnrachman/jadwal-sholat/issues)
- Include your OS, app version, and steps to reproduce the problem
- Attach screenshots or logs if available

### Suggesting Features

- Open an issue with the `enhancement` label
- Describe the feature and the use case clearly

### Submitting a Pull Request

1. Create a new branch from `main`:

   ```bash
   git checkout -b feat/your-feature-name
   ```

2. Make your changes with clear, focused commits
3. Ensure the app builds without errors:

   ```bash
   npm run build
   ```

4. Push your branch and open a Pull Request against `main`
5. Describe what your PR changes and why

---

## Code Guidelines

- **TypeScript** for all frontend code — avoid `any` types where possible
- **Rust** follows standard `cargo fmt` and `clippy` conventions
- Keep UI changes consistent with the existing transparent/dark widget style
- Changes to prayer time logic or Hijri date handling must include a clear explanation in the PR description

---

## Project Structure

See [README.md](README.md#project-structure) for a full breakdown of the codebase.

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

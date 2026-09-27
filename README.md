<p align="center">
  <img src="static/brand/moon-dancer-icon-transparent.png" width="144" alt="Moon Dancer icon: a white cat sleeping on a crescent moon" />
</p>

<h1 align="center">Moon Dancer</h1>

<p align="center">
  <strong>A quiet, private space to write, remember, and follow the moon.</strong>
</p>

<p align="center">
  <a href="https://github.com/Aykolin/moon-dancer/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/Aykolin/moon-dancer?display_name=tag&sort=semver&style=flat-square&color=cba6f7" /></a>
  <img alt="Windows" src="https://img.shields.io/badge/Windows-10%2B-89b4fa?style=flat-square&logo=windows" />
  <img alt="Linux" src="https://img.shields.io/badge/Linux-AppImage%20%7C%20DEB-a6e3a1?style=flat-square&logo=linux&logoColor=11111b" />
  <a href="LICENSE"><img alt="Proprietary license" src="https://img.shields.io/badge/license-proprietary-f5c2e7?style=flat-square" /></a>
</p>

Moon Dancer is an offline-first desktop journal for Windows and Linux. It brings together personal writing, organized notes, memories, and a lunar calendar in a focused pixel-art interface inspired by Catppuccin.

No account is required. Journal entries and notes remain on the user's computer, and the core experience works without an internet connection.

> **Moon Dancer 1.0 is the first stable release.** Ready-to-install packages are available on the [Releases page](https://github.com/Aykolin/moon-dancer/releases/latest).

## Download

| Platform | Recommended package | Alternative |
| --- | --- | --- |
| Windows 10 or later | `.exe` installer | `.msi` installer |
| Linux | Portable `.AppImage` | `.deb` for Debian and Ubuntu |

Download the package for your operating system from [GitHub Releases](https://github.com/Aykolin/moon-dancer/releases/latest). End users do not need Node.js, Rust, or the source code.

## What Moon Dancer offers

| Area | Capabilities |
| --- | --- |
| Journal | Dated entries with title, mood, content, and calculated lunar phase. |
| Notes | Categories, favorites, search, and automatic draft saving. |
| Lunar calendar | Monthly navigation, eight lunar phases, and direct access to entries by date. |
| Memories | Rediscovery of journal entries and notes from the past. |
| Backup | Export and restore through the dedicated `.moonbackup` format. |
| Privacy | Local SQLite storage, offline operation, and no required account. |
| Personalization | Portuguese and English, adjustable text size, reduced motion, and five Catppuccin-inspired themes. |
| Desktop mascot | Movable, always-on-top pixel-art companion with shortcuts to Journal, Notes, and Calendar. |

## Designed as a desktop companion

Moon Dancer uses a custom frameless window with native movement, resizing, minimize, maximize, and close controls. Its movable mascot remains available when the main window is hidden and can be disabled at any time in Settings.

The interface combines pixel typography, lunar artwork, transparent window edges, and five appearance options:

- **Mocha (Default)** — deep background with mauve and lavender signals.
- **Mocha Lavender** — a softer lavender-led variation.
- **Lunar Blue** — blue and teal accents over the Mocha base.
- **Mocha Rose** — warmer pink and peach accents.
- **Light Latte** — a clear Catppuccin Latte-inspired option.

## Privacy by design

- Personal content is stored in a local SQLite database.
- Search and lunar calculations run on the device.
- The application does not require an account or cloud service.
- Backups are created only when requested by the user.
- The interface PIN prevents casual access but does not encrypt the database.
- `.moonbackup` files are not encrypted and should be stored in a protected location.

## Using the mascot

- **Click:** open the radial shortcuts.
- **Click and drag:** move the mascot around the desktop.
- **Right-click:** hide only the mascot or fully quit Moon Dancer.
- **Settings → Mascot:** enable or disable the desktop companion.

## Backup and restore

Moon Dancer exports journal entries and notes to a `.moonbackup` archive. Before restoring, the desktop application validates the backup format and SQLite integrity and preserves a snapshot of the current database.

Backups are designed for Moon Dancer and should not be manually modified.

## Development

### Requirements

- Node.js 20 or later.
- pnpm 11.
- Rust stable for native development.
- The platform dependencies required by [Tauri 2](https://v2.tauri.app/start/prerequisites/).

### Setup

```bash
git clone https://github.com/Aykolin/moon-dancer.git
cd moon-dancer
pnpm install --frozen-lockfile
```

Start the browser preview:

```bash
pnpm dev
```

Start the native desktop application:

```bash
pnpm tauri dev
```

The browser preview uses local storage and cannot reproduce every native desktop behavior. Native builds use SQLite and support the independent transparent mascot window.

### Quality checks

```bash
pnpm check
pnpm test
pnpm build
```

### Available commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the frontend development server. |
| `pnpm check` | Run Svelte and TypeScript diagnostics. |
| `pnpm test` | Run the automated test suite. |
| `pnpm build` | Create a production frontend build. |
| `pnpm tauri dev` | Start the native application in development mode. |
| `pnpm tauri build` | Build packages for the current operating system. |
| `pnpm desktop:build:windows` | Validate and create local Windows `.exe` and `.msi` installers. |

## Release process

Moon Dancer uses semantic versioning and publishes native packages through GitHub Actions. A tag must match the version declared in `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`.

For version 1.0.0, the release tag is:

```text
v1.0.0
```

Pushing the matching tag starts Windows and Linux builds. The release is published only after both platforms complete successfully.

## Project structure

```text
src/
  components/       Shared interface and navigation components
  screens/          Journal, notes, calendar, memories, backup, and settings
  lib/              Storage, lunar calculations, preferences, and desktop APIs

src-tauri/
  src/lib.rs        Native services, SQLite access, backup, and window lifecycle
  capabilities/     Tauri desktop permissions
  icons/            Application and installer icons

static/
  brand/            Moon Dancer identity assets
  fonts/            Pixelify Sans and its OFL license
  moons/            Pixel-art lunar phase sprites
  mascot/           Desktop companion artwork

tests/              Automated application tests
```

## Ownership and contributions

Moon Dancer is an independently developed, proprietary project by **Kauany Santos (Aykolin)**. The repository is publicly visible for transparency and portfolio purposes; public visibility does not make the project open source.

External code contributions are not currently accepted. Issues may be used to report bugs or suggest improvements, while the project owner retains sole control over the codebase and repository.

## License

Copyright © 2026 Kauany Santos (Aykolin). All rights reserved.

Official compiled releases may be used for personal, non-commercial purposes. Copying, modifying, redistributing, sublicensing, selling, relicensing, or creating derivative works from the source code, artwork, interface, documentation, or project identity requires prior written permission.

See [LICENSE](LICENSE) for the complete terms.

## Author

Created and maintained by **Kauany Santos — Aykolin**.

- GitHub: [@Aykolin](https://github.com/Aykolin)

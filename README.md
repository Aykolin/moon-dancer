<p align="center">
  <img src="static/brand/moon-dancer-icon-transparent.png" width="128" alt="Moon Dancer application icon" />
</p>

<h1 align="center">Moon Dancer</h1>

<p align="center">
  A private, offline-first lunar journal for Windows and Linux.
</p>

Moon Dancer is a desktop application for journaling, organizing notes, revisiting memories, and following the lunar cycle. It requires no account and stores personal content locally on the user's computer.

> **Project status:** Active development. Ready-to-install packages are distributed through [GitHub Releases](https://github.com/Aykolin/moon-dancer/releases).

## Features

- Journal entries with date, title, mood, and lunar phase.
- Categorized notes with favorites and automatic draft saving.
- Monthly calendar with eight calculated lunar phases.
- Local search across journal entries and notes.
- Memories from entries written on the same date in previous years.
- Backup and restore using the `.moonbackup` format.
- Optional PIN lock for casual access protection.
- Five Catppuccin terminal variants: Mocha, Lavender, Lunar Blue, Rose, and the light Latte theme.
- Frameless floating desktop window with a transparent outer area and functional custom controls.
- Pixelify Sans typography and custom pixel-art moon phases.
- Always-on-top pixel-art desktop mascot with radial shortcuts.
- Right-click mascot menu for hiding the companion or fully exiting the application.
- Offline operation with no account or external service required.

## Themes

| Theme | Description |
| --- | --- |
| Mocha (Default) | Deep base with mauve and pink signal accents. |
| Mocha Lavender | Lavender-led terminal accents. |
| Lunar Blue | Blue and teal accents over the Mocha base. |
| Mocha Rose | Pink and peach accents over the Mocha base. |

## Technology Stack

- [Tauri 2](https://tauri.app/) for the desktop application shell.
- [Svelte 5](https://svelte.dev/) and TypeScript for the user interface.
- Rust for native commands and application services.
- SQLite for local desktop storage.
- Vite for frontend development and production builds.
- Vitest for automated testing.

## Prerequisites

Frontend development requires:

- Node.js 20 or later.
- pnpm.

Desktop development additionally requires:

- The stable Rust toolchain.
- Platform-specific C++ build tools.
- The system dependencies required by Tauri 2.

Refer to the [Tauri prerequisites documentation](https://v2.tauri.app/start/prerequisites/) for operating-system-specific setup.

## Getting Started

Clone the repository and install the dependencies:

```bash
git clone https://github.com/Aykolin/moon-dancer.git
cd moon-dancer
pnpm install
```

Start the frontend development server:

```bash
pnpm dev
```

The development preview is available at `http://127.0.0.1:1420`.

Browser preview data is stored in browser local storage and is separate from the SQLite database used by the desktop application.

## Desktop Development

After installing the Tauri and Rust prerequisites, start the native application:

```bash
pnpm tauri dev
```

The SQLite database is created automatically in the operating system's application data directory.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the frontend development server. |
| `pnpm check` | Run Svelte and TypeScript diagnostics. |
| `pnpm test` | Run the automated test suite. |
| `pnpm build` | Create a production frontend build. |
| `pnpm tauri dev` | Run the desktop application in development mode. |
| `pnpm tauri build` | Build native application packages. |

## Building Installers

End users do not need Node.js, Rust, or the source code. Download the ready-to-install package from the repository's **Releases** page:

- Windows: use the `.exe` installer. An `.msi` package is also provided.
- Linux: use the portable `.AppImage` or the `.deb` package for Debian-based distributions.

The workflow in `.github/workflows/release.yml` builds Windows and Linux packages on their native GitHub runners. It does not create commits or change the project source. To publish a version:

1. Update the version in `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`.
2. Review the changes, create your release commit, and push it to GitHub.
3. Create and push the matching tag, such as `v0.3.0` for application version `0.3.0`.
4. Wait for the **Build desktop installers** workflow to finish.
5. The completed release and its Windows and Linux downloads are published automatically.

The workflow verifies that all three version fields and the Git tag match before building. If either platform fails, the release remains unpublished so users do not receive an incomplete version.

The `executables/` directory documents the expected packages and can hold private or offline copies. Generated binaries are ignored by Git and should normally remain attached to GitHub Releases.

### Local build

Create a native production build with:

```bash
pnpm tauri build
```

Generated packages are written to:

```text
src-tauri/target/release/bundle/
```

Windows builds can produce NSIS (`.exe`) and MSI installers. Linux builds produce AppImage and Debian packages. Build each platform on its corresponding operating system.

Release binaries should be published through the repository's **Releases** page rather than committed directly to the source tree.

## Project Structure

```text
src/
  components/       Shared interface components and navigation
  screens/          Application screens
  lib/              Calendar, backup, storage, and preferences

src-tauri/
  src/lib.rs        Native data services and floating mascot window lifecycle
  capabilities/     Tauri application permissions

static/
  brand/            Application identity assets
  fonts/            Pixelify Sans and its OFL license
  moons/            Pixel-art lunar phase sprites
  mascot/           Interactive mascot artwork

tests/              Automated tests
```

## Data Storage

The desktop application stores journal entries and notes in a local SQLite database. The interface does not access the database file directly; operations are handled through native Tauri commands.

The browser development preview uses local storage as a lightweight fallback. Browser data is not automatically migrated to the desktop database.

## Desktop Mascot

The native application keeps the mascot in a small transparent, always-on-top window. Closing the main window hides it while the mascot remains available on the desktop. Click the mascot for Journal, Notes, and Calendar shortcuts, or right-click it to hide only the mascot or exit Moon Dancer completely.

The floating mascot can be disabled from **Settings → Mascot**. When disabled, closing the main window exits the application normally. The regular browser preview displays the mascot inside the application because browser tabs cannot create a system-level transparent companion window.

## Backup and Restore

The `.moonbackup` format contains the data required to restore journal entries and notes.

Before restoring a backup, Moon Dancer validates its format, version, and contents. The native desktop implementation also checks SQLite integrity and preserves a snapshot of the current database before replacement.

Backups are not encrypted in the current version. Store them in a protected location.

## Privacy and Security

- No account is required.
- Journal entries and notes are not automatically transmitted over the internet.
- Search is performed locally.
- Lunar phases are calculated on the device.
- The optional PIN lock only protects against casual interface access.
- The PIN lock does not encrypt the SQLite database or backup files.

## Testing

Run all checks before submitting a change:

```bash
pnpm check
pnpm test
pnpm build
```

The test suite covers lunar calculations, calendar generation, backup validation, preferences, and PIN verification.

## Contributing

1. Fork the repository.
2. Create a branch from `main`.
3. Keep changes focused and consistent with the existing design.
4. Run the checks listed in the testing section.
5. Open a pull request describing the change and how it was verified.

Do not commit generated directories, local databases, or backup files. The existing `.gitignore` excludes the main generated and personal-data artifacts.

## Author

Created by **Kauany Santos**, also known as **Aykolin**.

- GitHub: [@Aykolin](https://github.com/Aykolin)

## License

Open source.

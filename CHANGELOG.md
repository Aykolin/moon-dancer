# Changelog

All notable changes to Moon Dancer are documented in this file.

The project follows [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-09-27

Moon Dancer's first stable desktop release.

### Added

- Local-first journal entries with mood, date, and lunar phase.
- Categorized notes with favorites, search, and draft saving.
- Monthly lunar calendar with eight calculated moon phases.
- Memories view for rediscovering previous writing.
- `.moonbackup` export, validation, integrity checks, and restore snapshots.
- Portuguese and English interface options.
- Five Catppuccin-inspired themes, text scaling, and reduced motion.
- Optional PIN lock for casual interface access.
- Movable, always-on-top pixel-art mascot with radial shortcuts.
- Native Windows and Linux packaging through automated releases.

### Desktop

- Frameless, transparent application window with native movement and resizing.
- Functional minimize, maximize, restore, and close controls.
- Transparent application and installer icons.
- Independent mascot lifecycle when the main window is hidden.

### Privacy

- No required account or cloud service.
- Local SQLite storage for journal entries and notes.
- On-device search and lunar calculations.

### Important notes

- The optional PIN is not database encryption.
- `.moonbackup` files are not encrypted.
- Moon Dancer is proprietary, source-available software. See `LICENSE`.

[1.0.0]: https://github.com/Aykolin/moon-dancer/releases/tag/v1.0.0

# Moon Dancer downloads

Official Windows and Linux packages are built automatically for every tagged version and attached to the corresponding GitHub Release.

## Get the latest version

**[Download the latest Moon Dancer release](https://github.com/Aykolin/moon-dancer/releases/latest)**

This link always redirects to the most recent published version, so it does not need to be updated after each release.

## Available packages

| Platform | File | Recommended use |
| --- | --- | --- |
| Windows | `Moon Dancer_*_x64-setup.exe` | Recommended installer for most users. |
| Windows | `Moon Dancer_*_x64_en-US.msi` | Managed or administrative installation. |
| Linux | `moon-dancer_*.AppImage` | Portable launch on most modern distributions. |
| Linux | `moon-dancer_*_amd64.deb` | Debian, Ubuntu, Linux Mint, and compatible systems. |

## Why the binaries are not stored here

Generated installers are intentionally excluded from Git. GitHub Releases provides versioned downloads without making the source history unnecessarily large.

The release workflow does not create source commits. It builds the packages from the tag created by the project owner, waits for both Windows and Linux builds, and then publishes the completed Release.

Local packages may be copied into the platform folders for private or offline testing, but public downloads should always use GitHub Releases.

## Current stable series

Moon Dancer 1.x is the stable release series. Version details are available in the project [CHANGELOG](../CHANGELOG.md).

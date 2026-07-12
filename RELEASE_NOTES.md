# Roadbook 1.1.2

This reliability update turns Roadbook into a genuine single-file Windows app.

## What changed

- `Roadbook.exe` now contains the complete application; there is no `_internal` folder to separate accidentally.
- Fixed the misleading “Failed to load Python DLL” error caused when the EXE was moved away from its support folder.
- Downloads and future automatic updates use the same single-file executable.
- User data remains safely outside the application under `%APPDATA%\Roadbook`.

## One-time upgrade note

Roadbook 1.0.2 and earlier require a manual download. Roadbook 1.1.0 can install this release through its built-in updater.

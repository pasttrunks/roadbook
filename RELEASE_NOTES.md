# Roadbook 1.2.1

This reliability release fixes the automatic updater restart for the single-file Windows app.

## What changed

- Fixed the `Failed to load Python DLL` error after an automatic update restarted Roadbook.
- The updater now launches Roadbook as a fresh PyInstaller instance instead of inheriting the expired `_MEI` temporary runtime.
- Added an end-to-end updater restart smoke path so future releases test replacement and restart—not only download staging.
- Includes the complete **My car value** workspace introduced in 1.2.0.

## One-time upgrade note

If 1.2.0 already replaced your EXE but failed to restart, double-click that EXE once manually. It will open normally and can then install this fix.

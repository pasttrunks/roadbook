# Roadbook 1.1.0

This release makes Roadbook safer to keep and easier to update.

## What changed

- Roadbook now saves a readable ledger at `%APPDATA%\Roadbook\roadbook-data.json`.
- The ten most recent data changes are retained as recovery copies.
- You can choose a OneDrive, Dropbox, network, USB, or external folder for an automatic backup mirror.
- Roadbook checks GitHub for new releases, shows these release notes, verifies the download checksum, and installs approved updates.
- Expenses and service records can be searched, edited, and safely deleted.
- Fuel fill-ups can record gallons and calculate full-to-full MPG.
- A complete vehicle history can be exported for resale or service visits.
- VIN or chassis numbers of any length and RWD vehicles are supported.
- The opaque “health” score was replaced with a factual overdue-service count.

## One-time upgrade note

Roadbook 1.0.2 and earlier do not contain the updater. Install 1.1.0 manually once; releases after 1.1.0 can update through the app.

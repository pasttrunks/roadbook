# Roadbook

**A calm, private home for your vehicle’s maintenance history and ownership costs.**

[![Download Roadbook for Windows](https://img.shields.io/badge/Download_for_Windows-Latest_release-1473e6?style=for-the-badge&logo=windows11&logoColor=white)](https://github.com/pasttrunks/roadbook/releases/latest/download/Roadbook-Windows.zip)

> No account. No subscription. No cloud database. Your vehicle data stays on your computer.

![Roadbook overview](roadbook-preview.png)

## What Roadbook does

Roadbook turns scattered vehicle paperwork into a useful ownership record. Add any vehicle, import a Carfax report or service log, review the matches, and see what needs attention next.

- Guided setup for any year, make, model, trim, drivetrain, and odometer.
- Import from text-based Carfax PDFs, TXT files, CSV files, or pasted history.
- Review every detected record before it is saved.
- Track maintenance, repairs, fuel, parts, insurance, and other expenses.
- See upcoming service, overdue items, spending trends, and cost per mile.
- Export JSON backups and CSV expense reports.
- Light and dark themes with a responsive desktop interface.
- Local-only storage by default.

## Download and run on Windows

1. [Download the latest **Roadbook-Windows.zip**](https://github.com/pasttrunks/roadbook/releases/latest/download/Roadbook-Windows.zip).
2. Right-click the downloaded ZIP and choose **Extract All**.
3. Open the extracted `Roadbook` folder.
4. Double-click `Roadbook.exe`.

Keep the entire extracted `Roadbook` folder together. Windows may show a SmartScreen notice because this community build is not code-signed; choose **More info → Run anyway** only when you downloaded it from this repository.

Roadbook uses Microsoft Edge WebView2, which is included with current Windows 10 and Windows 11 installations.

## First launch

Roadbook asks for the vehicle basics and then offers three clear paths:

1. **Import my records** — upload or paste an existing service history.
2. **Start fresh** — begin with an empty ledger.
3. **Explore demo** — try the app with sample Mazda CX-5 history.

The maintenance intervals included with Roadbook are editable starting points, not manufacturer-specific advice. Verify them against your owner’s manual.

## Importing history

Open **Import records**, choose a file or paste service text, and select **Find service records**. Roadbook recognizes common work such as oil changes, tire rotations, brakes, filters, coolant, batteries, belts, suspension, and drivetrain fluids.

Nothing is imported automatically. Confirm the dates, mileage, and detected service items before selecting **Import selected**.

PDF extraction works directly in the Windows app. In a browser preview, PDF extraction may require internet access to load PDF.js; TXT, CSV, and pasted text work without it.

## Privacy and backups

Vehicle data is stored locally under the `roadbook-ledger-v2` browser-storage key. Roadbook does not include analytics, advertising, accounts, or a remote database.

Use **Reports → Export backup** regularly. A JSON backup can restore the full ledger on another computer. Expense data can also be exported as CSV.

## Run from source

Requirements: Windows and Python 3.11 or newer.

```text
setup_windows.bat
```

Later launches:

```text
run_windows.bat
```

Browser preview:

```text
python start_server.py
```

Then open `http://127.0.0.1:8765/index.html`.

## Build the Windows app

After running setup once:

```text
build_windows.bat
```

The packaged application is created at `dist\Roadbook\Roadbook.exe`. GitHub Actions runs the same packaging process for version tags and publishes the complete folder as `Roadbook-Windows.zip`.

## Project structure

| File | Purpose |
| --- | --- |
| `index.html` | Application layout and accessible UI |
| `styles.css` | Responsive light/dark visual system |
| `app.js` | Ledger, schedules, imports, charts, and local storage |
| `desktop_app.py` | Windows WebView2 shell and local file APIs |
| `start_server.py` | Lightweight browser-preview server |
| `build_windows.bat` | Local PyInstaller build |

## Important note

Roadbook helps organize records and reminders. It does not diagnose mechanical problems or replace the maintenance schedule, safety guidance, or service advice supplied by a vehicle manufacturer or qualified technician.

# Roadbook 1.4.1

This update delivers the redesigned **My car value** dashboard and a stronger offline PDF engine, with reliability fixes applied before release.

## What’s new

- Refreshed valuation dashboard with clearer purchase-price, current-value, and ownership-change cards.
- Switched offline PDF extraction to PyMuPDF for faster, more robust searchable-PDF handling.
- Added a clearly labeled age-based depreciation guide using a transparent 15%-per-year assumption.
- Kept saved comparable listings as the primary market-value evidence, including median, price range, editing, and price-versus-mileage visualization.
- Retained independent market-research links and the depreciation history chart.

## Reliability fixes

- Fixed a broken valuation button that referenced a deleted JavaScript function.
- Removed duplicate API-key reset logic.
- Prevented repeated clicks from creating duplicate age-guide snapshots on the same day.
- Avoided describing the age-based formula as live market data.

Roadbook still stores vehicle records locally, and the updater will show this overview before installation.

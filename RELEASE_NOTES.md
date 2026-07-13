# Roadbook 1.4.0

This release strengthens Roadbook’s offline-first design and makes market-value research more open and resilient.

## What changed

- PDF, TXT, and CSV imports now use the packaged Python reader inside the Windows app—no remote PDF.js download is required.
- Scanned/image-only PDFs now show clear searchable-text guidance instead of reporting an empty import as successful.
- NHTSA receives classic and non-standard VIN/chassis queries instead of Roadbook rejecting everything that is not exactly 17 characters.
- Added a visible **Reset Visor key** control so an invalid or expired key can always be replaced.
- My Car Value keeps its aggregated hero estimate and depreciation charts independent of any API.
- Added one-click research handoffs to Classic.com, Bring a Trailer, Cars & Bids, Cars.com, CarGurus, KBB, J.D. Power, and Edmunds.
- Added **Export this view** for the currently selected maintenance status and history search.
- Made per-service custom mileage and month intervals explicit in the maintenance guidance.

Visor sync remains an optional convenience. Manual comparables, the hero estimate, research links, and charts work without it.

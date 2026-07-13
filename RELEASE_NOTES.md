# Roadbook 1.3.0

This release brings live vehicle-market research into Roadbook and adds the value graphs requested in the Roadbook idea.

## What changed

- Connect an optional Visor API key and import matching live listings directly into **My car value**.
- Visor keys stay in local desktop settings and are excluded from Roadbook data exports and mirrored backups.
- Added an interactive price-versus-mileage chart for comparable listings.
- Added a depreciation history chart that grows as market snapshots are synced over time.
- Live results remain saved as transparent, editable comparables; manual listings still work without any account or API key.
- Kept the public Visor overview link as a no-key fallback.
- Fixed local dates shifting by one day because UTC formatting was used for entries, maintenance intervals, charts, and imported records.
- Replaced the personal Mazda/Carfax demo history with a clearly labeled, non-personal Toyota RAV4 sample dataset.

## Important pricing note

Visor currently includes starter API credit with no credit card required, then charges per request. Roadbook does not purchase or resell data. KBB and Carfax data are not embedded because no appropriate free public valuation API is available for this open-source app.

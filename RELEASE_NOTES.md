# Roadbook 1.5.1

This update combines Roadbook’s new layout-aware document import with a clearer, more automatic **My car value** experience.

## What’s new

- Automatic MSRP lookup from CarAPI’s key-free open vehicle dataset, including trim and drivetrain matching when available.
- A clean value journey from original MSRP to purchase price to current estimated value.
- Make-aware depreciation benchmarks for 15 common brands, with a transparent general fallback.
- A real depreciation curve combining the benchmark with saved value snapshots.
- VIN decoding beside the vehicle identity instead of buried in the page.
- Focused research links for exact-model, sold, asking-price, KBB, and depreciation evidence.
- Layout-aware local OCR for difficult Carfax and service-history PDFs.

## What was simplified

- Removed the Visor API-key setup and unreliable live-sync workflow.
- Removed the low-value price-versus-mileage scatter chart and oversized dashboard clutter.
- Moved optional comparable-listing evidence into a compact expandable table.

## Reliability

- Preserves the Windows OCR and NHTSA VIN improvements from 1.5.0.
- Adds regression tests for automatic MSRP selection and make-aware depreciation.
- Preserves existing local records; the new MSRP metadata is added without changing older data.

Roadbook’s estimate is a planning guide, not an appraisal. Mileage, trim, condition, options, history, and local demand can change a vehicle’s real sale price.

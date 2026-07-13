# Roadbook 1.5.2

This repair release makes the ownership-value chart truthful and restores offline scanning for image-based PDFs.

## Fixed

- Replaced the synthetic depreciation curve with a direct comparison of original MSRP, purchase price, and current estimated value.
- Added percentages showing where purchase and current value stand against MSRP and where current value stands against purchase price.
- Fixed a scanned-PDF OCR regression where the layout parser expected OCR line objects but received a plain text string, causing every scanned page to be silently discarded.
- Improved OCR quality with 200-DPI page rendering, real word bounding boxes, English-language fallback, and useful error messages.
- Mixed PDFs now keep embedded text pages and OCR only the pages that actually need it.

## Verified

- Successfully extracted more than 21,000 characters from the supplied scanned 2015 Mazda CX-5 Carfax.
- Added a packaged image-only PDF OCR test to GitHub Actions so searchable-PDF testing can no longer hide scanner failures.
- Preserved the automatic MSRP, Windows OCR, NHTSA VIN, updater, and local-data improvements from earlier releases.

Roadbook processes PDF text and OCR locally on the Windows computer.

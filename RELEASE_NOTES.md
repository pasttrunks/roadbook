# Version 1.4.3

**Native Scanned PDF Support (OCR)**

Roadbook now fully supports extracting maintenance history and text from scanned image PDFs!
- We integrated the lightning-fast, native Windows 10/11 OCR engine (`Windows.Media.Ocr`).
- When you import a scanned Carfax or service record without any text layers, Roadbook will now intelligently fall back to optical character recognition to read the text straight from the image.
- Because we tap into your operating system's built-in capabilities, this runs 100% locally and instantly, keeping Roadbook completely offline and without adding any massive downloads or third-party tracking.

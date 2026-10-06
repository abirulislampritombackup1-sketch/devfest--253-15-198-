# Tender Document Package Builder

**Name:** Md. Abirul Islam Pritom  
**Registration number:** 253-15-198-  
**Live site (HTTPS):** https://devfest-253-15-198.vercel.app  

## What it does
A frontend-only web app that helps office staff turn a set of PDF files into one complete, checked and correctly ordered tender package PDF. Works in Bangla and English.
All processing happens in the browser. No backend, no uploads to any server.

## How to run
1. `git clone https://github.com/abirulislampritombackup1-sketch/devfest--253-15-198-.git`
2. `cd devfest--253-15-198-`
3. `npm install`
4. `npm run dev` → open the printed local URL in Chrome (`http://localhost:5173`).
5. Production build: `npm run build` (output in `dist/`).

## Main features done
- [x] Load requirements.json, show tender details, sorted by order
- [x] Upload many PDFs (name + page count), reject non-PDF, remove files
- [x] Match files to documents (1:1, change/undo any time)
- [x] Expiry date entry for documents with has_expiry
- [x] Live status for every document (Missing / Expiry date needed / Expired / Not provided / OK)
- [x] Duplicate detection by exact content (SHA-256)
- [x] Generate disabled while blocking problems exist, with reasons shown
- [x] Combined PDF: English cover, ordered documents, footer "<tender_id> | Page X of Y"
- [x] Download as <tender_id>_Package.pdf
- [x] Full Bangla / English switch, choice remembered

## Bonus features
- [x] Handle bad files safely (clear messages for damaged, password-protected, or non-PDF files)
- [x] Auto-match by file name (token-based suggestions user can apply with one click)
- [x] Export checklist CSV (with UTF-8 BOM for flawless Excel and Bengali display)

## Known problems
- None known

## AI tools used
- Antigravity IDE (Gemini 3.8 Flash)

## My most useful prompt
> "Implement buildPackage.js using pdf-lib to generate an English A4 cover page, merge ordered documents, and stamp non-overlapping bottom band footers with tender ID and page numbers."

## Output files
- `output/T-2026-0417_Package.pdf` — package generated from the sample pack
- `screenshots/` — UI screenshots including document statuses

## License
MIT
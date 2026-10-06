# PDR — Tender Document Package Builder
**AI DevFest 2026 · AI Vibe-Coding Contest (Solo) · Daffodil International University**

> Read this file top to bottom ONCE before T+0 work starts. During the contest, follow **Part C (Step-by-Step Build Plan)** one step at a time. Tick the boxes as you go.

---

## 0. Quick Facts

| Item | Value |
|---|---|
| Contest length | 90 min build + deploy |
| App | Frontend-only web app (static site) |
| Problem | Turn many PDFs into ONE checked, ordered tender package PDF |
| Users | Office staff preparing tender submissions (Bangla or English speakers) |
| Repo name | `devfest-<registration-number>` (public, new) |
| Output file name | `<tender_id>_Package.pdf` |
| Judging pack | A DIFFERENT, unseen pack in the same format → **no hard-coded data** |

**Golden rules:** Main tasks first. Deploy early. Commit often. Never hard-code the sample. Never touch anything after T+90.

---

# PART A — PLANNING & COMPLIANCE

## A1. Rule-Compliance Checklist

### Before the contest (before T+0)
- [ ] Know your registration number (needed for repo name `devfest-<registration-number>`).
- [ ] GitHub account logged in; Git configured (`user.name`, `user.email`); SSH or token push works.
- [ ] Hosting account ready and logged in (recommended: **Vercel** or **Cloudflare Pages**, linked to GitHub).
- [ ] Node.js LTS + npm installed; Chrome (latest) installed.
- [ ] Antigravity (AI coding tool) opened and working; know your fallback AI tool.
- [ ] Do NOT create any project code, do NOT run `npm create vite` before T+0.
- [ ] Do NOT reuse old code or personal templates.
- [ ] Keep this PDR.md outside the repo (it is planning, not project code). You may add it to the repo later as a doc only if allowed — safest: do not commit it.
- [ ] Have this checklist and the prompt templates (A9) ready to paste.

### During the contest (T+0 → T+90)
- [ ] Download and unzip `sample-pack.zip` (requirements.json + documents/).
- [ ] Create a NEW **public** repo named `devfest-<registration-number>` (empty; add MIT LICENSE).
- [ ] Scaffold with an official starter only (`npm create vite@latest`) — allowed.
- [ ] Use only npm/CDN libraries (pdf-lib, etc.). No backend, no serverless, no Firebase/Supabase/Appwrite.
- [ ] No API keys/secrets in code, repo, history, or live site.
- [ ] Commit at least once every 30 minutes; at least 3 commits total.
- [ ] Every commit message = short summary + `Prompt: ...` (or `Manual edit`).
- [ ] Never force-push, never rebase pushed commits, never delete the repo.
- [ ] Main tasks fully working BEFORE any bonus.
- [ ] App works in Bangla AND English; choice is remembered.
- [ ] Main features work with no AI and no external API.
- [ ] Use only the provided sample data (no real private data).

### Before T+90 (final 15 minutes)
- [ ] Generate `output/<tender_id>_Package.pdf` from the sample pack (after resolving its problems) and commit it.
- [ ] Add `screenshots/` (at least one showing document statuses) and commit.
- [ ] README.md complete (all required sections).
- [ ] MIT `LICENSE` file present.
- [ ] `npm run build` passes locally.
- [ ] Final commit pushed (no later than T+90).
- [ ] Live deployment is built from the final commit.
- [ ] Verify deployment (see A6): incognito Chrome, no login, correct commit, no secrets.
- [ ] Copy the final commit ID (full SHA).
- [ ] **STOP.** After T+90: no commit, no push, no redeploy.

### Submission (by T+90; late window to T+95 costs 10 marks)
- [ ] Name
- [ ] Registration number
- [ ] Public GitHub repo link
- [ ] Final commit ID
- [ ] Live HTTPS link
- [ ] Submit form BEFORE T+90 if possible. Do not use the late window unless forced.

---

## A2. Recommended Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Build | **Vite + React** (official `create-vite` starter, JavaScript or TypeScript) | Fastest dev loop, static `dist/` output, official starter is allowed. |
| PDF combine + footer + cover | **pdf-lib** | Pure browser, merges PDFs, draws text, no server. |
| PDF page count / preview (optional) | pdf-lib for page count (already installed). **pdfjs-dist** only if you add previews (bonus). | Fewer libraries = fewer bugs. |
| Hashing (duplicates) | Browser **Web Crypto** `crypto.subtle.digest('SHA-256', bytes)` | Built in, exact content match, no library. |
| Styling | Plain CSS (or one small CSS file) | No setup time. Clean, big buttons, high contrast. |
| Bangla font | **Noto Sans Bengali** via `@fontsource/noto-sans-bengali` (npm) | Bundled in the build → works offline and with no CDN risk. |
| i18n | Own tiny dictionary + React Context (no library) | See A4. Zero setup, easy to check for missing keys. |
| State | React `useState` / `useReducer` in one top-level store | Simple, predictable, instant status updates. |
| Persistence | `localStorage` for language + small UI settings. `IndexedDB` (bonus) for saved projects with file bytes. | localStorage is ~5 MB (too small for PDFs); IndexedDB is not. |
| Deploy | **Vercel** (or Cloudflare Pages) auto-deploy from GitHub | Commit SHA is shown on the deployment → easy to match final commit. |

**Optional extras (bonus only):** `@pdf-lib/fontkit` (embed Bangla font in PDF), `papaparse` or manual CSV writer, `xlsx` only if Excel is chosen (CSV is faster).

**Not allowed:** Express/Node server, serverless functions, API routes, Firebase/Supabase/Appwrite, any remote storage.

---

## A3. Rapid Development & Quality Strategy

**Principle:** build the thin vertical slice first (load → upload → match → status → generate → download), then polish, then bonuses.

1. **Pure logic first, UI second.** Write the status engine, duplicate detection and PDF builder as plain functions (no React inside). They are the judged parts — keep them testable.
2. **One source of truth.** One state object (see B6). Statuses are *computed* from state on every render (never stored) → "update right away after every change" is automatic.
3. **Never hard-code the sample.** Read everything from `requirements.json`: sort by `order`, use `id` as key, read `mandatory`, `has_expiry`, `submission_deadline`. Judges use an unseen pack.
4. **Early deployment checkpoint.** Deploy a hello-world page right after scaffolding. Re-deploy at each milestone. A broken deploy at T+85 is the biggest avoidable risk.
5. **Bilingual from line one.** Every visible string goes through `t('key')` from the first component. Retro-fitting i18n costs more time than doing it upfront.
6. **Small, vertical commits.** One feature = one prompt = one commit. Test in browser before committing.
7. **Quality guardrails (cheap):**
   - Handle every error with a clear bilingual message (no crashes, no blank screens).
   - Validate `requirements.json` structure and show a clear error if invalid.
   - Keep functions small; keep files separated (`logic/`, `components/`, `i18n/`).
   - Date compare as `YYYY-MM-DD` **strings** (no timezone bugs).
   - Test with the sample pack after every step, plus a quick "different pack" check (rename, reorder, change flags in a copy of the JSON).
8. **Bonus gate.** Start a bonus only when ALL of B2 passes the test checklist (B8) and the live deploy works.
9. **Freeze time.** Stop adding features at ~T+70. Last 20 minutes = output PDF, screenshots, README, verification, submission.

---

## A4. Bilingual (Bangla / English) i18n Plan

### File structure
```
src/
  i18n/
    en.js          // export default { key: "English text", ... }
    bn.js          // export default { key: "বাংলা লেখা", ... }
    index.js       // LanguageProvider, useLang(), t(key, params)
    checkKeys.js   // dev script: compares en vs bn keys
```

### Rules
- Keys are dotted, grouped by screen: `tender.title`, `upload.drop`, `status.missing`, `error.notPdf`.
- `t(key, params)` supports placeholders: `"{name} is not a PDF"` → `t('error.notPdf', {name})`.
- Fallback order: chosen language → English → the key itself (and `console.warn` in dev).
- Status values are **codes** (`MISSING`, `EXPIRY_NEEDED`, `EXPIRED`, `NOT_PROVIDED`, `OK`) mapped to labels with `t('status.' + code)`. Never store translated text in state.
- Document names come from the **requirements data**: `lang === 'bn' ? (title_bn || title_en) : title_en`.
- Tender-data fields (title, entity, bidder) are shown as-is (they are data, not UI strings).
- Language switch: visible toggle button **EN | বাংলা** in the header, always reachable.
- Persist choice: `localStorage.setItem('lang', 'bn' | 'en')`; read on startup (default `en`, or `bn` if you prefer).
- Set `document.documentElement.lang` on switch.
- Dates: show as `YYYY-MM-DD` in both languages (consistent, unambiguous).

### Bangla font
- Install `@fontsource/noto-sans-bengali` and import weights 400 and 700.
- CSS: `font-family: "Noto Sans Bengali", "Noto Sans", system-ui, sans-serif;`
- Slightly larger line-height (≈1.6) for Bangla to avoid clipped glyphs.

### Avoiding missing translations
- [ ] Write `en.js` and `bn.js` together, key by key.
- [ ] Run `checkKeys.js` (Node script) before every commit: prints keys missing in either file.
- [ ] No hard-coded visible strings in JSX (search for `>[A-Za-z]` text nodes and `placeholder="` / `title="` / `aria-label="`).
- [ ] Switch to Bangla and click through every screen and every error once before final deploy.
- [ ] File input native text ("Choose files") is browser-controlled — use a custom styled button/label so the text is translated.

---

## A5. Git Commit Message Template and Examples

### Template
```
<short summary in present tense>

Prompt: <the exact AI prompt used, shortened if long>
```
For manual work:
```
<short summary>

Manual edit
```

### 5 example commits
1. `Scaffold Vite React app with i18n setup` — `Prompt: Scaffold a Vite React app with src/i18n (en/bn), a language switch persisted in localStorage, and Noto Sans Bengali.`
2. `Load requirements.json and show tender details` — `Prompt: Add a file input that parses requirements.json, validates it, shows tender details and a list sorted by order.`
3. `Add PDF upload, page count, removal, duplicate hashing` — `Prompt: Allow many PDF uploads, reject non-PDFs, show name and pages, allow removal, and mark files with identical SHA-256 as duplicates.`
4. `Add matching, expiry input and live status engine` — `Prompt: Add match dropdowns (1 file ↔ 1 document), expiry date input for has_expiry docs, and computed statuses per Section 5.`
5. `Fix footer overlap on tall pages` — `Manual edit`

Rules recap: ≥3 commits, ≥1 per 30 minutes, never force-push/rebase, nothing after T+90.

---

## A6. Deployment Plan (Recommended: Vercel, connected to GitHub)

**Why Vercel:** free, static Vite builds with zero config, auto-deploys every push, shows the commit SHA, public HTTPS URL, no viewer login.

### Exact steps
1. Push the first commit (scaffold) to the public repo `devfest-<reg>`.
2. Vercel dashboard → **Add New → Project** → import `devfest-<reg>`.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`. No environment variables.
4. Click **Deploy**. Copy the production URL (`https://<name>.vercel.app`).
5. Project **Settings → Deployment Protection**: make sure protection is **OFF** for Production (judges must open it with no login).
6. Open the URL → confirm the starter page loads. **This is your early deployment checkpoint (do it right after scaffolding).**
7. Every later `git push` to `main` auto-redeploys. Watch the **Deployments** tab until status = Ready.
8. At the end, confirm the Production deployment's commit SHA = your final commit.

**Backup host:** Cloudflare Pages (Connect to Git → framework Vite → output `dist`) or Netlify (same settings). Do not set up a backup unless the first fails.

**Vite note:** root-path hosting (Vercel/Netlify/Cloudflare) needs no `base` setting. (GitHub Pages would need `base: '/devfest-<reg>/'` — avoid unless forced.)

### Verification checklist (do before T+90)
- [ ] Open the live HTTPS URL in **Incognito** latest Chrome (not logged in anywhere).
- [ ] Page loads with no login/permission prompt.
- [ ] Deployment page shows the **same commit SHA** as `git rev-parse HEAD`.
- [ ] Language switch works and persists after reload.
- [ ] Load sample `requirements.json` + PDFs → statuses show → package generates → downloads.
- [ ] DevTools → Network: no calls to any backend; no failed requests breaking main features.
- [ ] Search repo for secrets: `git grep -n -i -E "api[_-]?key|secret|token|sk-"` → nothing real.
- [ ] No `.env` file committed; `.gitignore` includes `.env*`.

---

## A7. README.md Template

```markdown
# Tender Document Package Builder

**Name:** <Your Full Name>
**Registration number:** <reg-number>
**Live site (HTTPS):** https://<your-deployment-url>

## What it does
A frontend-only web app that helps office staff turn a set of PDF files into one complete,
checked and correctly ordered tender package PDF. Works in Bangla and English.
All processing happens in the browser. No backend, no uploads to any server.

## How to run
1. `git clone https://github.com/<user>/devfest-<reg>.git`
2. `cd devfest-<reg>`
3. `npm install`
4. `npm run dev` → open the printed local URL in Chrome.
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
- <list only the ones that truly work, or "None">

## Known problems
- <honest list, or "None known">

## AI tools used
- <e.g., Antigravity (Gemini/Claude), ...>

## My most useful prompt
> <paste the single most useful prompt>

## Output files
- `output/<tender_id>_Package.pdf` — package generated from the sample pack
- `screenshots/` — UI screenshots including document statuses

## License
MIT
```

---

## A8. Risk List and Fallbacks

| Risk | Prevention | Fallback |
|---|---|---|
| AI tool limit reached | Use short, focused prompts; avoid regenerating whole files | Switch to backup AI tool (second account/tool); keep prompts in a text file ready to paste; do small manual edits (mark commit `Manual edit`). |
| Internet drops | Install all npm packages in the first 10 minutes; Bangla font bundled via npm (no CDN); do not depend on CDNs | Use phone hotspot; keep working locally (`npm run dev` works offline once installed); commit locally, push when back. |
| External API fails | Main features use NO external APIs | Skip AI/bonus API features; app must still fully work. |
| Deployment fails | Deploy a hello-world early; check build logs; run `npm run build` locally before pushing | Fix build error and push; if host broken, switch to Cloudflare Pages/Netlify (import same repo). Decide by T+75. |
| Pushing late / commit gap | Set a 25-minute phone timer for commits | Make a small valid commit (e.g., README/i18n text) — but never fake work after T+90. |
| PDF merge crashes on odd file | Wrap each file in try/catch at upload; reject damaged/encrypted with message | Show clear message; the file is not added; app keeps working. |
| Non-Latin character in cover text crashes pdf-lib (Helvetica can't encode) | Sanitize cover text (replace unsupported chars with `?`) | Embed Noto Sans (Latin + Bengali) via fontkit (bonus step also solves Bangla on cover). |
| Footer overlaps content | Extend each page by a footer band (see C8) instead of drawing over content | Draw on a white strip; test with a full-page scan. |
| Rotated or odd-sized pages | Test with the sample's odd pages | Fallback: use `copyPages` and add band by enlarging mediabox; skip rotation edge cases only if time is out (list in Known problems). |
| Large files slow the browser | Limit 30 files / 50 MB total (enforce with message) | Show a progress/"Working…" state; process sequentially. |
| Secrets leak | Never write keys in code; AI key (bonus) lives only in component state/sessionStorage | `git grep` before final push; if leaked, rotate key (history rewriting is NOT allowed). |
| Accidentally commit after T+90 | Stop timer at T+85 | Don't touch the repo or deployment. |

---

## A9. Reusable AI Prompt Templates

> Always paste the **Context Block** first in a new chat/session:
>
> **Context Block:** *"Project: frontend-only Vite + React app 'Tender Document Package Builder'. No backend, no serverless, no remote DB. State in browser only. Libraries: pdf-lib, plain CSS. Must be fully bilingual (Bangla/English) via src/i18n; never hard-code visible strings. Never hard-code sample data; read requirements.json. Statuses are computed from state. Do not add API keys. Keep code small and readable. Only change what I ask."*

**1. Scaffolding**
```
Using the official create-vite React template in the current empty folder, set up: folders src/components, src/logic, src/i18n, src/state. Install pdf-lib and @fontsource/noto-sans-bengali. Add a minimal App with a header and an EN | বাংলা switch (i18n via a Context + t(key, params), persisted in localStorage). Add .gitignore (node_modules, dist, .env*). Do not add any backend. Output the commands I should run and the file contents.
```

**2. i18n**
```
Add these UI strings to src/i18n/en.js and bn.js with identical keys: <list of keys + English text>. Provide natural Bangla for office staff. Update components <names> to use t(). Also write src/i18n/checkKeys.js (Node) that prints keys missing in either language and exits non-zero if any.
```

**3. Building a feature**
```
Implement <feature, e.g., "match files to requirements">. Requirements: <acceptance criteria from B2>. Put pure logic in src/logic/<name>.js and UI in src/components/<Name>.jsx. Use t() for all text (add keys to en and bn). Handle errors with clear bilingual messages. Do not change unrelated files. After the code, list how I can test it in 3 steps.
```

**4. Fixing a bug**
```
Bug: <what I did> → <what happened> → <what should happen>. Console error (if any): <paste>. Relevant files: <paths + paste code>. Find the root cause, give the smallest fix, and explain in 2 lines. Do not refactor.
```

**5. Writing README**
```
Fill this README template with: name <...>, reg <...>, live link <...>, features done <list>, bonus <list>, known problems <list>, AI tools used <list>, my most useful prompt <paste>. Keep the template headings exactly. Keep it short and honest.
```

**6. Final cleanup**
```
Final cleanup pass without changing behavior: remove console.log and dead code, ensure no hard-coded visible strings, no secrets, .gitignore correct, package.json name/description set, npm run build passes. List every change you made. Do not add features.
```

---

# PART B — PROBLEM IMPLEMENTATION

## B1. Problem Summary & Users

**Organization:** Any organization (company/office) that bids for tenders. **Users:** office staff who prepare bid packages — often non-technical, Bangla or English speaking.

**Pain:** Packages are assembled manually. A missing, expired, duplicated or misplaced document can get a bid rejected.

**The app:** load `requirements.json` → upload PDFs → match each file to a required document → enter expiry dates → see live status → generate ONE PDF (cover + ordered documents + footer with page numbers) → download `<tender_id>_Package.pdf`.

**Hidden traps in the sample pack (the app must catch them; assume the unseen pack has others):**
- Non-PDF file in the folder
- Duplicate PDF content under different names
- Expired document; document expiring exactly on the deadline (must be OK)
- Missing mandatory document; missing optional document
- Possibly damaged / password-protected PDF
- `requirements` not listed in `order` sequence (must sort by `order`)
- Optional document with `has_expiry = true`

---

## B2. Main Tasks (Must Do) with Acceptance Criteria

### M1 — Load the list (4.1)
- [ ] User picks `requirements.json` via file input.
- [ ] Tender details shown: tender_id, title, procuring entity, bidder, submission deadline.
- [ ] Requirements listed sorted by `order` (ascending), showing title (by language), mandatory/optional, expiry-required flag.
- [ ] Invalid/missing JSON or fields → clear bilingual error; app does not crash.
- [ ] Loading a new requirements file resets matches/expiry (confirm first if work exists).

### M2 — Upload files (4.2)
- [ ] Multiple PDFs can be uploaded at once (and added in later batches).
- [ ] Each file shows name and page count.
- [ ] Non-PDF (check extension, MIME, and `%PDF-` header) → rejected with a clear message naming the file.
- [ ] Damaged/password-protected PDF → rejected with clear message (no crash).
- [ ] Limits enforced: ≤ 30 files, ≤ 50 MB total → clear message if exceeded.
- [ ] Each file has a Remove button; removing a matched file clears its match.

### M3 — Match files (4.3)
- [ ] Each requirement has a selector to choose one uploaded file.
- [ ] One requirement ↔ at most one file; one file ↔ at most one requirement (already-used files are disabled/marked in other selectors).
- [ ] User can change or clear a match any time (Undo = set back to "— none —").
- [ ] Matching updates statuses immediately.

### M4 — Enter expiry dates (4.4)
- [ ] Date input appears only when `has_expiry = true` AND a file is matched.
- [ ] Date stored as `YYYY-MM-DD`; clearing the date is allowed.
- [ ] Unmatching a file hides the date input; the expiry value is cleared (or kept but ignored — pick one and be consistent: **clear it**).

### M5 — Check everything (4.5, Section 5)
Status per requirement (exactly one), computed in this order:
1. No file matched → `MISSING` if mandatory (blocks), `NOT_PROVIDED` if optional (no block).
2. File matched, `has_expiry` and no valid date → `EXPIRY_NEEDED` (blocks).
3. File matched, `has_expiry`, date `<` deadline → `EXPIRED` (blocks).
4. Otherwise → `OK`. (date `==` deadline is OK.)
- [ ] Status badge visible for every requirement, with color + text (not color only).
- [ ] Status updates immediately after any change (match, unmatch, remove file, date change, language change).
- [ ] Summary line: "X problems must be fixed" / "Ready to generate".

### M6 — Find duplicates (4.6)
- [ ] Compute SHA-256 of each file's bytes at upload.
- [ ] Files with identical hash are marked **Duplicate** in the uploaded-files list (show which file they duplicate).
- [ ] Duplicate files cannot be matched to different documents: if one file of a duplicate group is matched, the other copies are not selectable anywhere (show reason).
- [ ] Removing a file updates duplicate marks immediately.

### M7 — Make the package (4.7, Section 6)
- [ ] Generate button **disabled** while any blocking status exists; the reason list is shown (which documents, which status).
- [ ] When enabled, create one combined PDF:
  - **Page 1 = cover page, in English:** tender ID, title, procuring entity, bidder, submission deadline, date package made (today, `YYYY-MM-DD`), list of included documents in order.
  - Then each matched document, sorted by `order`, **all pages in original order**.
  - Skip optional documents with no file.
  - **Every page (including cover) has footer** `<tender_id> | Page X of Y`, Y = total pages in package.
  - Footer is readable (≥ 9–10 pt, dark on white) and **does not cover content**.
- [ ] Cover remains exactly ONE page even with many documents or long titles.
- [ ] Show progress/"Working…" while generating; show error message if generation fails.

### M8 — Download (4.8)
- [ ] After generation, user clicks Download → file `<tender_id>_Package.pdf`.
- [ ] Optional: open in new tab for quick visual check.

### M9 — Two languages (4.9)
- [ ] Switch whole app between Bangla and English.
- [ ] Every label, button, message, instruction, status, and error is translated.
- [ ] Document names use `title_bn` / `title_en` per language (fallback to `title_en` if `title_bn` empty).
- [ ] Choice remembered after reload.
- [ ] Bangla text renders correctly in the app (Noto Sans Bengali).

---

## B3. Bonus Tasks (Optional) — Ordered by Value-for-Effort

Start ONLY after every main task passes B8 and the live site works.

| # | Bonus | Effort | Notes |
|---|---|---|---|
| 1 | **Handle bad files safely** | Very low | Likely already done in M2 (try/catch on load). Make messages polished. |
| 2 | **Auto-match by file name** | Low | Match tokens from `title_en`/`id` against file names (normalize, lowercase). Show as **suggestions** the user accepts with one click. |
| 3 | **Export checklist CSV** | Low | Columns: document, file name, pages, expiry date, status. Add UTF-8 BOM so Excel shows Bangla. |
| 4 | **Index page after cover** | Medium | Needs page-start numbers: compute page counts first, then draw. Index becomes page 2 → total Y includes it. Cover page 1 stays cover. |
| 5 | **Save/reopen work** | Medium | Export/import a project JSON (matches, expiry, file names) and/or IndexedDB with file bytes. |
| 6 | **Bangla on PDF cover/index** | Medium | Needs `@pdf-lib/fontkit` + embedded Noto Sans Bengali TTF. Note: spec says cover is English — add Bangla only as an extra line, if at all. |
| 7 | **Seal/signature PNG** | Medium-high | Upload PNG, choose pages, position; draw with `embedPng`. |
| 8 | **AI help (user's own key)** | High | Skip unless everything else is done. Key typed in UI, kept in memory only. |

---

## B4. Sample Data Format and Loading

### Files
- `requirements.json` — tender + requirements (schema below).
- `documents/*.pdf` — files to match (some are traps).

### requirements.json shape
```json
{
  "tender": {
    "tender_id": "T-2026-0417",
    "title": "Supply of IT Equipment",
    "procuring_entity": "Example Directorate",
    "bidder": "Example Company Ltd.",
    "submission_deadline": "2026-10-20"
  },
  "requirements": [
    { "id": "R01", "order": 1, "title_en": "Trade License", "title_bn": "...",
      "mandatory": true, "has_expiry": true }
  ]
}
```

### Loading
- **requirements.json:** `<input type="file" accept=".json">` → `FileReader`/`file.text()` → `JSON.parse` → validate → store in state.
- **PDFs:** `<input type="file" multiple accept="application/pdf,.pdf">` + drag-and-drop zone → for each file: read `arrayBuffer()`; check header bytes `%PDF-`; `PDFDocument.load(bytes)` (try/catch) for page count and damaged/encrypted detection; `crypto.subtle.digest` for hash. Store `{ id, name, size, pages, hash, bytes }` in memory.
- **Where it lives:** in-memory React state (fast, simple). Language preference in `localStorage`. Optional bonus: IndexedDB.
- **Validation of requirements.json:**
  - `tender` has all five fields; `submission_deadline` matches `^\d{4}-\d{2}-\d{2}$`.
  - `requirements` is a non-empty array; each has unique `id`, numeric `order`, `title_en`, boolean `mandatory`, boolean `has_expiry`; `title_bn` optional-safe.
  - On failure: list the problems in a bilingual error box.
- **Repo sample data:** you may copy the provided sample pack into the repo (e.g., `public/sample-pack/`) ONLY if allowed by contest rules for "demo" — it is provided sample data, so it is allowed. Do not add any real/private data. A "Load sample" button is optional; do not rely on it for the judge's unseen pack.

---

## B5. Feature Prioritization Sequence

1. Scaffold + i18n + deploy hello-world  *(foundation, early checkpoint)*
2. Load requirements + show tender + sorted list (M1)
3. Upload + validation + page count + remove (M2)
4. Duplicate detection (M6)
5. Matching UI with 1:1 rules (M3)
6. Expiry input + status engine + summary (M4, M5)
7. Generate button gating + reasons (M7a)
8. PDF builder: cover + merge + footer (M7b)
9. Download (M8)
10. Polish: Bangla full pass, accessibility, big/clear UI (M9)
11. Output PDF from sample + screenshots + README + LICENSE
12. Bonuses in the order of B3 (only if time remains and all above passes)

Why this order: the status engine and PDF builder are what judges test most. UI polish comes after correctness.

---

## B6. Data Model (Browser Schema)

### In-memory app state (single store)
```js
{
  lang: 'en' | 'bn',                 // persisted in localStorage
  tender: {                           // from requirements.json
    tender_id, title, procuring_entity, bidder, submission_deadline
  } | null,
  requirements: [                     // sorted by order after load
    { id, order, title_en, title_bn, mandatory, has_expiry }
  ],
  files: [                            // uploaded PDFs
    { id /* uuid */, name, size, pages, hash /* sha256 hex */, bytes /* Uint8Array */ }
  ],
  matches: {                          // requirementId -> fileId (or absent)
    "R01": "file-uuid-1"
  },
  expiry: {                           // requirementId -> "YYYY-MM-DD"
    "R01": "2026-12-31"
  },
  messages: [                         // transient notices/errors (code + params, translated at render)
    { type: 'error' | 'info', code: 'error.notPdf', params: { name } }
  ],
  generated: { blobUrl, fileName, pages } | null
}
```

### Derived (computed, never stored)
```js
duplicateGroups: Map<hash, fileId[]>           // groups with length > 1
fileIsDuplicate(fileId) -> boolean
fileUsedBy(fileId) -> requirementId | null
statusOf(requirement) -> 'MISSING'|'EXPIRY_NEEDED'|'EXPIRED'|'NOT_PROVIDED'|'OK'
blockingProblems -> [{ requirementId, status }]
canGenerate -> blockingProblems.length === 0
```

### Persistence keys
| Where | Key | Value |
|---|---|---|
| localStorage | `lang` | `"en"` or `"bn"` |
| localStorage (bonus) | `project.meta` | matches/expiry/file names (no bytes) |
| IndexedDB (bonus) | db `tenderBuilder`, store `files` | `{ id, name, size, pages, hash, bytes }` |
| IndexedDB (bonus) | store `project` | `{ requirements, tender, matches, expiry }` |

### Status function (reference logic, no code)
- matched = `matches[req.id]` exists and file exists.
- `!matched` → `mandatory ? MISSING : NOT_PROVIDED`.
- `matched && has_expiry`:
  - expiry empty/invalid → `EXPIRY_NEEDED`
  - `expiry < deadline` (string compare) → `EXPIRED`
- else `OK`.

### Duplicate rule
- Group files by `hash`. Group size > 1 → each member flagged `duplicate`.
- If any member of a group is matched, other members are **not selectable** (disabled with reason "duplicate of <name>").
- Prevent matching two duplicate files to different documents even if the first is later removed.

---

## B7. Screens / UI Outline and Bilingual Label List

### Layout (single page, top to bottom, big & simple)
1. **Header:** App title · language switch **EN | বাংলা**.
2. **Step 1 – Tender:** "Load requirements" button → tender details card.
3. **Step 2 – Upload:** drop zone + "Choose PDF files" → files table (name, pages, size, Duplicate badge, Remove).
4. **Step 3 – Match & check:** requirements table sorted by order: `#`, document name (language-aware), Mandatory/Optional, file selector, expiry date (if needed), status badge.
5. **Summary bar (sticky):** problems count + reasons + **Generate package** button.
6. **Result:** success message, pages count, **Download** button (+ Preview optional).
7. **Notices area:** error/info messages (dismissible).

Design notes: large fonts (≥16px), strong contrast, status badges with icon + text, empty-state hints ("Start by loading requirements.json"), keyboard accessible, works at laptop widths.

### Bilingual label list (initial keys — extend as needed)

| Key | English | বাংলা |
|---|---|---|
| app.title | Tender Document Package Builder | টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার |
| lang.switch | Language | ভাষা |
| step.tender | 1. Load tender requirements | ১. টেন্ডারের চাহিদা লোড করুন |
| step.upload | 2. Upload PDF files | ২. পিডিএফ ফাইল আপলোড করুন |
| step.match | 3. Match files and check | ৩. ফাইল মেলান ও যাচাই করুন |
| step.generate | 4. Generate package | ৪. প্যাকেজ তৈরি করুন |
| btn.loadReq | Load requirements.json | requirements.json লোড করুন |
| btn.chooseFiles | Choose PDF files | পিডিএফ ফাইল বাছাই করুন |
| upload.drop | Drag and drop PDF files here | পিডিএফ ফাইল এখানে টেনে আনুন |
| btn.remove | Remove | মুছুন |
| btn.clear | Clear match | মিল বাতিল করুন |
| btn.generate | Generate package | প্যাকেজ তৈরি করুন |
| btn.download | Download package | প্যাকেজ ডাউনলোড করুন |
| tender.id | Tender ID | টেন্ডার আইডি |
| tender.title | Title | শিরোনাম |
| tender.entity | Procuring entity | ক্রয়কারী প্রতিষ্ঠান |
| tender.bidder | Bidder | দরদাতা |
| tender.deadline | Submission deadline | জমার শেষ তারিখ |
| col.order | No. | নং |
| col.document | Document | ডকুমেন্ট |
| col.type | Type | ধরন |
| col.file | Matched file | মেলানো ফাইল |
| col.expiry | Expiry date | মেয়াদ শেষের তারিখ |
| col.status | Status | অবস্থা |
| col.pages | Pages | পৃষ্ঠা |
| col.name | File name | ফাইলের নাম |
| type.mandatory | Mandatory | বাধ্যতামূলক |
| type.optional | Optional | ঐচ্ছিক |
| match.none | — Select a file — | — ফাইল নির্বাচন করুন — |
| status.MISSING | Missing | অনুপস্থিত |
| status.EXPIRY_NEEDED | Expiry date needed | মেয়াদের তারিখ দরকার |
| status.EXPIRED | Expired | মেয়াদোত্তীর্ণ |
| status.NOT_PROVIDED | Not provided | প্রদান করা হয়নি |
| status.OK | OK | ঠিক আছে |
| file.duplicate | Duplicate of {name} | {name}-এর অনুলিপি |
| summary.ready | Ready to generate | তৈরি করার জন্য প্রস্তুত |
| summary.problems | {n} problem(s) must be fixed | {n}টি সমস্যা ঠিক করতে হবে |
| reason.MISSING | {doc}: required file is missing | {doc}: প্রয়োজনীয় ফাইল নেই |
| reason.EXPIRY_NEEDED | {doc}: enter the expiry date | {doc}: মেয়াদের তারিখ দিন |
| reason.EXPIRED | {doc}: expired before the deadline | {doc}: জমার তারিখের আগেই মেয়াদ শেষ |
| error.notPdf | "{name}" is not a PDF and was rejected | "{name}" পিডিএফ নয়, তাই বাদ দেওয়া হয়েছে |
| error.damaged | "{name}" is damaged or cannot be read | "{name}" নষ্ট বা পড়া যাচ্ছে না |
| error.encrypted | "{name}" is password-protected | "{name}" পাসওয়ার্ড-সুরক্ষিত |
| error.limitFiles | Maximum 30 files allowed | সর্বোচ্চ ৩০টি ফাইল অনুমোদিত |
| error.limitSize | Total size must be 50 MB or less | মোট আকার ৫০ মেগাবাইট বা কম হতে হবে |
| error.badJson | requirements.json is not valid | requirements.json সঠিক নয় |
| error.generate | Could not create the package | প্যাকেজ তৈরি করা যায়নি |
| info.generating | Creating package… | প্যাকেজ তৈরি হচ্ছে… |
| info.done | Package ready ({pages} pages) | প্যাকেজ প্রস্তুত ({pages} পৃষ্ঠা) |
| empty.start | Start by loading requirements.json | শুরুতে requirements.json লোড করুন |

(Document names always come from `title_bn` / `title_en` in the data.)

---

## B8. Test Checklist Against the Main Tasks

Run with the sample pack, then with a **modified copy** (different order, flags, deadline) to prove nothing is hard-coded.

**M1 Load**
- [ ] Sample JSON loads; tender details correct; list sorted by `order` even if JSON order is shuffled.
- [ ] Broken JSON → friendly error, no crash.

**M2 Upload**
- [ ] Select all sample files at once → names + pages shown.
- [ ] Add a `.txt`/`.jpg`/renamed `.pdf` that isn't a PDF → rejected with message.
- [ ] Corrupted/encrypted PDF (if any) → clear message, app continues.
- [ ] > 30 files or > 50 MB → clear limit message.
- [ ] Remove a file → disappears; if it was matched, match cleared and status updates.

**M3 Match**
- [ ] Match file to document; same file not offered to another document.
- [ ] Change match; clear match; statuses update instantly.

**M4 Expiry**
- [ ] Date input only for `has_expiry` + matched.
- [ ] Unmatch → date input gone.

**M5 Status (key judging item)**
- [ ] Mandatory, no file → **Missing**.
- [ ] Optional, no file → **Not provided** (no block).
- [ ] Matched + has_expiry + no date → **Expiry date needed**.
- [ ] Expiry < deadline → **Expired**.
- [ ] Expiry == deadline → **OK**.
- [ ] Expiry > deadline → **OK**.
- [ ] Matched, no expiry flag → **OK**.
- [ ] Optional + has_expiry + matched + no date → **Expiry date needed** (blocks).

**M6 Duplicates**
- [ ] Two files with same content, different names → both marked Duplicate.
- [ ] Cannot match duplicates to two different documents.
- [ ] Removing one copy clears the duplicate mark on the other.

**M7 Generate**
- [ ] Button disabled with listed reasons when any Missing/Expiry needed/Expired exists.
- [ ] After fixing all, button enables immediately.
- [ ] Output PDF: page 1 is an English cover with all 7 required items.
- [ ] Documents in `order`, all pages, original page order; optional unmatched skipped.
- [ ] Every page (incl. cover) has `<tender_id> | Page X of Y`; Y = actual total.
- [ ] Footer readable, not overlapping content (check portrait, landscape, and a full-page scan).
- [ ] Cover is a single page with many documents/long title.
- [ ] Open the PDF in Chrome PDF viewer AND another viewer; count pages matches footer.

**M8 Download**
- [ ] File name exactly `<tender_id>_Package.pdf`.

**M9 Languages**
- [ ] Switch to Bangla: every label/button/status/message in Bangla; document names from `title_bn`.
- [ ] Reload → language remembered.
- [ ] Trigger each error in Bangla.
- [ ] Bangla glyphs render correctly (no boxes).

**Compliance**
- [ ] Network tab: no backend calls; `git grep` shows no secrets.
- [ ] Incognito Chrome on live HTTPS URL works without login.
- [ ] `output/<tender_id>_Package.pdf` and `screenshots/` (with statuses) are in the repo.

---

# PART C — STEP-BY-STEP BUILD PLAN (for Antigravity)

> Do ONE step at a time. After each step: run it in the browser → test → `git add . && git commit` (with `Prompt:` line) → push. Steps are ordered by dependency, not by clock. Hard commit gates are marked ⏱.

### Step 0 — Setup (T+0)
- [ ] Unzip sample pack; inspect `requirements.json` and look at the PDFs (spot the traps).
- [ ] Create public repo `devfest-<reg>` with MIT LICENSE and empty README; clone locally.
- [ ] Open the folder in Antigravity. Paste the **Context Block** (A9).
- **Done when:** repo exists, folder open, no project code yet before T+0.

### Step 1 — Scaffold + i18n + early deploy
- [ ] Prompt template A9-1 (scaffolding). Install `pdf-lib`, `@fontsource/noto-sans-bengali`.
- [ ] Header with language switch working and persisted.
- [ ] `checkKeys.js` script added.
- [ ] Commit + push. **Connect Vercel and deploy now (A6).**
- **Done when:** live URL opens; language switch works.  ⏱ First commit.

### Step 2 — Core logic (no UI yet, or minimal)
- [ ] `src/logic/validateRequirements.js`, `status.js` (statusOf, blockingProblems), `duplicates.js`, `fileChecks.js` (PDF header check, load, encrypted/damaged detection, limits).
- [ ] Quick console/dev tests with a few hand-made cases (same-day expiry, missing optional…).
- **Done when:** B8 M5 rules are verifiable in logic.

### Step 3 — Load requirements (M1)
- [ ] Prompt A9-3 with M1 criteria. Show tender card + sorted list; bilingual errors.
- **Done when:** M1 checklist passes. Commit.

### Step 4 — Upload (M2) + duplicates (M6)
- [ ] File input + drag/drop, name + pages + size, reject bad files, limits, remove, SHA-256 duplicate badges.
- **Done when:** M2 + M6 checklist items pass. Commit + push (deploy check).

### Step 5 — Matching (M3)
- [ ] Per-requirement selector; 1:1 enforcement; duplicate-blocked options with reason; clear match.
- **Done when:** M3 passes. Commit.

### Step 6 — Expiry + live status (M4, M5)
- [ ] Date input; status badges; summary bar with problem count and reasons.
- **Done when:** every status case in B8-M5 behaves. Commit + push. ⏱ Be sure a commit exists within 30 min of the previous one.

### Step 7 — Generate gating + PDF builder (M7)
- [ ] Generate disabled with reasons.
- [ ] PDF builder in `src/logic/buildPackage.js`:
  - Create A4 cover page: tender fields, today's date, ordered document list (auto-shrink font to keep one page; sanitize text for Helvetica).
  - For each included requirement (sorted by `order`): load file, copy all pages in order.
  - Footer: for each page, create a page with an extra bottom band (e.g., +28 pt) and place the original page content above it (embed page, offset up), then draw `<tender_id> | Page X of Y` in the band, centered, ≥ 10 pt, dark text. This guarantees the footer never covers content. Same band on the cover.
  - Y = total page count after assembly.
- **Done when:** B8-M7 passes on the sample pack. Commit + push.

### Step 8 — Download (M8)
- [ ] Blob URL → download link `<tender_id>_Package.pdf`; success message; optional preview.
- **Done when:** downloaded file opens and is correct. Commit + push; verify live deploy works end-to-end.

### Step 9 — Bangla pass + UX polish (M9)
- [ ] Run `checkKeys.js`; click through every screen in Bangla.
- [ ] Empty states, clear instructions, large buttons, sticky summary.
- **Done when:** B8-M9 passes; a non-technical person could follow it. Commit + push.

### Step 10 — Main-task freeze check
- [ ] Walk the entire B8 checklist once. Fix only bugs.
- [ ] Test with a modified requirements copy (shuffled order, different deadline, extra optional doc).
- **Done when:** all main tasks pass. ⏱ Aim to be here by ~T+65–70.

### Step 11 — Deliverables
- [ ] Resolve the sample pack's problems in the app (remove duplicate/bad file, enter valid expiry dates or exclude expired docs per the pack) → generate package.
- [ ] Save as `output/<tender_id>_Package.pdf`; add to repo.
- [ ] Take screenshots (statuses with problems, and statuses all OK, plus Bangla view) → `screenshots/`.
- [ ] Commit + push.

### Step 12 — Bonus (only if time remains; stop by ~T+78)
- [ ] In B3 order: safe bad-file messages → auto-match → CSV export → index page → save/reopen …
- [ ] One bonus per commit; never break main features. If a bonus is shaky, revert via a NEW commit (no force-push).

### Step 13 — Final cleanup & README (≈ T+75–82)
- [ ] Prompt A9-6 (cleanup) and A9-5 (README). Check the README sections (A7) are all filled.
- [ ] `npm run build` OK; `git grep` for secrets.
- [ ] Final commit + push. Wait for deployment = Ready.

### Step 14 — Verify & submit (before T+90)
- [ ] Run the A6 verification checklist (incognito, commit SHA match, no secrets).
- [ ] Copy full commit SHA (`git rev-parse HEAD`).
- [ ] Submit form: name, reg number, repo link, final commit ID, live HTTPS link.
- [ ] **STOP. No more commits, pushes, or redeploys.**

---

## Appendix — Common Pitfalls (read before coding)
- Compare dates as strings `YYYY-MM-DD`; never `new Date()` for deadline vs expiry.
- `<input type="date">` returns `YYYY-MM-DD` — store it as is.
- Sort requirements by `order` numerically (not by array index, not as strings).
- Don't store derived status in state.
- pdf-lib standard fonts can't draw Bangla or some Unicode → sanitize cover text; Bangla in PDF needs fontkit (bonus).
- Keep PDF bytes in memory as `Uint8Array`; clone before passing to libraries that may detach buffers.
- Reset `<input type="file">` value after each selection so the same file can be re-added.
- Large merges: process files sequentially and show "Working…".
- Don't use `localStorage` for PDF bytes (5 MB limit).
- Never commit after T+90, never force-push, never include secrets.

# Tender Document Package Builder — Implementation Plan & Step-by-Step Playbook

> **Contest:** AI DevFest 2026 · AI Vibe-Coding Contest (Solo) · Daffodil International University  
> **Repository:** `devfest--253-15-198-`  
> **Target Output:** Static Web Application (Vite + React) deployed on Vercel/Cloudflare Pages  
> **Generated Deliverable:** `output/<tender_id>_Package.pdf`  
> **Time Budget:** 90 Minutes (T+0 to T+90)

---

## 1. Executive Summary & Core Rules

### 1.1 Non-Negotiable Constraints
- **Zero Backend / Serverless:** Pure client-side browser execution. No Node/Express server, no API routes, no Firebase/Supabase, no remote storage.
- **No Hard-Coded Data:** Judges evaluate the app with an **unseen, different test pack**. All metadata, requirements, and deadlines must be dynamically parsed and processed from `requirements.json`.
- **Commit Cadence & Format:**
  - Minimum 3 commits total; at least **1 commit every 30 minutes**.
  - Commit message format:
    ```text
    <Short summary in present tense>

    Prompt: <Exact AI prompt used, shortened if long>
    ```
    *(Or `Manual edit` if done without AI)*.
  - **Never** force-push, rebase pushed commits, or commit after T+90.
- **Bilingual Mandate:** Seamless, instant switching between **English (EN)** and **Bengali (বাংলা)**. Language choice stored in `localStorage`. Zero hardcoded visible English strings in UI.
- **Pure Logic Separation:** Core business logic (status computation, duplicate detection, file verification, PDF assembly) isolated in plain testable JavaScript functions under `src/logic/`, decoupled from React component lifecycle.

---

## 2. Target Architecture & Project Structure

```text
devfest--253-15-198-/
├── .gitignore
├── LICENSE                          # MIT License (already present)
├── PDR.md                           # Specification & Contest Guide
├── IMPLEMENTATION_PLAN.md           # This execution playbook
├── README.md                        # Final filled contest README
├── index.html                       # HTML entry point (title, meta, viewport, Noto font link)
├── package.json                     # Dependencies: react, react-dom, pdf-lib, @fontsource/noto-sans-bengali
├── vite.config.js                   # Vite static build configuration
├── public/
│   └── favicon.svg                  # App favicon
├── src/
│   ├── main.jsx                     # React DOM root render
│   ├── App.jsx                      # Main orchestrator component & layout
│   ├── index.css                    # Unified design system & responsive styling
│   ├── i18n/
│   │   ├── en.js                    # English dictionary
│   │   ├── bn.js                    # Bengali dictionary
│   │   ├── index.jsx                # LanguageProvider, useLang(), t(key, params)
│   │   └── checkKeys.js             # Automated parity validator for en vs bn keys
│   ├── logic/
│   │   ├── validateRequirements.js  # Schema & data integrity checker for requirements.json
│   │   ├── fileChecks.js            # MIME, %PDF- magic byte, damage & encryption detection
│   │   ├── duplicates.js            # Web Crypto SHA-256 byte hashing & duplicate grouping
│   │   ├── status.js                # Five-state deterministic compliance status engine
│   │   ├── autoMatch.js             # Token-based filename auto-suggestion heuristic (Bonus)
│   │   ├── exportCsv.js             # UTF-8 BOM CSV export for compliance checklist (Bonus)
│   │   └── buildPackage.js          # pdf-lib cover generator, page merger & bottom-band footer
│   ├── state/
│   │   └── useTenderState.js        # State reducer / store managing single source of truth
│   └── components/
│       ├── Header.jsx               # Header with title & EN / বাংলা toggle switch
│       ├── NoticeList.jsx           # Dismissible alerts, errors, and warning banners
│       ├── TenderDetailsCard.jsx    # Step 1: Ingested tender metadata display card
│       ├── FileUploadZone.jsx       # Step 2: Drag & drop PDF uploader + files table + duplicate tags
│       ├── MatchTable.jsx           # Step 3: Requirements table, 1:1 selectors, date inputs, status badges
│       ├── SummaryStickyBar.jsx     # Floating bottom validation summary & problem counter
│       ├── PackageModal.jsx         # Generation progress spinner & success preview/download modal
│       └── BonusToolbar.jsx         # Action buttons: Auto-match, Export CSV, Clear All
├── output/
│   └── <tender_id>_Package.pdf      # Sample pack compiled output (committed before T+90)
└── screenshots/
    ├── 01_problem_statuses.png      # Document status validation with blocking problems
    ├── 02_ready_bangla.png          # All OK status state in Bengali interface
    └── 03_generated_package.png     # Final generated package view
```

---

## 3. Data Model & Pure Logic Specification

### 3.1 App State Schema (In-Memory Single Source of Truth)
```typescript
interface AppState {
  lang: 'en' | 'bn';
  tender: {
    tender_id: string;
    title: string;
    procuring_entity: string;
    bidder: string;
    submission_deadline: string; // "YYYY-MM-DD"
  } | null;
  requirements: Array<{
    id: string;
    order: number;
    title_en: string;
    title_bn?: string;
    mandatory: boolean;
    has_expiry: boolean;
  }>;
  files: Array<{
    id: string;          // crypto.randomUUID()
    name: string;        // "tax_clearance.pdf"
    size: number;        // size in bytes
    pages: number;       // total pages from pdf-lib
    hash: string;        // SHA-256 hex string
    bytes: Uint8Array;   // Raw file buffer in memory
  }>;
  matches: Record<string, string>;   // requirementId -> fileId
  expiry: Record<string, string>;    // requirementId -> "YYYY-MM-DD"
  notices: Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    code: string;
    params?: Record<string, any>;
  }>;
  generating: boolean;
  generatedPdf: {
    blobUrl: string;
    fileName: string;
    pages: number;
  } | null;
}
```

### 3.2 Derived Logic & Rules (Computed on Render, Never Mutated)
1. **Duplicate Detection:**
   - Group files by `hash`. Any group with `count > 1` flags each member as `duplicate`.
   - Store mapping `duplicateGroups.get(hash) -> [fileA, fileB]`.
   - **Enforcement Rule:** If `fileA` is assigned to `req1`, neither `fileA` nor `fileB` can be selected in any other dropdown selector.
2. **Deterministic 5-State Status Engine (`status.js`):**
   ```text
   For requirement R with matched file F:
   IF !F:
       RETURN R.mandatory ? 'MISSING' (BLOCKING) : 'NOT_PROVIDED' (OK)
   IF F AND R.has_expiry:
       IF !expiryDate OR invalid(expiryDate):
           RETURN 'EXPIRY_NEEDED' (BLOCKING)
       IF expiryDate < tender.submission_deadline:  // String comparison YYYY-MM-DD
           RETURN 'EXPIRED' (BLOCKING)
       ELSE:
           RETURN 'OK' (VALID - expiryDate >= deadline is fully valid)
   ELSE:
       RETURN 'OK' (VALID)
   ```
3. **Blocking Gate (`canGenerate`):**
   - Collect all requirements where `status === 'MISSING' || 'EXPIRY_NEEDED' || 'EXPIRED'`.
   - `canGenerate = (blockingProblems.length === 0) && (requirements.length > 0)`.
   - While `!canGenerate`, the Generate button is disabled, and an explicit list of blocking document reasons is displayed.

---

## 4. Step-by-Step Implementation Roadmap

| Step | Milestone | Time Target | Git Commit Planned | Check |
|---|---|---|---|:---:|
| **Step 0** | Workspace & Toolchain Setup | T+0 → T+05 | `Initial repository configuration` | [ ] |
| **Step 1** | Vite App Scaffolding & Design Foundation | T+05 → T+12 | `Scaffold Vite React app with i18n and Noto Bengali font` | [ ] |
| **Step 2** | Bilingual Engine & i18n Parity Script | T+12 → T+18 | `Setup bilingual i18n engine with key checker` | [ ] |
| **Step 3** | Pure Logic Modules (Validation, Status, Duplicates) | T+18 → T+25 | `Implement core validation, status, and duplicate logic` | [ ] |
| **Step 4** | M1: Requirements Parser & Tender Header UI | T+25 → T+32 | `Add requirements.json parser and tender header card` | [ ] |
| **Step 5** | M2 & M6: Multi-PDF Upload & SHA-256 Duplication | T+32 → T+42 | `Add robust PDF upload, validation, and SHA-256 duplicate detection` | [ ] |
| **Step 6** | M3: 1:1 Document Matching Engine & Selectors | T+42 → T+48 | `Implement 1:1 file-to-requirement matching with duplicate lock` | [ ] |
| **Step 7** | M4 & M5: Expiry Inputs & Live Status Summary Bar | T+48 → T+55 | `Add expiry date entry and live compliance status engine` | [ ] |
| **Step 8** | M7: PDF Package Builder (Cover + Merge + Footers) | T+55 → T+68 | `Build combined PDF package with English cover and non-overlapping footers` | [ ] |
| **Step 9** | M8 & M9: Download Handler & Bilingual Polish Pass | T+68 → T+74 | `Add download handler and complete bilingual localization pass` | [ ] |
| **Step 10** | Bonus Tasks: Auto-Match Heuristic & CSV Export | T+74 → T+79 | `Add auto-matching filename suggestions and CSV checklist export` | [ ] |
| **Step 11** | Sample Pack Verification & Deliverable Generation | T+79 → T+83 | `Generate output package and save verification screenshots` | [ ] |
| **Step 12** | Documentation, Final Audit & Freeze | T+83 → T+88 | `Complete contest README, clean code, and verify build` | [ ] |
| **Step 13** | Deployment Verification & Submission Form | T+88 → T+90 | `Final release verification on production URL` | [ ] |

---

## 5. Detailed Step Execution Specifications

### Step 0: Toolchain & Workspace Verification (T+0 → T+05)
- **Goal:** Ensure Node.js, npm, and git are functional in the Windows environment, verify sample pack assets.
- **Actions:**
  - Verify `node -v` and `npm -v`. If path missing, locate via `Program Files` or initialize cleanly.
  - Verify `git` status in repo.
  - Create standard directories: `src/`, `public/`, `output/`, `screenshots/`.
  - Confirm sample pack location: verify `requirements.json` structure and sample PDF contents.

### Step 1: Vite Scaffolding & Design Foundation (T+05 → T+12)
- **Goal:** Set up official Vite + React structure with no heavy dependencies.
- **Dependencies to install:**
  - `pdf-lib` (pure browser PDF manipulation)
  - `@fontsource/noto-sans-bengali` (offline-bundled Bengali typography)
- **Design System (`src/index.css`):**
  - Modern, high-contrast, clean corporate dashboard theme.
  - Typography: `"Noto Sans Bengali", system-ui, -apple-system, sans-serif` with line-height `1.6`.
  - Color Tokens:
    - Primary: `#1e3a8a` (Deep Royal Blue) / `#2563eb` (Accent)
    - Success: `#059669` (Emerald Green)
    - Warning: `#d97706` (Amber)
    - Danger: `#dc2626` (Crimson)
    - Background: `#f8fafc` (Soft slate)
    - Card/Surface: `#ffffff` with crisp borders (`1px solid #e2e8f0`) and subtle shadows.
  - Responsive layout for desktop and laptop viewports with large click targets (buttons >= 40px height).

### Step 2: Bilingual Engine & Dictionary Parity (T+12 → T+18)
- **Goal:** Implement zero-dependency React i18n context with `localStorage` persistence and strict key parity.
- **Components:**
  - `src/i18n/en.js`: Complete English keys (titles, labels, buttons, status descriptions, errors).
  - `src/i18n/bn.js`: Natural Bengali translations for all keys.
  - `src/i18n/index.jsx`: `LanguageContext`, `LanguageProvider`, `useLang()`, `t(key, params)` helper supporting `{name}`, `{n}`, `{doc}` variable interpolations.
  - `src/i18n/checkKeys.js`: Node CLI script checking `en` vs `bn` difference; fails if any key is missing.
- **Acceptance Criteria:**
  - Language toggle button `EN | বাংলা` in header immediately switches all visible strings.
  - Language selection persists across browser reloads (`localStorage.getItem('lang')`).
  - Document names dynamically select `lang === 'bn' ? (title_bn || title_en) : title_en`.

### Step 3: Pure Logic Modules (T+18 → T+25)
- **Goal:** Build and verify standalone pure calculation functions.
- **Files:**
  - `src/logic/validateRequirements.js`:
    - Checks required tender fields (`tender_id`, `title`, `procuring_entity`, `bidder`, `submission_deadline`).
    - Validates date format `^\d{4}-\d{2}-\d{2}$`.
    - Checks `requirements` array non-empty, unique IDs, numeric sorting by `order`.
  - `src/logic/fileChecks.js`:
    - Validates PDF signature (`%PDF-` in first 1024 bytes).
    - Checks size limits (<= 50MB aggregate, <= 30 files).
    - Attempts `PDFDocument.load(bytes)` to verify non-damaged, non-password-protected PDFs and extract exact page count.
  - `src/logic/duplicates.js`:
    - Computes `SHA-256` digest via `window.crypto.subtle.digest('SHA-256', bytes)`.
    - Converts buffer to hex string.
    - Groups duplicate files.
  - `src/logic/status.js`:
    - Implements strict 5-state logic (`MISSING`, `EXPIRY_NEEDED`, `EXPIRED`, `NOT_PROVIDED`, `OK`).
    - Extracts blocking problem list with document name and humanized reason code.

### Step 4: Step 1 UI — Load Requirements (M1) (T+25 → T+32)
- **Goal:** Ingest `requirements.json` via file input or drag-and-drop.
- **UI Elements:**
  - "Load requirements.json" button with custom translated label.
  - Card showing parsed tender details:
    - Tender ID badge
    - Tender Title
    - Procuring Entity
    - Bidder Name
    - Submission Deadline
  - Reset confirmation if replacing an existing file when matches exist.
  - Error alert banner on malformed JSON or schema violation.

### Step 5: Step 2 UI — PDF Upload & Duplicate Badges (M2 & M6) (T+32 → T+42)
- **Goal:** Ingest multiple PDFs with immediate validation and duplicate flagging.
- **UI Elements:**
  - Drag-and-drop file dropzone + "Choose PDF files" button.
  - Uploaded Files table:
    - File Name
    - File Size (formatted in KB/MB)
    - Total Pages
    - Duplicate Badge: `Duplicate of <other_filename>` (distinct amber/red pill)
    - Remove button: Clears file from memory, recalculates duplicates, unassigns any active match.
  - Automatic error alerts for rejected files (non-PDF, corrupted, password protected, limit exceeded).

### Step 6: Step 3 UI — 1:1 Document Matching (M3) (T+42 → T+48)
- **Goal:** Enable user to assign uploaded PDFs to requirements with strict 1:1 constraints.
- **UI Elements:**
  - Requirements table sorted numerically by `order`:
    - `#` (Order number)
    - Document title (`title_bn` or `title_en`)
    - Tag: `Mandatory` (Red/Blue badge) or `Optional` (Gray badge)
    - File Selector Dropdown:
      - Option: `— Select a file —` (Clear / unmatch)
      - Option list of all valid uploaded PDFs
      - Disabled options: Files already matched to another document (labeled `Already assigned`)
      - Disabled options: Duplicate files whose counterpart is already assigned (labeled `Duplicate locked`)
  - Changing a match immediately updates status and unlocks previous file.

### Step 7: Expiry Dates & Live Compliance Status Engine (M4, M5, M7a) (T+48 → T+55)
- **Goal:** Manage expiry dates and display live compliance indicators.
- **UI Elements:**
  - Expiry Date Input:
    - Appears in table row **only** when `has_expiry === true` AND a file is matched.
    - Native date picker `<input type="date">` storing `YYYY-MM-DD`.
    - Automatically clears if file is unassigned.
  - Status Badges (Color + Icon + Text):
    - `MISSING`: Crimson badge (`✕ Missing / অনুপস্থিত`)
    - `EXPIRY_NEEDED`: Amber badge (`⚠ Expiry date needed / মেয়াদের তারিখ দরকার`)
    - `EXPIRED`: Red badge (`⊘ Expired / মেয়াদোত্তীর্ণ`)
    - `NOT_PROVIDED`: Slate gray badge (`— Not provided / প্রদান করা হয়নি`)
    - `OK`: Emerald green badge (`✓ OK / ঠিক আছে`)
  - Floating Sticky Summary Bar:
    - Ready indicator when 0 blocking problems (`✓ Ready to generate`).
    - Problem summary when blocked (`⚠ {n} problem(s) must be fixed`).
    - Expandable drawer listing exact blocking document names and specific reasons.
    - Generate button dynamically enabled/disabled.

### Step 8: PDF Package Assembly Engine (M7b) (T+55 → T+68)
- **Goal:** Compile English Cover Page, merge matched documents in `order`, and stamp non-overlapping bottom footers.
- **Logic (`src/logic/buildPackage.js`):**
  1. Initialize `mergedPdf = await PDFDocument.create()`.
  2. Embed Standard Fonts (`Helvetica`, `Helvetica-Bold`).
  3. **Page 1 (English Cover Page):**
     - Dimensions: Standard A4 (`595.28 x 841.89 pt`).
     - Content:
       - Header: "TENDER SUBMISSION PACKAGE"
       - Key-Value Metadata: Tender ID, Title, Procuring Entity, Bidder, Submission Deadline, Package Creation Date (Today, `YYYY-MM-DD`).
       - Table of Included Documents: Ordered list with index, requirement title, and page count.
       - Single-page guarantee: Dynamic font sizing / line spacing if document count is large.
       - ASCII sanitization: Replace non-Latin characters with ASCII equivalents to prevent Helvetica encoding crashes.
  4. **Document Merging:**
     - Iterate through requirements sorted by `order`.
     - Skip unmatched optional documents.
     - Load matched PDF bytes, copy all pages in original sequence using `mergedPdf.copyPages()`.
  5. **Non-Overlapping Bottom Band Footers:**
     - For every page in the final package (Cover + all document pages):
     - Calculate total page count $Y$.
     - **Technique:** Either enlarge the media box bottom margin by `+28 pt` and shift page content upwards, OR use a dedicated bottom reservation strip (`y = 18 pt`).
     - Stamped text: `<tender_id> | Page X of Y` (Centered, dark `#1e293b`, font size `9.5 pt`).
  6. Return `pdfBytes = await mergedPdf.save()`.

### Step 9: Package Generation & Download Handler (M8 & M9) (T+68 → T+74)
- **Goal:** Provide generation UX with progress indicator and instant download.
- **UI Elements:**
  - Progress modal / backdrop spinner showing "Creating package…".
  - Success banner with total package page count and filename `<tender_id>_Package.pdf`.
  - Action buttons:
    - `Download Package`: Programmatic trigger via `URL.createObjectURL(blob)`.
    - `Preview in Browser`: Opens generated PDF in a new browser tab.
  - Comprehensive bilingual pass verification across all notices and modals.

### Step 10: High-Value Bonus Implementations (T+74 → T+79)
- **Bonus 1 (Bad File Handling):** Polished user notifications with exact failure causes (corrupt, encrypted, unsupported).
- **Bonus 2 (Auto-Match Suggestions):**
  - Heuristic parser comparing sanitized filename tokens with `title_en` and `id`.
  - Button "Auto-Match Files" suggests high-confidence pairings that user can accept or reject.
- **Bonus 3 (Export Checklist CSV):**
  - Export structured CSV file with columns: `No`, `Requirement ID`, `Document Title`, `Type`, `Matched File`, `Pages`, `Expiry Date`, `Status`.
  - Prepend UTF-8 BOM (`\uFEFF`) so Bengali text opens seamlessly in Microsoft Excel.

### Step 11: Sample Pack Verification & Deliverables (T+79 → T+83)
- **Goal:** Run sample pack through app, solve all sample traps, and produce mandatory contest outputs.
- **Actions:**
  - Load sample `requirements.json`.
  - Upload sample documents.
  - Eliminate duplicate file trap; assign correct files.
  - Provide valid expiry dates; skip optional expired document if needed.
  - Generate final package and verify in PDF reader:
    - Cover page correct (English).
    - Page order matches requirements.
    - Footers `<tender_id> | Page X of Y` on every page without covering content.
  - Save file directly to `output/<tender_id>_Package.pdf` and stage in git.
  - Capture UI screenshots into `screenshots/`:
    - `01_problem_statuses.png` (demonstrating status engine catching traps).
    - `02_ready_bangla.png` (demonstrating clean bilingual Bengali interface).
    - `03_generated_package.png` (demonstrating completed package ready for download).

### Step 12: Documentation & Compliance Audit (T+83 → T+88)
- **Goal:** Fill README, ensure clean code, verify build, and check compliance.
- **Actions:**
  - Update `README.md` using the exact PDR template with all checkboxes, tool details, and prompt quotes.
  - Ensure `LICENSE` (MIT) is present.
  - Verify zero secrets in repo (`git grep -n -i -E "api[_-]?key|secret|token|sk-"`).
  - Execute `npm run build` locally to guarantee zero bundle compilation errors.
  - Final commit and push.

### Step 13: Live Deployment Verification (T+88 → T+90)
- **Goal:** Verify production build on live host.
- **Actions:**
  - Open live URL in Incognito Chrome window (no authentication required).
  - Verify commit SHA matches local `git rev-parse HEAD`.
  - Verify language toggle works on live deployment.
  - Test sample file generation on live site.
  - Record live HTTPS URL and final commit SHA for contest submission.
  - **HARD STOP at T+90.** No further commits or pushes.

---

## 6. Pre-Packaged AI Prompts & Git Commit Log Tracker

Use this log to keep track of commits during the contest. Each commit must contain a descriptive title and the prompt used.

### Commit 1 (Scaffolding & i18n Foundation)
```text
Scaffold Vite React app with i18n setup and Noto Bengali font

Prompt: Scaffold a Vite React app with src/i18n (en/bn), a language switch persisted in localStorage, @fontsource/noto-sans-bengali, and pdf-lib. Add checkKeys.js validator.
```

### Commit 2 (Core Logic Modules)
```text
Implement core validation, status engine, and duplicate detection

Prompt: Implement src/logic/validateRequirements.js, status.js, duplicates.js, and fileChecks.js with 5 deterministic statuses, SHA-256 byte hashing, and string date comparisons.
```

### Commit 3 (Requirements & Tender Header)
```text
Add requirements parser and tender details card

Prompt: Create TenderDetailsCard component and file loader for requirements.json with full error handling, schema validation, and numerical order sorting.
```

### Commit 4 (PDF Upload & Duplicate Detection)
```text
Add multi-PDF uploader with magic byte check and duplicate tagging

Prompt: Implement FileUploadZone component supporting multi-file drag and drop, %PDF- header verification, damaged/encrypted PDF detection, size limits, and SHA-256 duplicate badges.
```

### Commit 5 (1:1 Matching & Expiry Inputs)
```text
Implement 1:1 matching table with expiry inputs and live status

Prompt: Build MatchTable component enforcing 1:1 file-to-document assignment, duplicate selection locking, conditional expiry date input, and live color-coded status badges.
```

### Commit 6 (PDF Package Builder & Footers)
```text
Build PDF package generator with cover page and non-overlapping footers

Prompt: Implement buildPackage.js using pdf-lib to generate an English A4 cover page, merge ordered documents, and stamp non-overlapping bottom band footers with tender ID and page numbers.
```

### Commit 7 (Download Handler & Bilingual Polish)
```text
Add package download handler and complete bilingual pass

Prompt: Add package download modal with blob URL trigger, sticky status summary bar, and complete English and Bengali localization for all UI states and notices.
```

### Commit 8 (Bonus Features & Deliverables)
```text
Add auto-match suggestions, CSV checklist export, and sample package output

Prompt: Implement autoMatch.js token heuristic, UTF-8 BOM CSV export, generate output/<tender_id>_Package.pdf from sample pack, and add screenshots.
```

### Commit 9 (README & Final Compliance)
```text
Final documentation, build audit, and cleanup

Prompt: Complete README.md per PDR template, remove console logs, verify zero secrets, and confirm production build passes.
```

---

## 7. Quality Assurance & Testing Checklist (Against PDR Part B8)

### M1: Load Requirements Check
- [ ] Loads sample `requirements.json` correctly.
- [ ] Correctly displays Tender ID, Title, Procuring Entity, Bidder, and Submission Deadline.
- [ ] Requirements are strictly sorted ascending by `order` regardless of input JSON sequence.
- [ ] Malformed JSON or missing required fields produces a clear, bilingual error without crashing.

### M2: File Upload & Validation Check
- [ ] Ingests multiple PDF files simultaneously.
- [ ] Accurately displays filename, file size, and page count for each uploaded PDF.
- [ ] Rejects non-PDF files (checks extension, MIME, and `%PDF-` header magic bytes) with a specific message.
- [ ] Rejects corrupted or encrypted PDFs with a polite message.
- [ ] Enforces <= 30 files and <= 50MB total limits.
- [ ] File removal immediately updates page lists and unbinds any active matches.

### M3: 1:1 Document Matching Check
- [ ] Each requirement selector offers all uploaded files.
- [ ] Once a file is selected, it is disabled/marked in all other selectors.
- [ ] Clearing or changing a match immediately updates status and re-enables the file elsewhere.

### M4: Expiry Date Entry Check
- [ ] Expiry date input appears **only** when `has_expiry === true` AND a file is matched.
- [ ] Input operates with strict `YYYY-MM-DD` formatting.
- [ ] Unmatching a file hides the input and clears the date.

### M5: Status Computation Check
- [ ] Mandatory requirement with no file -> `Missing` (Blocks generation).
- [ ] Optional requirement with no file -> `Not provided` (Does NOT block generation).
- [ ] Matched requirement with `has_expiry = true` but no date -> `Expiry date needed` (Blocks generation).
- [ ] Matched requirement with `expiry < deadline` -> `Expired` (Blocks generation).
- [ ] Matched requirement with `expiry == deadline` -> `OK` (Does NOT block generation).
- [ ] Matched requirement with `expiry > deadline` -> `OK` (Does NOT block generation).
- [ ] Matched requirement with `has_expiry = false` -> `OK` (Does NOT block generation).
- [ ] Status updates instantaneously upon matching, date changes, or file removal.

### M6: Duplicate Content Detection Check
- [ ] Computes exact SHA-256 hash of file bytes.
- [ ] Files with identical hashes are flagged with a `Duplicate` badge.
- [ ] If one file of a duplicate pair is matched, the duplicate copy cannot be matched to another document.
- [ ] Removing one duplicate clears the duplicate tag on the remaining file.

### M7: Package Assembly & Footer Check
- [ ] Generate button is disabled while any blocking status (`MISSING`, `EXPIRY_NEEDED`, `EXPIRED`) remains.
- [ ] Floating summary bar lists exact problem counts and document reasons.
- [ ] Combined PDF Page 1 is an English Cover Page containing:
  - Tender ID, Title, Procuring Entity, Bidder, Deadline, Date created (`YYYY-MM-DD`), and ordered list of included documents.
  - Formatted strictly within a single A4 page.
- [ ] Merged documents follow `order` sequence, preserving all original pages.
- [ ] Unmatched optional documents are cleanly omitted.
- [ ] Every page (including Cover) contains `<tender_id> | Page X of Y` in footer.
- [ ] Footer is placed in an extended bottom band so it never obscures document content.

### M8: Download & Presentation Check
- [ ] Download filename strictly matches `<tender_id>_Package.pdf`.
- [ ] Download triggers immediately upon clicking the download button.

### M9: Bilingual & Accessibility Check
- [ ] Switch between English and Bengali updates 100% of UI labels, buttons, headers, statuses, and error messages.
- [ ] Requirements display `title_bn` in Bengali mode, falling back to `title_en`.
- [ ] Language preference persists after refreshing the page.
- [ ] Bengali typography renders cleanly with Noto Sans Bengali without clipped glyphs or missing characters.

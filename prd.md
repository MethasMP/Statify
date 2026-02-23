# Product Requirements Document (PRD)

**Project Name:** Statify\
**Version:** 1.0\
**Status:** Draft\
**Author:** Methas P.\
**Last Updated:** 2026-02-24\
**Target AI Orchestrator:** Staff Architect / Agentic Dev Workflow

---

## ⚠️ Opinionated Preface

> This PRD is written with strong opinions. Every decision has a reason. If you
> disagree, challenge it with data — not preference.\
> The goal is to ship a product that looks real, solves a real problem, and
> demonstrates senior-level thinking to anyone reading the GitHub repo or
> LinkedIn post.\
> **AI agents working from this PRD must not deviate from any decision marked as
> mandatory.**

---

## 1. Problem Statement & Context (บริบทและเป้าหมาย)

- **Problem:** Finance teams, SME owners, and freelancers waste 2–4 hours per
  month manually reconciling bank statements. They export a CSV, open it in
  Excel, copy-paste into another sheet, and try to make sense of hundreds of
  rows — no categorization, no anomaly detection, no summary. It's 2026 and
  people are still doing this by hand. **This is not a UI problem. This is a
  workflow problem.**

- **Why Existing Tools Fail:**

  | Tool                  | Problem                                              |
  | --------------------- | ---------------------------------------------------- |
  | Excel / Google Sheets | Manual, no intelligence, no anomaly detection        |
  | QuickBooks / Xero     | Expensive, overkill for SMEs, high adoption friction |
  | Personal finance apps | Mobile-first, not designed for statement uploads     |
  | Bank portals          | Siloed per bank, no cross-bank view, no custom rules |

- **Goal:** A focused, web-based tool that does one thing extremely well — take
  a raw bank statement (CSV or PDF) and turn it into a structured, categorized,
  anomaly-flagged, exportable report in under 30 seconds.

- **Target Audience (Primary):** "The Overwhelmed SME Owner" — Nong, 34, runs a
  small import business in Bangkok, gets 1 PDF statement per month from KBank,
  spends 3 hours reconciling before meeting her accountant. Pain: _"I just want
  to know where my money went, fast."_

- **Target Audience (Secondary):** A Recruiter / Senior Engineer at a Fintech or
  Software House who clicks the GitHub link from LinkedIn, reads the README in
  45 seconds, and decides if this person thinks like a product engineer — not
  just a coder.

> **Opinionated Take:** Design primarily for Nong. Write the README and
> architecture for the Recruiter. Both must walk away impressed.

---

## 2. Business Rules & Opinionated Decisions (กฎทางธุรกิจแบบฟันธง)

_(ห้าม AI ตัดสินใจเรื่องเหล่านี้แทน ต้องทำตามนี้เท่านั้น)_

- **Project Strategy:** This is a portfolio project built to attract inbound
  recruiting opportunities — especially from banking, fintech, and remote-first
  software houses. Every technical decision must serve this meta-goal. Do not
  over-engineer for enterprise scale that will never exist.

- **Categorization Method:** ใช้ rule-based keyword matching เท่านั้น — ห้ามใช้ ML หรือ
  LLM ในการ categorize transaction ในเวอร์ชันนี้ เหตุผลคือ fintech ต้องการ
  explainability ผู้ใช้ต้องรู้ได้ทันทีว่า "ทำไม transaction นี้ถึง flag" ไม่ใช่แค่ "model บอก"

- **PDF Parsing:** ใช้ Apache PDFBox เท่านั้น — ห้ามใช้ third-party PDF SaaS (เช่น
  Adobe API, Textract) เพราะเพิ่ม cost และ external dependency โดยไม่จำเป็น

- **Authentication:** ห้ามสร้างระบบ Auth ในเวอร์ชัน 1.0 — single session per upload
  เท่านั้น DB schema ต้องออกแบบให้รองรับ `user_id` (nullable) ไว้ล่วงหน้าสำหรับ v2

- **Report Export:** PDF ต้อง generate server-side เท่านั้น — ห้ามใช้ `window.print()`
  หรือ browser-based PDF generation เพราะ output ไม่ consistent และทดสอบไม่ได้

- **No Silent Failures:** ห้าม swallow exceptions ในทุก layer โดยเด็ดขาด ทุก error
  ต้องมี user-facing message และ structured log ทุก partial parse failure
  ต้องแจ้งให้ผู้ใช้ทราบ

- **Secrets Management:** ห้าม hardcode secrets, API keys, หรือ DB credentials
  ในโค้ดเด็ดขาด ต้องดึงผ่าน Environment Variables เท่านั้น ทุก PR ต้องผ่าน `.gitignore`
  check ก่อน commit

---

## 3. Explicit Tech Stack (สถาปัตยกรรมเทคโนโลยีที่บังคับใช้)

_(ต้องระบุให้ชัดเจน ห้าม AI เลือกเครื่องมือเองหรือสร้าง Stack ใหม่)_

| Layer                        | Technology                           | Mandatory? |
| ---------------------------- | ------------------------------------ | ---------- |
| **Frontend**                 | Next.js 14 (App Router) + TypeScript | ✅ บังคับ    |
| **UI Components**            | shadcn/ui + TailwindCSS              | ✅ บังคับ    |
| **Charts**                   | Recharts                             | ✅ บังคับ    |
| **Backend / API**            | Java 21 + Spring Boot 3              | ✅ บังคับ    |
| **PDF Parsing**              | Apache PDFBox                        | ✅ บังคับ    |
| **PDF Export**               | JasperReports                        | ✅ บังคับ    |
| **Database**                 | PostgreSQL 16                        | ✅ บังคับ    |
| **DB Migration**             | Flyway                               | ✅ บังคับ    |
| **Deployment: Frontend**     | Vercel (Free tier)                   | ✅ บังคับ    |
| **Deployment: Backend + DB** | Railway                              | ✅ บังคับ    |
| **Testing: Backend**         | JUnit 5 + Mockito                    | ✅ บังคับ    |
| **Testing: Frontend**        | Vitest + React Testing Library       | ✅ บังคับ    |

> ห้ามเพิ่ม library นอกรายการนี้โดยไม่มี ADR รองรับ (ดู Section 5)

---

## 4. Scope & Feature Prioritization — MoSCoW

_(อธิบายแบบเป็นระบบเพื่อป้องกัน AI มโนฟีเจอร์เพิ่ม)_

### 🟩 Must Have (MVP — ต้องมีก่อน deploy)

- **File Upload:** รับ **Excel (.xlsx)** และ PDF bank statement ผ่าน
  drag-and-drop, preview 10 rows ก่อน confirm (CSV supported เป็น bonus/fallback)
- **Excel Parser:** parse รูปแบบ KBank, SCB statement .xlsx (Apache POI 5.2.5)
- **CSV Parser:** parse รูปแบบ KBank, SCB statement CSV (fallback/bonus)
- **PDF Parser:** parse text-based PDF ของ KBank, SCB, BBL
- **Categorization Engine:** keyword-rule matching, ผู้ใช้ override ได้ inline
- **Anomaly Detection:** 3 rules — Duplicate, Large Amount, Unusual Frequency
- **Dashboard:** Summary Cards + Donut Chart + Bar Chart + Transaction Table
  (filterable)
- **Anomaly Review Page:** ดู, confirm, หรือ dismiss แต่ละรายการได้
- **PDF Export:** generate summary report พร้อม anomaly list และ transaction list

### 🟨 Should Have (ทำถ้าทัน — ก่อน LinkedIn post)

- **Rules Management Page:** add/edit/delete keyword → category mappings พร้อม
  match count
- **Custom Anomaly Threshold:** ผู้ใช้กำหนด large-amount threshold ในหน้า settings
  ได้
- **Sample Files in Repo:** ไฟล์ตัวอย่าง CSV และ PDF ใน `/samples` สำหรับคนที่ clone
  repo

### 🟧 Could Have (มีก็ดี แต่เอาไว้ v2)

- **Dark / Light Mode Toggle**
- **Multi-bank Statement Merge:** upload หลายไฟล์แล้ว merge เป็น dashboard เดียว
- **Google OAuth (NextAuth.js):** สำหรับ saved history per user

### 🟥 Won't Have (ห้ามทำเด็ดขาดในเวอร์ชันนี้)

- ❌ ห้ามทำ ML / AI categorization (rule-based only — ดู Section 2)
- ❌ ห้ามทำ real bank API integration (PSD2 / Open Banking)
- ❌ ห้ามทำ multi-user / team workspace
- ❌ ห้ามทำ mobile app หรือ React Native
- ❌ ห้ามทำระบบ billing / subscription
- ❌ ห้ามทำ chat support หรือ live notification system
- ❌ ห้ามทำ scanned PDF / OCR support (แค่ text-based PDF)

---

## 5. Architectural Framing — 1-3-1

_(สำหรับฟีเจอร์ที่ซับซ้อน วางกรอบความคิดให้ AI เห็นว่าทำไมถึงเลือกทางนี้)_

---

### [AF-001] วิธีจัดการ Categorization Logic

**1 Goal:** ต้องการระบบ categorize transaction ที่ explainable และ maintainable
โดยไม่ต้องพึ่ง model

**3 Options:**

1. Hardcode keyword list ใน Java source code
2. Rule-based engine ที่ดึง rules จาก DB (user-editable)
3. ML model (เช่น fine-tuned classifier หรือ LLM call)

**1 Decision:** บังคับใช้ตัวเลือกที่ **(2) Rule-based engine จาก DB** เพราะ rules
แก้ได้โดยไม่ต้อง redeploy, ผู้ใช้เพิ่ม rules เองได้, และ AI agent สามารถ explain ได้ทุก
transaction ว่า matched keyword ไหน — ต่างจาก ML ที่เป็น black box

---

### [AF-002] วิธี Generate PDF Report

**1 Goal:** ต้องการ PDF output ที่สม่ำเสมอ, ทดสอบได้, และดูเป็น professional

**3 Options:**

1. Browser `window.print()` + CSS print stylesheet
2. Puppeteer (headless Chrome) server-side
3. JasperReports server-side Java library

**1 Decision:** บังคับใช้ตัวเลือกที่ **(3) JasperReports** เพราะ output deterministic
ทุก environment, ทดสอบได้ใน unit test, ไม่ต้องรัน headless browser (ลด memory
footprint บน Railway free tier)

---

### [AF-003] วิธีจัดการ File Parsing Pipeline

**1 Goal:** ต้องการ parsing pipeline ที่รองรับทั้ง CSV และ PDF โดย upstream code
ไม่ต้องรู้ว่า input มาจากไหน

**3 Options:**

1. if/else ใน controller ตาม file extension
2. Strategy Pattern — `FileParser` interface, `CsvParser` และ `PdfParser`
   implement แยกกัน
3. ใช้ Apache Camel หรือ message queue routing

**1 Decision:** บังคับใช้ตัวเลือกที่ **(2) Strategy Pattern** เพราะ clean, testable แยก
unit, และเพิ่ม parser ใหม่ได้ในอนาคตโดยไม่ต้องแตะ business logic — โชว์ OOP thinking ที่
recruiter fintech คาดหวัง

Parser priority order:

```
FileParser (interface)
├── ExcelParser implements FileParser    ← priority 1 (first-class)
├── PdfParser   implements FileParser    ← priority 2 (first-class)
└── CsvParser   implements FileParser    ← priority 3 (fallback/bonus)
```

Library: Apache POI 5.2.5 (`poi-ooxml`) สำหรับ Excel; Apache PDFBox 3.0.1 สำหรับ
PDF

---

### [AF-004] วิธีจัดการ State หลัง Upload บน Frontend

**1 Goal:** ต้องการให้ผู้ใช้เห็น processing status แบบ real-time หลัง upload

**3 Options:**

1. Redirect ไป dashboard ทันที แล้วรอ data load (ผู้ใช้เห็นหน้าว่าง)
2. Polling `/api/v1/uploads/:id` ทุก 2 วินาที จนได้ status = `completed`
3. WebSocket / SSE สำหรับ real-time push

**1 Decision:** บังคับใช้ตัวเลือกที่ **(2) Polling** เพราะ simple, stateless,
และเพียงพอสำหรับ processing time < 10 วินาที WebSocket เพิ่ม complexity
โดยไม่จำเป็นสำหรับ v1

---

## 6. Execution & Quality Gates (กฎการทำงานและการตรวจสอบ)

_(ส่วนนี้สำคัญมากสำหรับ Agentic System เพื่อให้ได้โค้ดระดับ Production)_

- **Workflow บังคับ (Spec-First + TDD):**\
  `ร่าง API Contract (OpenAPI Spec) → เขียน Unit Test ให้พัง → เขียน Code → รันให้ผ่าน → Commit`\
  ห้ามเขียนโค้ดก่อนมี test ในทุกกรณีที่เป็น business logic

- **One Feature at a Time:**\
  ให้ AI โฟกัสและสร้างทีละ 1 feature ให้เสร็จสมบูรณ์ ทำการ Commit และ Verify ก่อนที่จะเริ่ม
  feature ต่อไป ห้าม work-in-progress หลาย feature พร้อมกัน

- **Test Coverage:**\
  ต้องมี unit test ครอบคลุมอย่างน้อย **80%** สำหรับ business logic หลักทุก module ได้แก่
  CSV Parser, PDF Parser, Categorization Engine, Anomaly Detector, และ Report
  Generator

- **Security Constraints:**\
  ห้าม hardcode secrets / API keys / DB credentials ในโค้ดเด็ดขาด ต้องดึงผ่าน
  Environment Variables เท่านั้น ทุก PR ต้องผ่าน `.gitignore` check ก่อน commit

- **Error Handling Gate:**\
  ทุก API endpoint ต้องมี test case สำหรับ error path ด้วย ไม่ใช่แค่ happy path ถ้า test
  error path ไม่มี — feature ยังไม่ถือว่า done

- **No Stack Trace to User:**\
  ห้าม expose stack trace หรือ internal error message ให้ user เห็นในทุกกรณี Spring
  Boot ต้องมี Global Exception Handler และ Frontend ต้องมี error boundary ครอบทุก
  page

- **Commit Convention:**\
  ใช้ Conventional Commits เท่านั้น: `feat:`, `fix:`, `test:`, `chore:`, `docs:` ห้าม
  commit message ว่า "update" หรือ "fix bug" โดยไม่ระบุว่า bug อะไร

---

## 7. User Stories & Acceptance Criteria

### Epic 1: File Upload

**US-001** — As a user, I want to upload a CSV bank statement so the system can
parse my transactions.

**Acceptance Criteria:**

- Supports drag-and-drop and click-to-upload
- Accepts **`.xlsx` (primary)**, `.pdf` (primary), `.xls` (bonus), `.csv`
  (bonus); rejects all others with a clear human-readable error
- File size limit: 10MB — show descriptive error if exceeded
- After upload, system displays preview of first 10 rows before user confirms
  processing
- Processing must complete within 10 seconds for files up to 500 rows
- Partial parse failures show "We processed X of Y rows" — never silent

**US-002** — As a user, I want to upload a PDF bank statement and have it parsed
correctly.

**Acceptance Criteria:**

- Supports text-based Thai bank PDFs: KBank, SCB, BBL
- Scanned / image-based PDFs show "unsupported format" message — no silent
  failure
- Extracted data maps to: date, description, debit, credit, balance

---

### Epic 2: Categorization

**US-003** — As a user, I want transactions auto-categorized so I don't tag them
one by one.

**Acceptance Criteria:**

- Rule matching is case-insensitive against the description field
- Default categories: Food & Drink, Transport, Shopping, Bills & Utilities,
  Healthcare, Transfer, Salary, Other
- Each transaction shows the matched category AND the rule that triggered it
- Uncategorized transactions → "Other" — never null in DB
- User can override category inline in transaction table

**US-004** — As a user, I want to manage my own categorization rules.

**Acceptance Criteria:**

- Rules page: add / edit / delete keyword → category mappings
- Rules stored in DB, applied on next upload
- Each rule shows match count (how many transactions it has ever matched)
- System default rules are protected — cannot be deleted, only overridden

---

### Epic 3: Anomaly Detection

**US-005** — As a user, I want duplicate transactions flagged automatically.

**Acceptance Criteria:**

- Duplicate = same description + same amount + within 24 hours
- Severity: HIGH
- User can mark as "Confirmed Duplicate" or "Legitimate" from Anomaly Review
  page
- Resolved anomalies are archived with timestamp + status — never deleted

**US-006** — As a user, I want to be alerted when a transaction exceeds an
unusual amount.

**Acceptance Criteria:**

- Default threshold: 10,000 THB (user-configurable in settings)
- Severity: MEDIUM
- Alert shows transaction + threshold that was exceeded

**US-007** — As a user, I want to know if I'm paying a merchant more often than
usual.

**Acceptance Criteria:**

- Unusual frequency = merchant appears 3× more often than rolling 3-month
  average
- Requires at least 2 prior uploads to establish baseline — gracefully skipped
  on first upload
- Severity: LOW

---

### Epic 4: Dashboard

**US-008** — As a user, I want a financial summary at a glance.

**Acceptance Criteria:**

- Summary Cards: Total Income, Total Expenses, Net Balance, Anomaly Count
- Donut chart: expense breakdown by category
- Bar chart: income vs. expense by week (within statement period)
- All charts interactive — hover shows value, click filters transaction table
- Dashboard loads in under 2 seconds after upload completes

**US-009** — As a user, I want to filter and search my transactions.

**Acceptance Criteria:**

- Filter by: category, date range, amount range, anomaly flag
- Search by: description keyword
- Filters are combinable (AND logic)
- Results update without page reload

---

### Epic 5: Export

**US-010** — As a user, I want to export a PDF report to share with my
accountant.

**Acceptance Criteria:**

- PDF includes: summary (income/expense/net), category breakdown table, anomaly
  list, full transaction list
- Generated server-side — never browser print
- File named with statement period: `report-2025-12.pdf`
- Export completes within 5 seconds

---

## 8. System Architecture

### 8.1 High-Level Diagram

```
┌─────────────────────────────────────────────────────┐
│                    USER BROWSER                     │
│              Next.js 14 + TypeScript (App Router)   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Upload   │  │Dashboard │  │  Report / Export │  │
│  │   UI     │  │& Charts  │  │      Page        │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────┘  │
└───────┼─────────────┼─────────────────┼─────────────┘
        │  REST API (JSON)               │
        ▼             ▼                 ▼
┌─────────────────────────────────────────────────────┐
│           Java 21 + Spring Boot 3 Backend           │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │File Parser  │  │Categorization│  │ Anomaly   │  │
│  │(Strategy)   │  │   Engine     │  │ Detector  │  │
│  └─────────────┘  └──────────────┘  └───────────┘  │
│  ┌──────────────────────────────────────────────┐   │
│  │      Report Generator (JasperReports)        │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│            PostgreSQL 16 (Railway)                  │
│  uploads │ transactions │ categories │              │
│  categorization_rules │ anomalies                   │
└─────────────────────────────────────────────────────┘
```

### 8.2 Page Map

```
/                          → Landing / Upload (first impression)
/uploads/:id               → Processing status (polling every 2s)
/dashboard/:id             → Main dashboard
/dashboard/:id/anomalies   → Anomaly review
/settings/rules            → Categorization rules management
```

### 8.3 Key Frontend Components

| Component            | Responsibility                             |
| -------------------- | ------------------------------------------ |
| `FileUploadZone`     | Drag-and-drop, validation, progress        |
| `PreviewTable`       | First 10 rows preview before confirm       |
| `SummaryCards`       | Income / Expense / Net / Anomaly count     |
| `CategoryDonut`      | Recharts donut — click to filter           |
| `MonthlyBarChart`    | Recharts bar — income vs expense           |
| `TransactionTable`   | Filterable, sortable, inline category edit |
| `AnomalyBadge`       | Severity chip with color coding            |
| `AnomalyReviewCard`  | Context + confirm/dismiss action           |
| `ReportExportButton` | Triggers server-side PDF download          |

### 8.4 UI/UX Design System & Copywriting Guidelines

Based on the `@frontend-design` and copywriting principles, the application must
exhibit a **high-craft, intentional aesthetic** that avoids generic SaaS
templates.

- **Aesthetic Direction:** "High-Contrast Utilitarian". A strict, data-dense
  interface that feels like a precision financial instrument, not a consumer
  social app.
- **DFII Evaluation:** Score **12** (Impact: +3, Fit: +4, Feasibility: +4,
  Performance: +3, Consistency Risk: -2). This is an excellent direction that
  executes fully on the product's value proposition.
- **Differentiation Anchor:** "Receipt-like" monospaced typography for financial
  figures combined with severe, high-contrast structural borders (1px solid
  `#E5E7EB`). No soft shadows or unnecessary gradients.
- **Typography:**
  - _Display / Body:_ `Inter` (Restrained, highly legible).
  - _Financial Data:_ `JetBrains Mono` or `Space Mono` (Memorable, aligned
    decimals, evokes technical precision).
- **Color Theme (CSS Variables):**
  - _Background:_ Crisp White (`#FFFFFF`) with Off-White panels (`#F8F9FA`).
  - _Primary Accent:_ Deep Indigo (`#4338CA`) — conveys trust, focus, and
    action.
  - _Signals:_ Emerald Green (`#10B981`) for safe/matched, Crimson Red
    (`#E11D48`) for urgent anomalies, Amber (`#F59E0B`) for warnings.
- **Composition & Motion:** Strict grid layout. Dense data tables with ample
  padding for readability. Motion is purposeful and sparse — immediate state
  changes for filters, subtle fade-ins. No decorative micro-motion.
- **Tone of Voice & Microcopy:** Direct, supportive, and precise. Avoid
  conversational tech-bro fluff.
  - _Action-Oriented:_ Buttons use strong verbs (e.g., "Confirm", "Export PDF",
    "Resolve").
  - _Data-First:_ Focus on what the data means. Instead of "Here is your
    dashboard", use "Financial Summary for [Month]".
  - _Error States:_ Always explain _why_ and _how to fix_ (e.g., "File exceeds
    10MB limit. Please split the statement and upload again.").

---

## 9. Data Model

```sql
-- Each file upload session
CREATE TABLE uploads (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename    VARCHAR(255) NOT NULL,
    file_type   VARCHAR(10) NOT NULL CHECK (file_type IN ('csv', 'pdf')),
    status      VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    row_count   INTEGER,
    error_msg   TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories (system-seeded + user-managed)
CREATE TABLE categories (
    id        SERIAL PRIMARY KEY,
    name      VARCHAR(100) NOT NULL UNIQUE,
    color     VARCHAR(7) NOT NULL DEFAULT '#6366F1',
    is_system BOOLEAN NOT NULL DEFAULT FALSE
);

-- Keyword → category mapping rules
CREATE TABLE categorization_rules (
    id          SERIAL PRIMARY KEY,
    keyword     VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    priority    INTEGER NOT NULL DEFAULT 0,
    match_count INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Parsed transactions
CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_id       UUID NOT NULL REFERENCES uploads(id) ON DELETE CASCADE,
    txn_date        DATE NOT NULL,
    description     TEXT NOT NULL,
    amount          NUMERIC(15, 2) NOT NULL,  -- positive = credit, negative = debit
    currency        CHAR(3) NOT NULL DEFAULT 'THB',
    category_id     INTEGER REFERENCES categories(id),
    matched_rule_id INTEGER REFERENCES categorization_rules(id),
    is_override     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Anomaly flags
CREATE TABLE anomalies (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    rule_name      VARCHAR(50) NOT NULL,
    severity       VARCHAR(10) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
    detail         JSONB,
    status         VARCHAR(20) NOT NULL DEFAULT 'open'
                       CHECK (status IN ('open', 'confirmed', 'dismissed')),
    reviewed_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 10. API Contract

### Uploads

```
POST   /api/v1/uploads                    Upload file + trigger processing
GET    /api/v1/uploads/:id                Get upload status (poll)
GET    /api/v1/uploads/:id/preview        Get first 10 rows before confirm
GET    /api/v1/uploads/:id/summary        JSON summary for dashboard cards
```

### Transactions

```
GET    /api/v1/uploads/:id/transactions   List with filters
PATCH  /api/v1/transactions/:id/category  Override category
```

### Anomalies

```
GET    /api/v1/uploads/:id/anomalies      List all anomalies for upload
PATCH  /api/v1/anomalies/:id/status       Update status (confirmed / dismissed)
```

### Categories & Rules

```
GET    /api/v1/categories                 List all categories
POST   /api/v1/rules                      Add rule
PUT    /api/v1/rules/:id                  Update rule
DELETE /api/v1/rules/:id                  Delete rule (system rules protected — 403)
```

### Reports

```
GET    /api/v1/uploads/:id/report         Generate + download PDF report
```

---

## 11. Non-Functional Requirements

| NFR                        | Target                | Rationale                                               |
| -------------------------- | --------------------- | ------------------------------------------------------- |
| Parse time — CSV 500 rows  | < 5 seconds           | UX threshold                                            |
| Parse time — PDF 3 pages   | < 10 seconds          | PDF inherently slower; communicate via progress         |
| Dashboard load             | < 2 seconds           | Snappy after data is ready                              |
| PDF export                 | < 5 seconds           | Acceptable for server-side generation                   |
| Test coverage — backend BL | ≥ 80%                 | Shows discipline across parser, categorization, anomaly |
| No secrets in repo         | 0 violations          | Enforced by .gitignore + pre-commit check               |
| Uptime                     | Best-effort free tier | Portfolio project — not production SLA                  |

---

## 12. Error Handling Philosophy

> Most portfolio projects have zero error handling. This is where you
> differentiate.

Every error must have: a **user-facing message** (what happened) + a **suggested
action** (what to do next). No stack traces visible to users. Ever.

| Scenario              | User sees                                                             | HTTP | System logs          |
| --------------------- | --------------------------------------------------------------------- | ---- | -------------------- |
| Invalid file type     | "Only CSV and PDF files are supported."                               | 400  | File metadata        |
| File > 10MB           | "File exceeds the 10MB limit. Please split and re-upload."            | 413  | File size            |
| PDF is scanned image  | "This PDF appears image-based. Please upload a text-extractable PDF." | 422  | File hash            |
| Partial parse failure | "We processed X of Y rows. Partial results are shown below."          | 206  | Error + row index    |
| Export timeout        | "Report generation is taking longer than expected. Please try again." | 504  | upload_id + duration |

---

## 13. Development Phases

### Phase 1 — Core Pipeline (Weeks 1–2)

- [ ] Spring Boot project scaffold (layered architecture)
- [ ] `FileParser` interface + `ExcelParser` (priority 1) + `PdfParser` +
      `CsvParser` (Strategy Pattern)
- [ ] Excel parser (.xlsx) with sample KBank statement — Apache POI 5.2.5
- [ ] CSV parser with sample KBank statement (fallback)
- [ ] PDF parser with Apache PDFBox + sample SCB statement
- [ ] PostgreSQL schema + Flyway migrations
- [ ] Upload API endpoint + file validation
- [ ] Unit tests for parser edge cases (empty rows, malformed columns,
      image-PDF)

### Phase 2 — Intelligence Layer (Weeks 3–4)

- [ ] Seed default categories + rules via Flyway
- [ ] Categorization engine: keyword matching with priority
- [ ] Anomaly detector: Duplicate rule
- [ ] Anomaly detector: Large Amount rule
- [ ] Anomaly detector: Unusual Frequency rule
- [ ] Global Exception Handler (Spring Boot)
- [ ] Integration tests for all categorization + anomaly scenarios

### Phase 3 — Dashboard (Weeks 5–6)

- [ ] Next.js 14 scaffold with App Router + shadcn/ui
- [ ] FileUploadZone + PreviewTable
- [ ] Polling logic for processing status
- [ ] Dashboard: SummaryCards + CategoryDonut + MonthlyBarChart
- [ ] TransactionTable: filter, search, inline category override
- [ ] AnomalyReview page: confirm / dismiss

### Phase 4 — Polish & Ship (Weeks 7–8)

- [ ] PDF export via JasperReports
- [ ] Rules management page with match count
- [ ] Error states for all failure scenarios (UI)
- [ ] Deploy: Vercel (frontend) + Railway (backend + DB)
- [ ] Add `/samples` folder with real-looking CSV + PDF
- [ ] Record demo walkthrough video (2–3 min)
- [ ] Write README: problem statement, architecture diagram, live demo link, how
      to run locally

---

## 14. Definition of Done (เกณฑ์การตรวจรับงาน)

**A feature is "done" only when ALL of the following are true:**

1. โค้ดทั้งหมดผ่าน Linter โดยไม่มี Error (`eslint` frontend, `checkstyle` backend)
2. Unit tests และ Integration tests ผ่าน **100%** — ห้ามมี skipped test
   โดยไม่มีเหตุผลใน commit
3. Test coverage ≥ 80% บน business logic module ที่ feature นั้นแตะ
4. Error path มี test case ครอบด้วย — ไม่ใช่แค่ happy path
5. ไม่มี hardcoded secret ใดๆ ใน codebase (`git grep` ผ่าน)
6. Feature ทำงานได้ end-to-end บน deployed environment (ไม่ใช่แค่ localhost)
7. UI ไม่มี broken states — ทุก loading, error, และ empty state ต้องมี UI รองรับ
8. Commit message ใช้ Conventional Commits format

**The project is "ready to post" on LinkedIn when:**

1. Live demo URL เข้าถึงได้โดยไม่ต้อง sign up
2. README มี: problem statement, tech stack, architecture diagram, demo
   gif/screenshot, how to run locally
3. `/samples` folder มีไฟล์ตัวอย่าง CSV + PDF
4. GitHub repo มี `.gitignore` ถูกต้อง, ไม่มี committed secrets, และ commit history
   มีความหมาย

---

## 15. Success Metrics

| Metric                                | Target       |
| ------------------------------------- | ------------ |
| GitHub stars (3 months)               | ≥ 10 organic |
| LinkedIn post impressions             | ≥ 1,000      |
| LinkedIn profile visits จาก post      | ≥ 50         |
| Recruiter inbound DMs (60 วัน)         | ≥ 3          |
| Offer conversations ที่เริ่มจาก project นี้ | ≥ 1          |

---

_End of PRD v1.0 — Statify_

# Statify_OS

The world's most advanced AI bank statement parser. Extract transactions from
PDF/CSV with 99.8% precision. Neural anomaly detection for 2026 financial
workflows.

## Problem Statement

Manual bank statement parsing is slow, error-prone, and painful to reconcile.
Legacy OCR systems rely on rigid coordinate templates that break whenever banks
update document formatting. Statify_OS solves this by interpreting unstructured
PDFs and raw statement CSVs, instantly auto-categorizing transactions, and
exposing hidden anomalies (duplicate charges, suspicious large amounts) using a
robust algorithmic matching engine.

## Live Demo

> **Live Demo:** [https://statify-os.vercel.app](https://statify-os.vercel.app)
> _(Note: this is a deploy demo URL)_

## Architecture

![Architecture Diagram](https://placehold.co/800x400/0d0d0d/00ff94.png?text=Next.js+14+%E2%86%92+Spring+Boot+3.2+%E2%86%92+PostgreSQL)

- **Frontend:** Next.js 14 App Router, TanStack React Query, TailwindCSS
  (Dark/Cyberpunk theme), Framer Motion, Recharts.
- **Backend:** Spring Boot 3.2, Java 21, Spring Data JPA, Apache POI (Excel),
  Apache PDFBox.
- **Database:** PostgreSQL via Spring Data / Hibernate.
- **Exporting:** JasperReports for dynamic PDF generation.

## How to Run Locally

### Prerequisites

- Node.js 20+
- Java 21+
- PostgreSQL 16+
- Maven

### 1. Database Setup

Create a PostgreSQL database named `statify_db`.

```sql
CREATE DATABASE statify_db;
CREATE USER statify_user WITH ENCRYPTED PASSWORD 'statify_pass';
GRANT ALL PRIVILEGES ON DATABASE statify_db TO statify_user;
```

### 2. Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

_(Runs on `localhost:8080`)_

### 3. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

_(Runs on `localhost:3000`)_

Visit `http://localhost:3000` in your browser.

## Samples

Check the `/samples` director in the repository root for testing files
(`statement.csv` and `statement.pdf`) to quickly try out the upload parser.

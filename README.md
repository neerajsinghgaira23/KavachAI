# 🛡️ KavachAI — Single-Page Threat Inspector & Phishing Defense Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB.svg?style=flat&logo=python)](https://www.python.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=flat&logo=docker)](https://www.docker.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**KavachAI** is an ultra-fast, high-precision cybersecurity threat inspection engine purpose-built to detect and defend against **advance-fee employment scams**, **fake cheque reimbursement traps**, **fraudulent rental escrow schemes**, and **spoofed brand typosquatting**.

---

## ⚡ Core Capabilities

- **🎯 0–100% Scam Threat Index**: Weighted composite threat scoring based on advance-fee demands (35%), domain freshness & typosquatting (25%), off-platform redirection (20%), and recruiter mailbox reputation (20%).
- **🔍 Zero-Trust RDAP Domain Forensics**: Real-time async WHOIS/RDAP age querying with sub-3.5s timeouts, high-risk TLD checks (`.xyz`, `.top`, `.click`, `.site`), and brand typosquatting analysis.
- **🛡️ Advance-Fee & Cheque Trap Detection**: Pre-compiled regex engine extracting exact character offsets for cashier check overpayment scams, equipment procurement deposits, and irreversible payment channels (Bitcoin, USDT, Zelle, CashApp, Wire, Gift Cards).
- **✉️ Recruiter Webmail Analyzer**: Flags corporate offer letters originating from free or disposable webmail domains (`gmail.com`, `yahoo.com`, `yopmail.com`, `temp-mail`, `proton.me`) pretending to represent verified enterprises.
- **📄 Multi-Format Document Ingestion**: Ingests PDF appointment letters and lease agreements via `pypdf` with image OCR text normalization fallback.
- **🤖 Synthetic AI Text Detector**: NLP heuristic analyzer calculating burstiness sentence variance, cliché marker density, and sentence-level perplexity to flag machine-generated phishing pitches.
- **📝 Multi-Format Forensic Reporting**: Generates downloadable forensic incident audit reports in **PDF**, **Markdown**, and **JSON** formats with SHA-256 cryptographic payload integrity fingerprinting.
- **💬 Protective Counter-Inquiry Generator**: Generates copy-pasteable legal counter-inquiry templates (demanding corporate email verification, escrow protection, or refusing upfront deposits).

---

## 🏗️ System Architecture

```
KavachAI/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints.py        # /scan, /scan-file, /samples, /export-report, /detect-ai, /health
│   │   │   └── schemas.py          # Pydantic v2 validation models
│   │   ├── services/
│   │   │   ├── domain_service.py   # Async RDAP domain lookup & age calculator (in-memory caching)
│   │   │   ├── regex_rules.py      # Pre-compiled regex engine with exact character offsets
│   │   │   ├── scorer.py           # 0–100% Threat Index calculation & categorization
│   │   │   ├── ocr_service.py      # PDF & image appointment letter text extractor
│   │   │   ├── mail_service.py     # Disposable & free recruiter email detector
│   │   │   └── report_service.py   # Incident audit report generator (PDF, Markdown & JSON)
│   │   ├── utils/
│   │   │   ├── sample_data.py      # Realistic pre-loaded test vectors
│   │   │   └── sanitizers.py       # Text sanitization & IOC extractors
│   │   ├── config.py               # Pydantic BaseSettings & CORS configuration
│   │   └── main.py                 # FastAPI application entry point with GZip compression
│   ├── tests/
│   │   ├── test_rules.py           # Unit tests for regex patterns & text offsets
│   │   ├── test_domain.py          # RDAP lookup & fallback tests
│   │   ├── test_scorer.py          # Scoring threshold and weight limit tests
│   │   └── test_endpoints.py       # Full API integration tests
│   ├── Dockerfile                  # Multi-stage Python 3.11-slim container (non-root)
│   ├── requirements.txt            # Pinned production dependencies
│   └── .env                        # Backend environment configuration
├── frontend/
│   ├── src/
│   │   ├── components/             # Cyber SOC UI components (Gauge, Highlighter, High-Speed Canvas Orb, Modals)
│   │   ├── context/                # ThemeContext (Dark/Light toggle) & AuthContext & ScanContext
│   │   ├── pages/                  # DashboardPage, HomePage, AboutPage
│   │   ├── services/api.ts         # High-speed API client with client-side caching & mock fallback
│   │   └── types/scan.ts           # Strict TypeScript contracts
│   ├── Dockerfile                  # Production Nginx container
│   ├── package.json
│   └── tailwind.config.js          # Dark & Monochrome Tailwind design system
└── docker-compose.yml              # Complete one-click full stack deployment
```

---

## 🚀 Quick Start Guide

### Option 1: Docker Compose (Recommended)

Run the full stack with a single command:

```bash
docker-compose up --build
```

- **Frontend UI**: `http://localhost:5173`
- **FastAPI Docs**: `http://localhost:8000/docs`
- **API Health Check**: `http://localhost:8000/health`

---

### Option 2: Local Development

#### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend Setup (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

```bash
cd backend
pytest -v
```

Tests include:
- `test_rules.py`: Character span offset verification for regex patterns.
- `test_domain.py`: RDAP domain parsing, brand similarity ratio, and fallback mechanics.
- `test_scorer.py`: Threat Index clamping (0–100%) and tier categorization.
- `test_endpoints.py`: End-to-end API integration tests for `/scan`, `/samples`, `/detect-ai`, and `/export-report`.

---

## 📡 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/health` | `GET` | System telemetry & ruleset version status |
| `/api/v1/scan` | `POST` | Inspect text, domain URLs, and sender mailboxes |
| `/api/v1/scan-file` | `POST` | Upload PDF / image document for OCR inspection |
| `/api/v1/samples` | `GET` | Retrieve pre-loaded attack vector scenarios |
| `/api/v1/detect-ai` | `POST` | Synthetic NLP burstiness & perplexity analysis |
| `/api/v1/export-report` | `POST` | Export forensic audit report (PDF / Markdown / JSON) |

---

## 🛡️ License

This project is licensed under the MIT License.

# KavachAI (PhishShield) 🛡️
### Intelligent Single-Page Threat Inspector & Phishing Defense Engine

[![Engine Status](https://img.shields.io/badge/Engine-Online-emerald.svg)](http://localhost:8000/api/v1/health)
[![Ruleset](https://img.shields.io/badge/Ruleset-v1.4.2-cyan.svg)](http://localhost:8000/docs)
[![Docker](https://img.shields.io/badge/Docker-Orchestrated-blue.svg)](./docker-compose.yml)

> **KavachAI** is a military-grade, real-time cyber defense platform designed to inspect deceptive appointment/offer letters, fraudulent rental agreements, and spoofed phishing URLs to calculate a dynamic **0–100% Scam Threat Index**.

---

## 🎯 Hackathon Pitch & Threat Landscape

Advance-fee fraud and credential-harvesting phishing have surged exponentially. Deceptive tactics include:
1. **Employment Letter Fraud**: Job seekers receive fake corporate appointment letters (e.g., mimicking Google, Microsoft) requiring an upfront "$450 refundable security deposit" for hardware transit insurance or training, routed through Bitcoin wallets or Zelle, paired with unmonitored Telegram recruiter handles.
2. **Deceptive Rental Leases**: Tenants are pressured to wire advance holding deposits for luxury flats because the "landlord is abroad," with promises that keys will be sent via FedEx before any physical walkthrough.
3. **Typosquatting Portals**: Freshly registered domains (<30 days old) mimicking legitimate corporate portals to harvest credentials under artificial 2-hour urgency windows.

**KavachAI** neutralizes these vectors in milliseconds through a unified single-page telemetry console.

---

## 🏗️ Technical Architecture

```
[ Incoming Payload: Text / URL / PDF / Image ]
                        │
                        ▼
       [ App Layer: Sanitizer & Extractor ]
                        │
       ┌────────────────┼────────────────┬────────────────┐
       ▼                ▼                ▼                ▼
 [ Regex Rules ] [ RDAP Intelligence ] [ Mail Service ] [ OCR Engine ]
  Advance Fee     Domain Age (<30d)    Free Webmail     PyPDF & Image
  Wire/Crypto     Typosquat Match      Impersonation    Tesseract
  Off-Platform    TLD Risk Rating      (@gmail vs corp) Text Streams
       │                │                │                │
       └────────────────┼────────────────┴────────────────┘
                        │
                        ▼
       [ Weighted Threat Index Engine (scorer.py) ]
       ├── Advance-Fee & Rental Weight: 35%
       ├── Domain Age & Typosquat:     25%
       ├── Off-Platform Shifting:       20%
       └── Mail Reputation:             20%
                        │
                        ▼
       [ Dynamic 0–100% Scam Threat Index ]
       ├── SAFE:          0% – 29%   (Emerald)
       ├── SUSPICIOUS:   30% – 69%   (Amber)
       └── CRITICAL:     70% – 100%  (Neon Red)
                        │
       ┌────────────────┴────────────────┐
       ▼                                 ▼
[ Safe Verification Reply Generator ]   [ Downloadable Forensic PDF Audit ]
```

---

## 🚀 Key Features

- **Dynamic 0–100% Threat Gauge**: Smooth animated SVG radial dial with instant risk tier color categorization.
- **Weighted Sub-Score Telemetry**: Visual breakdown across Advance-Fee, Domain Age, Off-Platform Channels, and Webmail.
- **RDAP Domain Telemetry**: Live WHOIS lookup extracting domain creation dates, registration age in days, high-risk TLDs, and brand typosquatting similarity ratios.
- **Verbatim Text Annotation Highlighter**: Interactive inline red and amber overlays highlighting triggered scam phrases with forensic tooltips.
- **One-Click Instant Demo Vectors**: Zero-latency judging chips for fake job offers, rental wire scams, and typosquat links.
- **Safe Reply Generator**: One-click generation of protective counter-inquiry templates to test recruiter legitimacy without exposing personal data.
- **Cryptographic Audit PDF Export**: Generates downloadable forensic reports signed with payload SHA-256 digests.
- **Zero-Downtime Offline Fallback**: Built-in client heuristics engine ensuring 100% operational resilience even when disconnected.

---

## 📁 Repository Structure

```
KavachAI/
├── docker-compose.yml                  # Full-stack container orchestration
├── README.md                           # Documentation & setup guide
│
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints.py            # Route handlers (/scan, /samples, /export-report)
│   │   │   └── schemas.py              # Pydantic input/output validation models
│   │   ├── services/
│   │   │   ├── domain_service.py       # RDAP lookup & typosquatting detection
│   │   │   ├── regex_rules.py          # Advance-fee & payment channel matchers
│   │   │   ├── scorer.py               # Weighted 0–100% Threat Index engine
│   │   │   ├── ocr_service.py          # PDF & image text extractor
│   │   │   ├── mail_service.py         # Recruiter email reputation validator
│   │   │   └── report_service.py       # Downloadable PDF/JSON audit generator
│   │   ├── utils/
│   │   │   ├── sample_data.py          # Mock attack vectors for demo
│   │   │   └── sanitizers.py           # XSS & payload sanitizers
│   │   ├── config.py                   # App settings & CORS
│   │   └── main.py                     # FastAPI entry point
│   ├── tests/                          # Pytest suite
│   ├── Dockerfile                      # Python container build
│   └── requirements.txt                # Dependencies
│
└── frontend/
    ├── public/
    │   ├── favicon.svg                 # Cyber shield icon
    │   └── mock_samples/               # Offline JSON datasets
    ├── src/
    │   ├── components/
    │   │   ├── Header.tsx              # Brand & status bar
    │   │   ├── InputForm.tsx           # Multi-modal input cockpit
    │   │   ├── DropzoneUploader.tsx    # Drag-and-drop document container
    │   │   ├── ThreatGauge.tsx         # Animated 0–100% risk meter
    │   │   ├── ThreatBreakdown.tsx     # Weighted progress bars
    │   │   ├── DomainCard.tsx          # RDAP domain telemetry
    │   │   ├── TextHighlighter.tsx     # Verbatim text overlay viewer
    │   │   ├── FlagsList.tsx           # Categorized red-flag feed
    │   │   └── SafeReplyModal.tsx      # Protective counter-reply modal
    │   ├── context/ScanContext.tsx     # Global application state store
    │   ├── types/scan.ts               # TypeScript data models
    │   ├── services/api.ts             # API client with offline fallback
    │   ├── App.tsx                     # Main dashboard container
    │   └── main.tsx                    # React client entry point
    ├── Dockerfile                      # Nginx frontend container
    ├── package.json
    └── tailwind.config.js
```

---

## ⚡ Quickstart Guide

### Option 1: Docker Compose (Single-Command Run)

```bash
docker-compose up --build
```

- **Frontend Dashboard**: Open [http://localhost:5173](http://localhost:5173) or [http://localhost](http://localhost)
- **FastAPI Documentation**: Open [http://localhost:8000/docs](http://localhost:8000/docs)
- **API Health Telemetry**: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

### Option 2: Local Development Setup

#### Backend:
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Run Backend Unit Tests:
```bash
cd backend
pytest -v
```

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ License

MIT License — KavachAI Cybersecurity Defense Initiative.

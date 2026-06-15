# AyushAlert

> **A premium, decentralized healthcare data platform** — connecting patients, doctors, and hospitals through secure, consent-driven medical records and real-time public health analytics.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb)](https://www.mongodb.com)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?logo=vercel)](https://vercel.com)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [API Reference](#api-reference)
- [Security & Privacy](#security--privacy)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Contributing](#contributing)

---

## Overview

AyushAlert is a full-stack healthcare platform built on **Next.js 16** with the App Router. It provides a unified ecosystem for three distinct user roles:

| Role | Capability |
|------|-----------|
| **Patients** | Upload & manage personal health records (PHR), control data sharing via consent, login via OTP or face recognition |
| **Doctors** | View patient history with consent, write prescriptions, scan QR codes, manage consultation status |
| **Hospitals** | Onboard & register, ingest EMR records, manage inventory, issue API keys, request patient data access |

A fourth system — **Health Analytics** — aggregates fully anonymized, de-identified symptom data by pincode to detect disease outbreaks and community health trends in near-real-time.

---

## Key Features

### 🏥 Hospital Portal
- Self-registration with license number & admin email
- Admin-verified onboarding workflow (`pending → verified → rejected`)
- Secure API key generation (`HAK_` prefixed, 48-char hex) post-verification
- Inventory management system for hospital resources
- EMR record ingestion pipeline linked to patient accounts
- Live stats dashboard via `/api/hospital/live-stats`

### 👨‍⚕️ Doctor Portal
- Face-embedding based biometric registration & login
- OTP-based 2FA via email (Nodemailer / Gmail SMTP)
- Consent-gated patient record access
- Consultation status tracking (`online | offline | consulting`)
- QR code scanning to pull patient records at the bedside (`/api/doctor/scan`)
- Specialization-indexed profiles linked to hospital IDs

### 👤 Patient Portal
- Self-registration with ABHA ID support
- Personal Health Record (PHR) management — upload, view, download
- Document types: `Prescription | Lab Report | Scan | Diagnosis | Other`
- Face-recognition login via `face-api.js` (128-dimensional embedding)
- Consent management: approve/reject hospital access requests with OTP verification
- Granular record sharing — patients choose exactly which records to share
- Pincode-level location for regional health trend participation

### 📊 Health Analytics Engine
- Real-time aggregation of anonymized symptom events by pincode
- **Outbreak detection**: ≥5 cases of the same symptom in a region → `outbreak`
- **Warning threshold**: ≥3 cases → `warning`
- 10 Hyderabad pincodes mapped to named localities (Banjara Hills, Gachibowli, Kondapur, etc.)
- Symptom trend tracking over 24h / 7d / 30d time windows
- Live activity feed with hospital-source attribution
- Graceful mock-data fallback when DB is unavailable
- Tracks: `fever`, `cough`, `dengue`, `malaria`, `typhoid`, `diarrhea`, `vomiting`, `headache`, `chest pain`, `rash`, and 4 more

### 🔐 Security & Consent
- **Zero PII in analytics** — `AnalyticsEvent` schema stores only `region_pincode + diagnosis[]`
- Consent records with OTP verification + expiry timestamps
- JWT-based session tokens
- bcrypt password hashing (rounds configurable)
- Hospital API key scoping — only verified hospitals may call ingest APIs
- Cloudinary-hosted record files (no local storage)
- OCR processing with confidence scoring via `Tesseract.js`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         AyushAlert Platform                         │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Patient    │  │    Doctor    │  │   Hospital   │             │
│  │   Portal     │  │    Portal    │  │   Portal     │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                 │                  │                      │
│         └─────────────────┼──────────────────┘                     │
│                           │                                         │
│              ┌────────────▼───────────────┐                        │
│              │     Next.js App Router     │                        │
│              │  (API Routes + SSR Pages)  │                        │
│              └────────────┬───────────────┘                        │
│                           │                                         │
│         ┌─────────────────┼──────────────────┐                    │
│         │                 │                  │                     │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐           │
│  │   MongoDB    │  │  Cloudinary  │  │    SMTP      │           │
│  │  (Mongoose)  │  │ (File Store) │  │  (Mailer)    │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │               Anonymizer Pipeline (Privacy-First)           │  │
│  │  Patient Record → Strip PII → region_pincode + diagnosis[]  │  │
│  │                    → AnalyticsEvent collection              │  │
│  └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI Library | React | 19.2.3 |
| Language | TypeScript | ^5.x |
| Styling | Tailwind CSS v4 | ^4.x |
| Animation | Framer Motion | ^12.38.0 |
| Icons | Lucide React | ^1.7.0 |
| Database | MongoDB + Mongoose | 7.x / 9.x |
| Authentication | JWT + bcryptjs | 9.x / 3.x |
| File Storage | Cloudinary | ^2.9.0 |
| OCR Engine | Tesseract.js | ^7.0.0 |
| Face Recognition | face-api.js | ^0.22.2 |
| Maps | React Leaflet | ^5.0.0 |
| Email | Nodemailer | ^8.0.2 |
| File Uploads | Multer | ^2.1.1 |
| Analytics | @vercel/analytics | ^2.0.1 |
| Font | Plus Jakarta Sans | (Google Fonts) |

---

## Project Structure

```
ayushalert/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page (481 lines)
│   ├── layout.tsx                # Root layout + metadata
│   ├── globals.css               # Global styles
│   ├── dashboard/                # Role-selector dashboard
│   ├── patient/                  # Patient portal pages
│   ├── doctor/                   # Doctor portal pages
│   ├── hospital/                 # Hospital portal pages
│   ├── admin/                    # Admin verification panel
│   ├── analytics/                # Public health analytics map
│   ├── emr/                      # EMR viewer pages
│   ├── intelligence/             # AI/OCR intelligence views
│   ├── docs/                     # In-app documentation
│   ├── governance/               # Governance & policy pages
│   ├── about-us/                 # About page
│   ├── contact/                  # Contact page
│   ├── mission/                  # Mission page
│   ├── privacy/                  # Privacy policy
│   ├── security/                 # Security page
│   ├── status/                   # System status page
│   └── terms/                    # Terms of service
│   └── api/                      # Backend API routes
│       ├── analytics/            # Outbreak analytics engine
│       │   ├── route.js          # GET analytics (305 lines)
│       │   └── simulate/         # Demo data simulation
│       ├── hospital/
│       │   ├── register/         # Hospital self-registration
│       │   ├── login/            # Hospital admin login
│       │   ├── verify/           # Admin verification endpoint
│       │   ├── ingest/           # EMR record ingestion
│       │   ├── inventory/        # Inventory CRUD
│       │   ├── list/             # Hospital directory
│       │   ├── live-stats/       # Real-time metrics
│       │   └── request-access/   # Patient data access requests
│       ├── doctor/
│       │   ├── register/         # Doctor registration (face embed)
│       │   ├── login/            # Face + OTP login
│       │   ├── login-otp/        # OTP delivery
│       │   ├── records/          # Consent-gated record access
│       │   ├── scan/             # QR code patient lookup
│       │   ├── check-consent/    # Consent status check
│       │   └── request-access/   # Request patient consent
│       ├── patient/
│       │   ├── register/         # Patient registration
│       │   ├── login/            # OTP + face login
│       │   ├── login-otp/        # OTP delivery
│       │   ├── profile/          # Profile management
│       │   ├── records/          # PHR management
│       │   ├── consent-requests/ # View incoming requests
│       │   ├── consent-action/   # Approve/reject with OTP
│       │   └── consent-otp/      # OTP for consent flows
│       └── records/
│           ├── upload/           # Cloudinary file upload
│           ├── process/          # Tesseract.js OCR pipeline
│           └── [record_id]/      # Individual record fetch
│
├── components/                   # Shared React components
│   ├── NavBar.tsx                # Main navigation bar
│   ├── Footer.tsx                # Site footer
│   ├── BrandLogo.tsx             # Animated brand logo
│   ├── AnalyticsMap.tsx          # Leaflet outbreak map
│   ├── ScannerOverlay.tsx        # QR/camera scanner UI
│   ├── ThemeProvider.tsx         # next-themes wrapper
│   ├── patient/
│   │   └── PatientNav.tsx        # Patient portal sidebar nav
│   └── hospital/
│       └── HospitalNav.tsx       # Hospital portal sidebar nav
│
├── models/                       # Mongoose data models
│   ├── Patient.js                # Patient schema (11 fields)
│   ├── Doctor.js                 # Doctor schema (12 fields)
│   ├── Hospital.js               # Hospital schema (14 fields + API key)
│   ├── Record.js                 # Medical record schema (15 fields)
│   ├── Consent.js                # Consent request schema (8 fields)
│   ├── AnalyticsEvent.js         # Anonymized event schema (4 fields, zero PII)
│   ├── Appointment.js            # Appointment scheduling
│   └── Inventory.js              # Hospital inventory
│
├── lib/                          # Server-side utilities
│   ├── mongodb.js                # Mongoose connection (cached singleton)
│   ├── mailer.js                 # Nodemailer email sender (Gmail SMTP)
│   ├── anonymizer.js             # PII stripping + AnalyticsEvent writer
│   └── cloudinary.js             # Cloudinary SDK init
│
├── utils/
│   └── jwt.js                    # JWT sign/verify helpers
│
├── scripts/
│   └── seed_demo.js              # Demo data seeder (8.5KB)
│
├── public/                       # Static assets
│   └── Assets/                   # Product screenshots & mockups
│
├── next.config.ts                # Next.js config (React Compiler enabled)
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
└── eslint.config.mjs             # ESLint configuration
```

---

## Data Models

### Patient
```js
{
  patient_id:        String,   // Unique identifier
  name:              String,
  email:             String,   // Unique
  mobile:            String,
  gender:            String,
  dob:               Date,
  abha_id:           String,   // Ayushman Bharat Health Account ID
  pincode:           String,   // Used for regional analytics (anonymized)
  password_hash:     String,   // bcrypt hash
  face_embedding:    [Number], // 128-dim face-api.js descriptor
  login_otp:         String,
  login_otp_expiry:  Date,
  created_at:        Date
}
```

### Doctor
```js
{
  doctor_id:        String,   // Unique identifier
  name:             String,
  license_number:   String,   // Unique — medical council number
  specialization:   String,
  hospital_id:      String,   // Linked hospital
  email:            String,   // Unique
  face_embedding:   [Number], // 128-dim face descriptor for biometric login
  login_otp:        String,
  login_otp_expiry: Date,
  verified:         Boolean,
  status:           'online' | 'offline' | 'consulting',
  last_active:      Date,
  created_at:       Date
}
```

### Hospital
```js
{
  hospital_id:     String,
  name:            String,
  registration_id: String,   // Government registration number (unique)
  license_number:  String,
  address:         String,
  city:            String,
  phone:           String,
  logo_url:        String,   // Cloudinary URL or base64
  admin_email:     String,   // Unique
  password:        String,   // bcrypt hash
  status:          'pending' | 'verified' | 'rejected',
  verified_at:     Date,
  verified_by:     String,
  api_key:         String,   // HAK_ + 48 hex chars (generated post-verification)
  created_at:      Date
}
```

### Record (Medical)
```js
{
  record_id:       String,
  patient_id:      String,
  hospital_id:     String,
  file_name:       String,
  file_url:        String,   // Cloudinary hosted URL
  document_type:   'Prescription' | 'Lab Report' | 'Scan' | 'Diagnosis' | 'Other',
  source:          'phr' | 'hospital',
  data_origin:     'ocr' | 'hospital',
  ocr_status:      String,   // 'pending' | 'done' | 'failed'
  fhir_status:     String,   // FHIR compliance status
  structured_data: Object,   // Extracted OCR JSON payload
  confidence_score: Number,  // Tesseract.js confidence (0-100)
  verified:        Boolean,
  billing_amount:  Number,
  payment_status:  'pending' | 'paid' | 'failed',
  last_verified_at: Date,
  uploaded_at:     Date
}
```

### Consent
```js
{
  request_id:       String,
  patient_id:       String,
  hospital_id:      String,
  status:           'pending' | 'approved' | 'rejected',
  approved_records: [String],  // Record IDs patient chose to share
  otp:              String,    // 6-digit OTP for consent confirmation
  otp_expires_at:   Date,
  created_at:       Date,
  access_expires_at: Date      // Consent automatically expires
}
```

### AnalyticsEvent *(Zero PII)*
```js
// PRIVACY: NO patient identifiers are stored in this collection.
{
  region_pincode: String,    // 6-digit Indian pincode only
  diagnosis:      [String],  // e.g. ['fever', 'cough'] — lowercased
  severity:       'mild' | 'moderate' | 'severe' | 'unknown',
  timestamp:      Date
}
```

---

## API Reference

### Analytics
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET` | `/api/analytics?period=24h&symptom=fever&region=500032` | Fetch outbreak data, symptom charts, trend lines, and activity feed |
| `POST` | `/api/analytics/simulate` | Seed mock analytics events for demo |

**Query Parameters:**
- `period`: `24h` (default) \| `7d` \| `30d`
- `symptom`: filter by symptom keyword (optional)
- `region`: filter by pincode (optional)

**Response includes:**
- `metrics` — `totalRecords`, `activeRegions`, `alertsTriggered`, `topSymptom`, `pctChange`
- `events` — symptom × region breakdown with `outbreak | warning | normal` status
- `regionTotals` — aggregate count per pincode
- `outbreaks` — regions crossing the outbreak threshold (≥5)
- `warnings` — regions at warning threshold (≥3)
- `feed` — live activity stream (last 20 events)
- `symptomChart` — top 10 symptoms by frequency
- `trend` — 7-day per-symptom daily breakdown

---

### Hospital
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/hospital/register` | Register new hospital |
| `POST` | `/api/hospital/login` | Admin login (returns JWT) |
| `POST` | `/api/hospital/verify` | Admin panel: verify/reject hospital |
| `POST` | `/api/hospital/ingest` | Ingest EMR records (requires `HAK_` API key) |
| `GET`  | `/api/hospital/inventory` | Fetch hospital inventory |
| `POST` | `/api/hospital/inventory` | Update inventory |
| `GET`  | `/api/hospital/list` | List all verified hospitals |
| `GET`  | `/api/hospital/live-stats` | Real-time hospital metrics |
| `POST` | `/api/hospital/request-access` | Request patient consent |

---

### Doctor
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/doctor/register` | Register with face embedding |
| `POST` | `/api/doctor/login` | Biometric + OTP login initiation |
| `POST` | `/api/doctor/login-otp` | Verify OTP to complete login |
| `GET`  | `/api/doctor/records?patient_id=X` | Fetch patient records (consent required) |
| `POST` | `/api/doctor/scan` | QR code → patient lookup |
| `GET`  | `/api/doctor/check-consent?patient_id=X` | Check consent status |
| `POST` | `/api/doctor/request-access` | Request patient data consent |
| `POST` | `/api/doctor/update-status` | Update doctor's availability status |

---

### Patient
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/patient/register` | Register new patient |
| `POST` | `/api/patient/login` | OTP or face login initiation |
| `POST` | `/api/patient/login-otp` | Verify OTP to complete login |
| `GET`  | `/api/patient/profile` | Fetch patient profile |
| `GET`  | `/api/patient/records` | Fetch own PHR records |
| `GET`  | `/api/patient/consent-requests` | View pending consent requests |
| `POST` | `/api/patient/consent-action` | Approve/reject consent with OTP |
| `POST` | `/api/patient/consent-otp` | Send OTP for consent verification |

---

### Records
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/records/upload` | Upload file to Cloudinary |
| `POST` | `/api/records/process` | Run Tesseract.js OCR on uploaded record |
| `GET`  | `/api/records/[record_id]` | Fetch individual record by ID |

---

## Security & Privacy

### Authentication Layers
1. **Password** — bcrypt hashed at rest, never stored in plaintext
2. **JWT** — stateless sessions, signed with `JWT_SECRET`
3. **OTP** — time-limited 6-digit codes delivered via SMTP, stored hashed
4. **Face Biometrics** — 128-dimensional embedding via `face-api.js`, stored as numeric array (non-reversible)
5. **Hospital API Keys** — `HAK_` prefix + 48 hex chars, generated only post-admin verification

### Privacy Architecture
- **Anonymizer pipeline**: every medical record that enters the system has its PII stripped before contributing to analytics. Only `pincode + diagnosis[]` flows into `AnalyticsEvent`.
- **Consent-gated access**: doctors and hospitals cannot view patient records without explicit patient approval via OTP-verified consent.
- **Record-level sharing**: patients select exactly which records to share — not an all-or-nothing toggle.
- **Consent expiry**: access windows are time-bounded via `access_expires_at`.

### Severity Classification (Anonymizer)
Diagnoses are automatically escalated to `severe` if they match: `cholera`, `dengue`, `malaria`, `tuberculosis`, `covid-19`, `acute gastroenteritis`. All others default to `mild`.

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB instance (Atlas or local)
- Cloudinary account
- Gmail account with App Password (for SMTP)

### Installation

```bash
# Clone the repository
git clone https://github.com/hemannayak/ayushalert.git
cd ayushalert

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# → Fill in all required values (see Environment Variables section)

# Seed demo data (optional)
node scripts/seed_demo.js

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# ── Database ────────────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ayushalert

# ── Authentication ──────────────────────────────────────────────────────
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars

# ── File Storage (Cloudinary) ───────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ── Email (SMTP via Gmail) ──────────────────────────────────────────────
SMTP_EMAIL=your-gmail@gmail.com
SMTP_PASSWORD=your-gmail-app-password   # Use App Password, not account password
```

> **Note**: For Gmail SMTP, generate an [App Password](https://myaccount.google.com/apppasswords) under your Google Account security settings with 2FA enabled.

---

## Scripts

```bash
npm run dev      # Start Next.js dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint

# Seed demo data into MongoDB
node scripts/seed_demo.js
```

### Demo Seed Script
`scripts/seed_demo.js` (8.5 KB) populates:
- Sample hospitals with verified status
- Sample doctors linked to hospitals
- Sample patients with ABHA IDs and Hyderabad pincodes
- Sample medical records (prescriptions, lab reports)
- Sample analytics events for outbreak simulation

---

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, architecture, modules, trust sections |
| `/dashboard` | Role selection hub (Patient / Doctor / Hospital) |
| `/patient` | Patient portal — records, consent management |
| `/doctor` | Doctor portal — patient lookup, prescriptions |
| `/hospital` | Hospital portal — EMR, inventory, stats |
| `/admin` | Platform admin — hospital verification panel |
| `/analytics` | Public health map — outbreak visualization |
| `/emr` | Electronic Medical Record viewer |
| `/intelligence` | OCR intelligence & structured data view |
| `/docs` | In-app API documentation |
| `/governance` | Data governance policy |
| `/about-us` | Team and mission |
| `/contact` | Contact form |
| `/privacy` | Privacy policy |
| `/security` | Security practices |
| `/terms` | Terms of service |
| `/status` | System health status |

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow conventional commits and ensure `npm run lint` passes before submitting.

---

## License

This project is private and proprietary. All rights reserved.

---

<p align="center">
  Built with ❤️ for India's healthcare ecosystem
</p>

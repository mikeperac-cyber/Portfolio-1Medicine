# Community Health Bridge / Salud Comunitaria / Toplum Sağlığı Köprüsü 🩺🌍

An open-access, multilingual, plain-language health literacy web service designed for underserved communities. Built as a **zero-login, zero-tracker web service** with **vanilla HTML5, CSS3, JavaScript, JSON REST endpoints**, and a portable **Java HTTP server (`HealthWebService.java`)** alongside Node.js (`server.js`).

---

## 🌟 Core Architecture & Principles

- **Zero Login Required (100% Public Health Equity)**:
  - No passwords, no sign-ups, no accounts, and no personal data collection.
  - Ephemeral session tokens stored strictly in browser memory (`sessionStorage`).
- **Plain-Language Health Explainers (Grade 5-6 Reading Level)**:
  - Diabetes Prevention & Everyday Management
  - Vaccination Basics & Immune Defense
  - Prescription Medication Safety & 7-Day Pill Organizers
  - Mental Health Support & Breaking Stigma
  - Preparing for Doctor Appointments & Asking for Interpreters
- **Multilingual Support (EN, ES, TR)**:
  - English (`en`) 🇺🇸
  - Spanish (`es`) 🇪🇸
  - Turkish (`tr`) 🇹🇷
- **Text-to-Speech Audio Reader**:
  - Built-in Web Speech API audio narration for auditory learners and individuals with low vision or reading barriers.
- **Clinical Reviewer Badging**:
  - Explicit sign-off badges displaying reviewing clinician name, medical role, and verification date.
- **Grounded AI Health Assistant with Dual-Phase Guardrails**:
  - Explains vetted text from the **WHO**, **CDC**, and **Ministries of Health**.
  - Intercepts diagnosis requests (*"Do I have X?"*, *"Diyabet miyim?"*, *"¿Tengo diabetes?"*), triage attempts, and PII.
  - Enforces mandatory educational disclaimer: *"Educational only; not medical advice."*
- **Community Clinic & Resource Directory**:
  - Filterable by service and language with one-tap phone dialing (`tel:`) and directions.
- **Anonymous Pre- and Post-Reading Quizzes**:
  - Ephemeral pre/post knowledge checks with instant educational rationale and score gain tracking.
- **Admin Impact & Reach Dashboard**:
  - Real-time anonymous telemetry measuring community members served, guide views, and knowledge improvement.
- **Printable Outreach Handouts & Scalable QR Guides**:
  - `@media print` 1-page outreach handouts for clinic bulletin boards with vector SVG QR codes.

---

## 🛠️ Dual-Backend Implementation

| Component | Technology | Description |
|---|---|---|
| **Web Client** | Vanilla HTML5 + CSS3 + JS | Lightweight, zero-bundler, responsive down to 360px, accessible |
| **Node.js Service** | `server.js` (Native Node HTTP) | Serves REST endpoints (`/api/...`) and static SPA assets on port 3000 |
| **Java Service** | `HealthWebService.java` | Portable single-file HTTP server (`com.sun.net.httpserver`) with zero dependencies |
| **REST API** | JSON Endpoints | `/api/topics`, `/api/clinics`, `/api/quizzes`, `/api/metrics`, `/api/translations`, `/api/ai/summarize` |

---

## 🚀 Running the Web Service

### Option 1: Run with Node.js (Recommended)
```bash
npm start
# or: node server.js
```
Open **http://localhost:3000** in your browser.

### Option 2: Run with Java (Zero Dependencies)
```bash
javac HealthWebService.java
java HealthWebService
```
Open **http://localhost:3000** in your browser.

### Run Automated Tests
```bash
npm test
```

```bash
cp .env.example .env.local
```
*(The app works out of the box with the built-in mock data layer even without external Supabase/AI credentials!)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Tests
```bash
npm test
```

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🗄️ Database Setup (Supabase)

1. Open your Supabase project dashboard.
2. In the **SQL Editor**, run `supabase/migrations/20240101000000_init_schema.sql` to create all tables, indexes, and RLS policies.
3. Run `supabase/seed.sql` to populate initial health explainers, bilingual clinics, and quiz questions.

---

## 🔒 Safety & Ethics

This project adheres to strict public health safety guidelines:
- **No Diagnostic AI**: Diagnostic and triage AI are excluded to protect patients from hallucinations and algorithmic disparities.
- **No PII**: Zero patient identifiers or tracking cookies are collected.
- **Full Transparency**: See the in-app **Ethics & Sources** page for our 4-stage review workflow.

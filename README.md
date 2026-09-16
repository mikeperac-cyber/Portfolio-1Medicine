# Community Health Bridge / Salud Comunitaria / Toplum Sağlığı Köprüsü 🩺🌍

An open-access, multilingual, plain-language health literacy web application designed for underserved communities. Built with **Next.js 14 (App Router)**, **Tailwind CSS**, **Supabase (Postgres, RLS)**, and **Recharts**.

---

## 🌟 Core Features

- **Plain-Language Health Explainers (Grade 5-6 Reading Level)**:
  - Diabetes Prevention & Everyday Management
  - Vaccination Basics & Immune Defense
  - Prescription Medication Safety & 7-Day Pill Organizers
  - Mental Health Support & Breaking Stigma
  - Preparing for Doctor Appointments & Asking for Interpreters
- **Multilingual Support**:
  - English (`en`) 🇺🇸
  - Spanish (`es`) 🇪🇸
  - Turkish (`tr`) 🇹🇷
- **Clinical Reviewer Badging**:
  - Explicit sign-off badges displaying reviewing clinician name, medical role, and verification date (`draft` → `partner_review` → `published`).
- **Grounded AI Health Assistant with Strict Guardrails**:
  - Answers strictly using vetted text from the **WHO**, **CDC**, and **Ministries of Health**.
  - Dual-phase safety filters intercept diagnosis requests (*"Do I have X?"*, *"Diyabet miyim?"*, *"¿Tengo diabetes?"*), triage attempts, and PII.
  - Enforces mandatory educational disclaimer: *"Educational only; not medical advice."*
- **Community Clinic & Resource Directory**:
  - Searchable and filterable by service (*Sliding-scale, Free Vaccines, Mental Health, Dental, Prenatal, Interpreters*) and language (*Spanish, Turkish, Cantonese, Vietnamese, Mayan, Arabic, Tagalog*).
  - One-tap phone dialing (`tel:`) and Google Maps directions.
- **Anonymous Pre- and Post-Reading Quizzes**:
  - Ephemeral session tracking with **zero PII collected** (no names, emails, or IPs).
  - Immediate educational rationale and real-time knowledge retention delta calculation.
- **Admin Impact & Analytics Dashboard**:
  - Built with **Recharts**.
  - Displays anonymous reach (users served, explainers read, handouts printed, pre vs. post score improvements).
- **Printable Outreach Handouts & Scalable QR Guides**:
  - `@media print` optimized 1-page handouts for community health workers and clinic bulletin boards with dynamic vector QR codes.
- **PWA & Offline Capability**:
  - Web App Manifest and Service Worker caching core pages and locale dictionaries for spotty clinic basement connections.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React
- **Data Visualizations**: Recharts
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security) + seamless offline mock layer
- **Testing**: Vitest unit test suite

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/mikeperac-cyber/Portfolio-1Medicine.git
cd Portfolio-1Medicine
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
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

# 💊 PharmaComply AI

**AI-Powered Pharmaceutical Compliance Platform**  
PharmaComply AI is an intelligent document analysis system for the pharmaceutical industry. Built using **Next.js (TypeScript)**, it utilizes **AI models** (via Unstructured.io + Gemini Pro) to analyze regulatory documents, detect compliance gaps, and simplify the audit process.

---

## 🚀 Project Overview

PharmaComply AI is designed to help pharmaceutical companies manage regulatory documentation more efficiently. By using AI, it reduces manual review efforts and ensures documents align with global compliance frameworks such as:

- **FDA 21 CFR**
- **EU GMP Guidelines**
- **ICH Guidelines**

---

## ✨ Key Features

### 1. AI-Powered Document Analysis
- Natural Language Processing for document structure understanding
- ML & Deep Learning for discrepancy and compliance detection
- Contextual severity assessment

### 2. Regulatory Framework Support
- FDA, EU GMP, ICH, and other global compliance standards
- Multi-framework extensibility

### 3. Advanced Analytics
- Risk scoring & trend detection
- Document status metrics
- Performance tracking over time

### 4. Team Collaboration
- Workspaces with user roles
- Comments, reviews, and approvals
- Full audit trails and versioning

---

## 🎯 Target Users

- Pharmaceutical companies
- Regulatory affairs professionals
- Quality assurance teams
- Compliance officers
- Document managers

---

## 🧱 Tech Stack

| Category       | Technology              |
|----------------|--------------------------|
| Frontend       | Next.js (TypeScript)     |
| Styling        | Tailwind CSS             |
| Icons          | React Icons              |
| AI Integration | Unstructured.io + Gemini Pro |
| State Mgmt     | React Hooks              |
| Routing        | App Router (Next.js 13+) |

---

## 📁 Folder Structure

```
pharma-comply-ai/
├── app/                      # App router pages (login, dashboard)
├── components/              # Reusable UI components
├── lib/                     # Helper functions and configs
├── public/                  # Static assets
├── styles/                  # Tailwind and custom styles
├── types/                   # Global TS types and interfaces
├── .env.local               # Local environment variables
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript config
└── README.md
```

---

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/nithins7676/AI-RENA-SOP .
```

### 2. Install Dependencies

```bash
npm install
# or
yarn
```

### 3. Setup Environment Variables

Create a `.env.local` file in the root and add:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
UNSTRUCTURED_API_KEY=your_unstructured_key
GEMINI_API_KEY=your_gemini_key
```

> ⚠️ Replace with your actual keys and API endpoints

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

---


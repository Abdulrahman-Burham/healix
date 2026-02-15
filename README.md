<p align="center">
  <img src="https://img.shields.io/badge/Healix-AI%20Healthcare-00d4ff?style=for-the-badge&logo=heart&logoColor=white" alt="Healix" />
</p>

<h1 align="center">🏥 Healix — AI-Powered Healthcare Platform</h1>

<p align="center">
  <strong>by DigitalMind</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=flat-square&logo=langchain&logoColor=white" />
  <img src="https://img.shields.io/badge/ChromaDB-FF6F00?style=flat-square" />
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socketdotio&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
</p>

<p align="center">
  A comprehensive, full-stack AI healthcare platform featuring <strong>4 specialized AI agents</strong>, real-time vitals monitoring, smart workout tracking with <strong>live pose detection</strong>, nutrition planning, medication management, health risk predictions, and a futuristic <strong>holographic UI</strong> — all with full <strong>Arabic & English</strong> bilingual support.
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [AI Multi-Agent System](#-ai-multi-agent-system)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 🔭 Overview

**Healix** is an end-to-end AI healthcare and fitness platform that combines real-time health monitoring, intelligent multi-agent AI assistance, and predictive analytics into a single cohesive system. The platform is designed to provide personalized, evidence-based health guidance by integrating:

- **4 AI Agents** (Clinical, Nutrition, Exercise, Risk) powered by LangChain + Ollama LLMs
- **RAG Knowledge Base** using ChromaDB with BM25 ensemble retrieval for evidence-backed responses
- **Real-time Vitals** via WebSocket (Socket.IO) for live heart rate, SpO2, blood pressure, HRV, and more
- **Live Pose Detection** using MediaPipe for camera-based exercise form analysis and rep counting
- **Health Risk Predictions** with SHAP-like factor analysis and what-if scenario modeling
- **Bilingual Support** (Arabic 🇸🇦 & English 🇺🇸) with full RTL layout support

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React + TypeScript)            │
│  Vite • TailwindCSS • Framer Motion • Recharts • Zustand       │
│  MediaPipe Pose Detection • Socket.IO Client • i18next          │
├─────────────────────────────────────────────────────────────────┤
│                    WebSocket (Socket.IO)                        │
│              Real-time vitals • Alerts • Reminders              │
├─────────────────────────────────────────────────────────────────┤
│                     Backend (FastAPI + Python)                  │
│  REST API • JWT Auth • Motor (async MongoDB) • CORS            │
├──────────────┬──────────────┬───────────────┬───────────────────┤
│  LangChain   │  ChromaDB    │   MongoDB     │   Ollama LLM     │
│  Multi-Agent │  RAG Vector  │   Database    │   (GLM-4 / Qwen) │
│  System      │  Store       │              │                    │
└──────────────┴──────────────┴───────────────┴───────────────────┘
```

---

## ✨ Features

### 🫀 Real-Time Health Monitoring
- Live vital signs dashboard (Heart Rate, SpO2, Blood Pressure, HRV, Stress, Body Temp, Steps, Calories, Sleep)
- WebSocket-powered real-time updates
- 4 monitoring views: Real-time, 24h History, Weekly Trends, Population Trends
- Radar chart for multi-vital overview
- Automated alerts for abnormal readings (warning & critical thresholds)

### 🤖 AI Multi-Agent Chat
- **4 Specialized Agents** — each with its own tools, knowledge base, and system prompt:
  - 🩺 **Clinical Agent** — Vital sign analysis, symptom interpretation, clinical insights
  - 🥗 **Nutrition Agent** — Personalized meal plans, macro calculations, dietary guidance
  - 💪 **Exercise Agent** — Safe workout plans, Safe Load Index (SLI), form guidance
  - 📊 **Risk Agent** — SHAP-based risk analysis, what-if scenarios, trend predictions
- Auto-routing by keyword detection (Arabic & English)
- RAG-enhanced responses with ChromaDB + BM25 ensemble retrieval
- Real MongoDB data integration — agents query actual user health data

### 🏋️ Smart Exercise Tracking
- Structured workout plans with bilingual exercise names
- **Live Pose Detection** via MediaPipe camera-based tracking
- Real-time joint angle calculation for form scoring
- Automatic rep counting with up/down phase detection
- Per-exercise safety tips and alternative exercises
- YouTube video links for exercise demonstrations

### 🥗 Nutrition Management
- Daily meal plans with per-food macro breakdown (protein, carbs, fat, calories)
- Macro progress tracking vs daily targets
- Water intake monitoring
- AI-powered meal planner with 5 dietary goals (balanced, weight loss, muscle gain, diabetes-friendly, heart-healthy)
- PieChart macro distribution visualization

### 💊 Medication Management
- Medication tracking with status (taken, missed, upcoming, late)
- Add/edit medications with dosage, frequency, and instructions
- Family medication monitoring via shareable family codes
- Compliance visualization and reminders

### 📈 Health Risk Predictions
- Current vs predicted risk scores with trend analysis
- SHAP feature importance breakdown (exercise, sleep, diet, stress, medications, HR, HRV)
- 4 what-if scenarios showing projected health outcomes
- Monthly trend charts (actual vs predicted)

### 🧠 Smart AI Features
- **Symptom Checker** — Select from 18+ symptoms, set severity/duration, get AI-powered urgency assessment
- **Drug Interaction Checker** — Check new drugs against current medications for interaction severity
- **Health Report** — Auto-generated comprehensive report with A-F grading across vitals, activity, sleep, medications
- **AI Meal Planner** — Generate personalized meal plans with dietary goals and calorie targets
- **Health Journal** — Daily journaling with mood tracking (6 moods), energy/pain levels, and AI-generated insights

### 🧬 VR Digital Twin
- Interactive full-body human silhouette with floating vital sign data points
- Real-time vitals overlaid on anatomical positions
- User profile display (medical conditions, medications, blood type, fitness level)
- Risk prediction panel and alerts with severity coloring

### 🌐 Bilingual Support (Arabic & English)
- Full i18n with `i18next` and browser language detection
- RTL layout support for Arabic
- Bilingual exercise names, meal names, medical terms, and UI elements
- AI agents respond in the same language the user writes in

### 🎨 Holographic UI
- Custom holographic component library (`HoloCard`, `HoloOrb`, `HoloParticles`, `HoloRing`, `HoloCube`, `HoloDNAHelix`, `HoloHeartbeat`, `HoloScanLine`, `HoloBgMesh`)
- 3D mouse-tracking tilt effects with configurable glow
- Animated particles, scan lines, and grid overlays
- Glassmorphism design throughout the app

### 🔐 Authentication & Admin
- JWT-based authentication with bcrypt password hashing
- User registration with comprehensive onboarding (medical history, fitness goals, lifestyle)
- Role-based access control (User / Admin)
- Admin dashboard with user stats, risk distribution, alerts overview
- Protected and admin-only routes

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite 6** | Build tool & dev server |
| **TailwindCSS 3** | Utility-first styling |
| **Framer Motion** | Animations & transitions |
| **Recharts** | Charts & data visualization |
| **Zustand** | Global state management |
| **React Router 6** | Client-side routing |
| **Socket.IO Client** | Real-time WebSocket communication |
| **i18next** | Internationalization (AR/EN) |
| **MediaPipe** | Live pose detection & tracking |
| **Axios** | HTTP client |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | Async REST API framework |
| **Python 3.10+** | Backend language |
| **MongoDB + Motor** | Async NoSQL database |
| **LangChain** | AI agent orchestration |
| **LangGraph** | Agent graph workflows |
| **Ollama** | Local LLM inference (GLM-4, Qwen) |
| **ChromaDB** | Vector store for RAG |
| **BM25Retriever** | Keyword-based retrieval |
| **Socket.IO** | Real-time server (python-socketio) |
| **JWT (python-jose)** | Authentication tokens |
| **Passlib + bcrypt** | Password hashing |
| **Pydantic v2** | Data validation & serialization |
| **Pandas / NumPy** | Data processing |

---

## 📁 Project Structure

```
healix/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── run.py                   # Uvicorn + Socket.IO launcher
│   ├── requirements.txt         # Python dependencies
│   ├── app/
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # MongoDB connection (Motor)
│   │   ├── auth.py              # JWT auth & password hashing
│   │   ├── models.py            # Pydantic data models
│   │   ├── socket_server.py     # Socket.IO server setup
│   │   ├── ai/
│   │   │   ├── agent_system.py  # 4 AI agents (Clinical, Nutrition, Exercise, Risk)
│   │   │   └── knowledge_base.py # ChromaDB + BM25 RAG knowledge base
│   │   └── routes/
│   │       ├── auth_routes.py       # Login, Register
│   │       ├── user_routes.py       # User profile & onboarding
│   │       ├── vitals_routes.py     # Vital signs CRUD & trends
│   │       ├── exercise_routes.py   # Exercise logging & plans
│   │       ├── nutrition_routes.py  # Meal logging & plans
│   │       ├── medication_routes.py # Medication management
│   │       ├── chat_routes.py       # AI chat endpoints
│   │       ├── prediction_routes.py # Risk predictions
│   │       ├── admin_routes.py      # Admin dashboard
│   │       ├── smart_routes.py      # Smart features (symptoms, drugs, reports, etc.)
│   │       └── pose_routes.py       # Pose analysis endpoints
│   └── chroma_db/               # ChromaDB vector store persistence
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── src/
│   │   ├── App.tsx              # Routes & auth guards
│   │   ├── main.tsx             # App entry point
│   │   ├── index.css            # Global styles
│   │   ├── components/
│   │   │   ├── layout/          # Header, Sidebar, Layout
│   │   │   ├── hologram/        # Holographic UI components
│   │   │   └── exercise/        # ExerciseAnimation, LivePoseTracker
│   │   ├── pages/
│   │   │   ├── landing/         # Home, About, Features
│   │   │   ├── auth/            # Login, Register, Onboarding
│   │   │   ├── dashboard/       # Main health dashboard
│   │   │   ├── exercises/       # Workout plans & tracking
│   │   │   ├── nutrition/       # Meal plans & macros
│   │   │   ├── monitoring/      # Real-time vitals monitoring
│   │   │   ├── predictions/     # AI health risk predictions
│   │   │   ├── medications/     # Medication management
│   │   │   ├── chat/            # AI multi-agent chat
│   │   │   ├── vr/              # VR Digital Twin body view
│   │   │   ├── smart/           # Symptom Checker, Drug Interactions, Health Report, Meal Planner, Journal
│   │   │   ├── profile/         # User profile & settings
│   │   │   └── admin/           # Admin dashboard
│   │   ├── services/            # API client & Socket.IO
│   │   ├── store/               # Zustand state management
│   │   ├── types/               # TypeScript type definitions
│   │   └── i18n/                # Arabic & English translations
│   └── public/                  # Static assets
│
├── sample_health_data.csv       # Sample health dataset
├── sample_health_data.json      # Sample health data (JSON)
└── sample_vitals.json           # Sample vital signs data
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ & **npm**
- **Python** 3.10+
- **MongoDB** (local or remote)
- **Ollama** (for local LLM inference) with models:
  - `glm-4.7-flash:q4_K_M` (LLM)
  - `qwen3-embedding:8b` (Embeddings)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/healix.git
cd healix
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn run:application --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000` and the API at `http://localhost:8000`.

---

## ⚙ Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=healix

# Authentication
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440

# AI / LLM
OLLAMA_BASE_URL=http://localhost:11434
LLM_MODEL=glm-4.7-flash:q4_K_M
EMBED_MODEL=qwen3-embedding:8b

# ChromaDB
CHROMA_PERSIST_DIR=./chroma_db

# CORS
CORS_ORIGINS=http://localhost:3000
```

---

## 📡 API Endpoints

All endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| **Auth** | | |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login & get JWT token |
| **User** | | |
| `GET` | `/api/user/profile` | Get user profile |
| `PUT` | `/api/user/onboarding` | Complete onboarding |
| **Vitals** | | |
| `POST` | `/api/vitals` | Upload vital signs |
| `GET` | `/api/vitals/latest` | Get latest vitals |
| `GET` | `/api/vitals/weekly-trends` | Get weekly trends |
| **Exercise** | | |
| `POST` | `/api/exercises` | Log exercise |
| `GET` | `/api/exercises/today` | Get today's exercises |
| **Nutrition** | | |
| `POST` | `/api/nutrition` | Log meal |
| `GET` | `/api/nutrition/today` | Get today's nutrition |
| **Medications** | | |
| `GET` | `/api/medications` | Get all medications |
| `POST` | `/api/medications` | Add medication |
| `PUT` | `/api/medications/:id` | Update medication status |
| **Chat** | | |
| `POST` | `/api/chat` | Send message to AI agent |
| **Predictions** | | |
| `GET` | `/api/predictions` | Get health risk predictions |
| **Smart Features** | | |
| `POST` | `/api/smart/symptoms` | AI symptom analysis |
| `POST` | `/api/smart/drug-interactions` | Drug interaction check |
| `GET` | `/api/smart/health-report` | Generate health report |
| `POST` | `/api/smart/meal-planner` | AI meal plan generation |
| `POST` | `/api/smart/journal` | Save journal entry |
| `GET` | `/api/smart/journal/insights` | Get AI journal insights |
| **Admin** | | |
| `GET` | `/api/admin/stats` | Admin dashboard stats |
| **Pose** | | |
| `POST` | `/api/pose/analyze` | Pose analysis |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `vitals_update` | Server → Client | Real-time vital signs update |
| `alert` | Server → Client | Health alert notification |
| `medication_reminder` | Server → Client | Medication reminder |
| `exercise_update` | Server → Client | Exercise session update |
| `chat_message` | Bidirectional | Chat message exchange |

---

## 🧠 AI Multi-Agent System

Healix uses a **LangChain-based multi-agent architecture** where each agent has:

1. **Dedicated System Prompt** — Domain-specific instructions and behavior rules
2. **Custom Tools** — Functions to query real MongoDB user data (vitals, nutrition, exercises, medications)
3. **RAG Knowledge Base** — ChromaDB vector store + BM25 keyword retrieval with bilingual medical knowledge
4. **User Context** — Agents receive the user's full health profile for personalized responses

### Agent Routing

Messages are automatically routed to the appropriate agent using bilingual keyword matching:

```
User: "What's my heart rate trend?"  →  🩺 Clinical Agent
User: "كم سعرة حرارية أحتاج؟"        →  🥗 Nutrition Agent
User: "Give me a chest workout"      →  💪 Exercise Agent
User: "ما هو خطر تدهور صحتي؟"        →  📊 Risk Agent
```

### Knowledge Base

The RAG system contains curated medical knowledge in both Arabic and English covering:

- **Clinical**: Heart rate, SpO2, blood pressure, HRV, stress, temperature guidelines; diabetes & hypertension exercise protocols
- **Nutrition**: Protein requirements, macro calculations, meal timing, condition-specific diets
- **Exercise**: Training science, progressive overload, exercise safety, form guidance
- **Risk**: Cardiovascular risk models, behavioral pattern analysis, preventive interventions

---

## 📸 Screenshots

> _Add screenshots of your application here_

| Dashboard | AI Chat | Exercises |
|:---------:|:-------:|:---------:|
| ![Dashboard](screenshots/dashboard.png) | ![Chat](screenshots/chat.png) | ![Exercises](screenshots/exercises.png) |

| Monitoring | Predictions | VR Digital Twin |
|:----------:|:-----------:|:---------------:|
| ![Monitoring](screenshots/monitoring.png) | ![Predictions](screenshots/predictions.png) | ![VR](screenshots/vr.png) |

---

## 📄 License

This project is developed by **DigitalMind**. All rights reserved.

---

<p align="center">
  Built with ❤️ by <strong>DigitalMind</strong>
</p>

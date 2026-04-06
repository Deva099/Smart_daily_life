# Smart Daily Life 🌟

A professional, decoupled full-stack application for managing tasks, habits, health tracking, and smart daily planning.

## 🏗️ Project Architecture

The project is structured as a modern **Decoupled Monorepo**:

```text
smart-daily-life/
├── frontend/             # React + Vite (UI Layer)
│   ├── src/
│   │   ├── components/   # Reusable UI widgets (Sidebar, Popups)
│   │   ├── pages/        # Main route views (Dashboard, Health, Tasks)
│   │   ├── services/     # API Abstraction Layer
│   │   └── context/      # React Global State
│   └── public/           # Static assets
│
└── backend/              # Node.js + Express (API Layer)
    ├── controllers/      # Business logic & request handling
    ├── models/           # Mongoose Data Schemas (MongoDB)
    ├── routes/           # REST API Route definitions
    ├── middleware/       # Safety & Auth guards
    └── services/         # Background logic (Notification Engine)
```

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ 
- **MongoDB**: Running locally on `localhost:27017`

### 2. Quick Start (Both Frontend & Backend)
From the root directory, simply run:
```bash
npm install
npm run dev
```

### 3. Independent Setup (Optional)
If you wish to run them separately:
- **Backend**: `cd backend && npm run dev`
- **Frontend**: `cd frontend && npm run dev`

## 🛠️ Features
- **Smart Health Center**: Persistent daily tracking for Water, Sleep, Steps, and Activity.
- **Dynamic Tasks & Habits**: Optimistic UI updates with MongoDB persistence.
- **Smart Notification Engine**: Background cron-jobs that trigger real-time alerts.
- **Glassmorphism UI**: High-end aesthetic with support for Dark/Light modes.
- **Performance Optimized**: Built with `React.lazy()` for fast initial loading.

## 📄 License
ISC - Built for professional workflow management.

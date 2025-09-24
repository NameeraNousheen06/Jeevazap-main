# Mini Habit Tracker MVP

A clean, minimal habit tracking application built with React, TypeScript, and Express.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Setup database:**
   ```bash
   cd server && pnpm migrate
   ```

3. **Start development:**
   ```bash
   pnpm dev
   ```

4. **Open your browser:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Prisma
- **Database:** SQLite
- **State Management:** React Query + local state
- **Testing:** Vitest + React Testing Library

## 📁 Project Structure

```
├── apps/web/          # React frontend
├── server/            # Express backend
├── prisma/           # Database schema & migrations
├── package.json      # Root workspace config
└── README.md
```

## 🎯 Features

- ✅ Create and manage habits
- ✅ Daily completion tracking
- ✅ Weekly grid view (Monday-Sunday)
- ✅ Visual progress indicators (green=done, red=not done)
- ✅ Weekly statistics and streaks
- ✅ Week navigation
- ✅ Timezone support (Asia/Kolkata)

## 🧪 Testing

```bash
# Run frontend tests
cd apps/web && pnpm test

# Run backend tests
cd server && pnpm test
```

## 📦 Production Build

```bash
# Build frontend
pnpm build

# Start production server
pnpm start
```

## 🎨 Design Principles

- **Minimal:** Focus on core habit tracking functionality
- **Fast:** Instant feedback and smooth interactions
- **Clean:** Simple, accessible UI with clear visual states
- **Reliable:** Persistent data storage with SQLite

---

Built for rapid development and demo within 2 days! 🚀
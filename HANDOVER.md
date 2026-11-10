# 📄 PoemPlay — Project Handover & Technical Documentation

Welcome to the technical handover document for **PoemPlay**. This document provides a complete guide to the architecture, data models, component structure, real-time sync mechanisms, and execution instructions for developers taking over or reviewing this project.

---

## 📌 Executive Overview

**PoemPlay** is a real-time, interactive, two-player collaborative poetry application supporting **Classic Canvas Mode** and **Glimpse Mode**. Two poets join a room via a shared link or room key and co-create verses line-by-line. The app guarantees zero dropped or overwritten lines via Firestore atomic transactions, offers 7 bespoke aesthetic themes (selectable independently per poet), inline revision proposal/approval workflows, and fine-art PDF/PNG exporting.

---

## 🏗️ Technology Stack

- **Frontend Framework**: React 19 (TypeScript)
- **Bundler & Dev Server**: Vite 8
- **Styling**: Tailwind CSS v4
- **Real-Time Database & Auth**: Google Cloud Firestore & Firebase Auth (Anonymous Sign-In)
- **Production Server**: Express (Node.js runtime for containerized deployments like Cloud Run/Docker)
- **Export Utilities**: `jspdf` & `html2canvas` for PDF and high-res PNG canvas exports
- **Animations & FX**: `motion` & `canvas-confetti`

---

## 📂 Directory Structure

```
├── README.md                     # General user overview & quickstart guide
├── HANDOVER.md                   # This developer technical handover specification
├── .env.example                  # Environment variable reference
├── firebase-applet-config.json   # Public client Firebase configuration (works out-of-the-box)
├── firebase-blueprint.json       # Database schema blueprint
├── firestore.rules               # Firestore security rules
├── package.json                  # Dependencies & scripts
├── vite.config.ts                # Vite bundler & host configuration
├── server.js / server.ts         # Production Express server (serves dist/ on $PORT)
├── public/                       # Static public assets
└── src/
    ├── main.tsx                  # React entry point
    ├── App.tsx                   # Main room state manager, Firestore listener, and navigation
    ├── index.css                 # Global CSS & Tailwind imports
    ├── types.ts                  # TypeScript interfaces (RoomData, PoemLine, PlayerProfile, etc.)
    ├── components/
    │   ├── PoemCanvas.tsx        # Main poem sheet, line rendering, poet badge tap-to-edit
    │   ├── ChatPanel.tsx         # Real-time chat & verse quote/reference drawer
    │   ├── ThemeSelector.tsx     # Independent 7-theme switcher
    │   ├── FineArtExportModal.tsx# PDF & PNG export modal with typography & border options
    │   ├── NewPoemModal.tsx      # Room creation modal
    │   └── ThemeMascots.tsx      # Decorative aesthetic mascot illustrations
    └── lib/
        ├── firebase.ts           # Firebase SDK init, atomic transactions, & helper functions
        └── themes.ts             # Theme styling constants (7 bespoke visual themes)
```

---

## 🔄 Real-Time Data Architecture & Firestore Synchronization

### 1. Atomic Line Transactions (`addLineToRoom`)
To prevent race conditions where one poet submits a line while the other is editing or reacting, new lines are submitted using Firestore's `runTransaction`:
- **File**: `src/lib/firebase.ts` -> `addLineToRoom(roomId, newLine, nextTurn)`
- **Behavior**: Reads the existing room state in a transaction lock, appends the new line, toggles the active turn (`player1` ↔ `player2`), and writes atomically.

### 2. Partial Field Updates (`updateRoomFields`)
Non-line updates (such as chat messages, reactions, title changes, theme sharing, and revision proposals) use `updateDoc` via `updateRoomFields(roomId, fields)`. This guarantees that chat/profile actions **never touches or overwrites the lines array**.

### 3. Chronological Line Merging
In `src/App.tsx` (`subscribeToRoom`), incoming lines are deduplicated by unique ID and sorted chronologically (`a.timestamp - b.timestamp`) to guarantee no line is ever lost or out of order.

---

## 🎨 Feature Highlights & Key Workflows

### 1. Tap Poet Badge to Edit
- Clicking/tapping the poet badge icon (or verse text) on any line triggers the inline revision proposal box.
- Revision proposals are broadcast in real time to the room. The co-creator receives an approval prompt on the line.

### 2. Independent Per-Poet Themes
- Themes are stored in `localStorage` per client browser (`poemplay_my_theme`), allowing Poet One to view the poem in *Midnight Noir* while Poet Two views it in *Botanical Garden*.
- Poets can also click "Share My Theme with Partner" to sync themes on demand.

### 3. Room Persistence
- Active room ID and player role are saved to `localStorage` (`poemplay_active_room_id` and `poemplay_active_player_role`). Refreshing the browser reconnects to the active room seamlessly without kicking the user.

---

## 🚀 Execution & Deployment Instructions

### Local Development
```bash
npm install
npm run dev
```
Starts Vite dev server on `http://localhost:3000`.

### Production Build & Launch
```bash
# Build static production assets into dist/
npm run build

# Start production Express server on http://localhost:8080
npm start
```

### Static Hosting (Vercel, Netlify, GitHub Pages)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## 🔐 Environment & Credentials

- **Zero Setup Required**: The repository includes `firebase-applet-config.json` committed directly, which contains public client keys for the Firestore instance.
- **Custom Databases**: To use a custom Firebase project, set environment variables (`VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_API_KEY`, etc.) as documented in `.env.example`.

---

## ✅ Quality & Build Verification

- **TypeScript Linting**: `npm run lint` (`tsc --noEmit`) passes with zero errors.
- **Production Bundle**: `npm run build` verified.

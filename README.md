# 🪶 PoemPlay — Collaborative Two-Player Rhyming Canvas

**PoemPlay** is a real-time, interactive, two-player collaborative poetry app. Two poets co-create verses line-by-line with real-time synchronization, custom aesthetic themes, line revision proposals, turn management, and high-resolution PDF/image exports.

---

## 🌟 Key Features

- **Real-Time Collaboration**: Powered by Google Cloud Firestore with atomic line transactions to guarantee zero dropped or overwritten lines.
- **7 Bespoke Themes**: Lined Notebook, Midnight Noir, Cyberpunk Neon, Vintage Parchment, Botanical Garden, Royal Velvet, and Minimalist Paper.
- **Interactive Editing & Approvals**: Tap any line or poet badge to propose revisions. Partner approves or rejects in real time.
- **Independent Themes**: Each poet can choose their own visual aesthetic without affecting their co-creator.
- **Fine-Art Exports**: Export completed poems as PDF or high-resolution PNG images.
- **Magic Link Invitations**: Share a single link to instantly invite your co-creator into the room.

---

## 🚀 Quick Start (Running Locally from GitHub)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/poemplay.git
cd poemplay
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` to start composing!

---

## 🛠️ Building & Running for Production

### Build Static Frontend Bundle
```bash
npm run build
```
This compiles the application into the `dist/` directory.

### Run Production Express Server
```bash
npm start
```
Spins up the Node.js production server on `http://localhost:8080` serving the production build.

---

## ☁️ Deployment Options

### Option A: Vercel / Netlify / GitHub Pages (Static Hosting)
Because PoemPlay is built on Vite and React with client-side Firestore integration, you can deploy the built output (`dist/`) directly to static hosting platforms:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Option B: Cloud Run / Docker / Render / Railway (Node Runtime)
PoemPlay includes a lightweight Express server (`server.js`) configured for containerized hosting:
- **Build Command**: `npm run build`
- **Start Command**: `npm start` (or `node server.js`)
- **Port**: Set via `PORT` environment variable (defaults to `8080`).

---

## ⚙️ Environment Configuration (Optional)

By default, PoemPlay connects to the pre-configured Firebase Firestore instance defined in `firebase-applet-config.json`. If you want to use your own Firebase project, create a `.env` file in the root directory:

```env
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="(default)"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
```

---

## 📜 License
MIT License. Free for open-source and personal use.

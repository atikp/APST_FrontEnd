# 📈 APST - React Stock Trader (Frontend)

Welcome to **APST (Alpha Public Stock Trader)** — a gamified, beginner-friendly React stock trading simulation app. This is the **frontend** repo built with React, Vite, TailwindCSS, ApexCharts, and Firebase.

> ⚠️ This is a simulated environment using real-world stock data. No real money or trading takes place.

---

## 🧩 Features

- 🔐 Firebase Auth: Signup/login with email + password
- 💸 Buy/Sell stocks with a £10,000 virtual portfolio
- 📊 Interactive real-time stock charts (24h, 1m, 1y, 20y)
- 📈 Watchlist + Holdings + Transaction History
- 📰 News integration + Gainers/Losers ticker
- 🌙 Dark mode + Mobile-first responsive design
- 🏆 Accolade system + login streak rewards

---

## 🚀 Tech Stack

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [ApexCharts](https://apexcharts.com/)
- [React Toastify](https://fkhadra.github.io/react-toastify/)
- [Framer Motion](https://www.framer.com/motion/)
- [Render](https://render.com/) (for backend)
- [Netlify](https://www.netlify.com/) (for frontend hosting)

---

## 🛠 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/atikp/APST_FrontEnd.git
cd APST_FrontEnd
npm install
```

### 2. Add Environment Variables

Create a `.env` file in the root (see `.env.example`):

```bash
cp .env.example .env
```

### 3. Run Dev Server

```bash
npm run dev
```

Frontend will run at `http://localhost:5173`

---

## 🌐 Deployment (Netlify)

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Environment Variables:** Add all from `.env`

---

## 🔗 Connected Services

| Service       | Used For                |
|---------------|-------------------------|
| Firebase      | Auth, Firestore backend |
| Alpha Vantage | Real-time stock data    |
| FMP           | Company profiles        |
| Finnhub       | News + Quote WebSocket  |
| Render        | Backend API proxy       |
| Netlify       | Frontend hosting        |

---

## 🧪 Backend API

This app communicates with a secure Express backend to:
	•	Proxy API requests
	•	Protect user API keys
	•	Handle Buy/Sell logic and update user portfolios via Firebase

---

## 🙌 Credits

Created with 💻 by [Atik Patel](https://github.com/atikp)

---

## 📜 License

MIT
---

### ✅ `.env.example`

```env
# Firebase config (Vite reads these at build time)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Backend API URL
VITE_API_BASE_URL=https://your-backend-api.onrender.com
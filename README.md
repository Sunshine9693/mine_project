# AURA — My Personalized AI Voice Assistant

AURA is a premium, personalized AI voice assistant designed with a calm, light-themed, iOS-inspired glassmorphic interface.

The application is structured into two completely independent service folders: `frontend` and `backend`.

---

## 1. Tech Stack

### Frontend
- **Framework**: React (Vite template)
- **Styling**: Tailwind CSS v3 (Custom palette configuration)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Router**: React Router v6
- **HTTP Client**: Axios

### Backend
- **Framework**: Express.js (Node.js)

---

## 2. Folder Structure

```text
AURA/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/          # SVG logo/favicons
│   │   ├── components/      # GlassCard, VoiceOrb, VoiceControls, ChatInput, etc.
│   │   ├── pages/           # Landing, Dashboard, Assistant, Placeholder
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── context/
│   │   ├── utils/
│   │   ├── App.jsx          # Routing & Layout frame
│   │   ├── main.jsx         # App bootstrap entry point
│   │   └── index.css        # Tailwind config, glass classes & orb keyframes
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js            # Express application code
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## 3. Installation & Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Step 1: Install Dependencies

#### Backend Setup:
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

#### Frontend Setup:
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## 4. Running the Application

### Backend
From the `backend` folder, run the Express server:
```bash
npm run dev
```
The server will run on `http://localhost:5000` by default. You can verify that the health check works by visiting `http://localhost:5000/api/health`.

### Frontend
From the `frontend` folder, start the Vite development server:
```bash
npm run dev
```
The client dashboard will load on `http://localhost:5173`.

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

## Phase 4 configuration

Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI`, `JWT_SECRET`, and `AI_API_KEY`. `AI_API_URL` is an OpenAI-compatible chat-completions endpoint and defaults to OpenAI when omitted; `AI_MODEL` selects the provider model. These values stay server-side and are never sent to React.

Phase 4 adds authenticated `POST /api/ai/chat` plus conversation persistence under `/api/conversations` and memory CRUD under `/api/memory`. Memory commands such as `Remember that I prefer concise answers`, `Forget that I prefer concise answers`, and `What do you remember about me?` are handled by the backend before a normal chat is sent to the provider.

Run backend checks with `npm test` from `backend`, and build/lint the frontend with `npm run build` and `npm run lint` from `frontend`.

## 🚀 Phase 5 — Productivity Features

Phase 5 enhances **AURA** with personal productivity capabilities, allowing users to manage tasks, notes, reminders, and conversations using natural-language and voice commands.

### ✨ Features

* 📝 **Notes** — Create and manage notes using natural language.
* ✅ **Tasks** — Create and manage daily productivity tasks.
* ⏰ **Reminders** — Set reminders with date and time information.
* 💬 **Conversations** — View previous assistant conversations.
* 🧠 **Intent Detection** — Understands task, note, and reminder commands.
* 🕐 **Timezone Support** — Improved date and time processing.
* 🎙️ **Voice Integration** — Productivity features work with AURA's voice interface.

### 🧪 Testing

Phase 5 includes automated tests for productivity intent detection and detail parsing.

```text
Tests: 4
Passed: 4
Failed: 0
Status: ✅ All Tests Passed
```

### 🛠️ Key Technologies

**Frontend:** React.js
**Backend:** Node.js + Express.js
**Database:** MongoDB
**AI:** Gemini / AI Provider
**Testing:** Node.js Test Runner

### ✅ Phase 5 Status

**Completed and successfully pushed to GitHub.** 🚀

Commit: `3b5df0b`

## 🚀 Phase 6 — Smart Weather & Utility Features

Phase 6 enhances **AURA** with smart utility capabilities, allowing users to get real-time weather information and interact with weather-related features using natural-language and voice commands.

### ✨ Features

* 🌤️ **Weather Information** — Get current weather conditions for a requested location.
* 🌡️ **Temperature Details** — Provides current temperature information along with weather conditions.
* 💧 **Weather Details** — Displays useful information such as humidity and other available weather parameters.
* 📍 **Location-Based Weather** — Fetch weather information for different cities and locations.
* 🗣️ **Natural Language Support** — Understands weather-related user queries naturally.
* 🎙️ **Voice Integration** — Weather requests can be made through AURA's voice interface.
* 🔄 **Real-Time Data** — Retrieves updated weather information through a weather API.
* ⚠️ **Error Handling** — Handles invalid locations, missing information, and API-related errors gracefully.

### 🧪 Testing

Phase 6 includes testing for weather-related queries, location handling, API responses, and error cases.

```text
Tests: Completed
Passed: All Implemented Tests
Failed: 0
Status: ✅ All Tests Passed
```

### 🛠️ Key Technologies

**Frontend:** React.js
**Backend:** Node.js + Express.js
**Database:** MongoDB
**AI:** Gemini / AI Provider
**Weather API:** Weather API Integration
**Testing:** Node.js Test Runner

### 🔄 Example Queries

Users can interact with AURA using natural language:

```text
"What is the weather in Hyderabad?"
"Tell me today's weather in Delhi."
"What's the temperature in Mumbai?"
"How is the weather in Patna?"
```

AURA processes the request, identifies the location, retrieves the latest weather information, and presents the result to the user.

### ✅ Phase 6 Status

**Completed and successfully implemented.** 🌤️🚀

## Latest Updates — AURA

### Phase 6: Smart Utilities & Improvements

* Added **Unit Converter** service for common unit conversions.
* Improved **Weather** service and global location support.
* Enhanced **AI intent detection and action routing**.
* Improved **authentication controller and authentication tests**.
* Added and updated **Phase 6 test cases**.
* Improved **voice recognition** and speech recognition testing.
* Updated backend server and AI controller integration.

### Testing

Added/updated automated tests for:

* Authentication
* Phase 6 utilities
* Speech recognition

AURA continues to evolve toward a more intelligent, reliable, and feature-rich personal AI assistant.




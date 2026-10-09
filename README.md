# AURA

AURA is a personalized AI voice assistant for productivity, memory, notes, tasks, reminders, and contextual conversations. The project keeps a single user-scoped architecture: a React + Vite frontend, an Express + MongoDB backend, and a secure JWT session model for authenticated user data.

## Project overview

AURA combines:
- conversational AI
- voice-first interaction
- personal memory and profile settings
- notes, tasks, reminders, and dashboard analytics
- utility tools such as weather, calculator, translation, and search
- user-isolated data and OAuth-like session-based authentication via cookies and JWT

## Feature list

- Personalized assistant profile and settings
- Voice interaction and speech recognition support
- AI-powered conversations with memory-aware prompts
- Notes, tasks, and reminders management
- Productivity dashboard and analytics
- User-specific activity and privacy summary views
- Weather, search, translation, and utility integrations
- Secure JWT auth with HTTP-only cookies

## Technology stack

### Frontend
- React 19
- Vite
- React Router
- Axios
- Framer Motion
- Lucide icons
- Tailwind CSS styling

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Helmet, CORS, rate limiting
- Gemini AI integration

## Architecture

- Frontend deploys separately from backend on Vercel or another static hosting provider.
- Backend runs as a Node.js service on Render or a comparable provider.
- MongoDB Atlas stores user and app data.
- The frontend uses a Vite API base environment variable; the backend reads environment variables server-side.
- All sensitive keys remain in backend environment configuration and are never exposed to the browser bundle.

## Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas account or a local MongoDB instance
- Vercel account for frontend deployment
- Render or another Node.js hosting provider for backend deployment
- AI and utility provider API keys where needed

## Local development

### 1) Install dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

### 2) Configure environment variables

Copy the example files and fill in the required values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Use placeholders only; never commit actual secrets.

### 3) Start backend

```bash
cd backend
npm run dev
```

The app defaults to port 5002 in local development to avoid shared-port conflicts with other local services.

### 4) Start frontend

```bash
cd frontend
npm run dev
```

The frontend should use the configured `VITE_API_BASE_URL` and default to `http://localhost:5002/api` for local development.

## Environment variables

### Backend (`backend/.env`)

Required or commonly used variables include:

```env
PORT=5002
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/aura
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-3.5-flash-lite
WEATHER_API_KEY=
DEFAULT_WEATHER_CITY=Hyderabad
SEARCH_API_KEY=
SEARCH_API_URL=
TRANSLATION_API_URL=
TRANSLATION_API_KEY=
APP_TIMEZONE=Asia/Kolkata
```

Notes:
- `PORT` is the Express listening port for backend hosting.
- `MONGO_URI` must point to a MongoDB Atlas cluster or a reachable local MongoDB instance.
- `JWT_SECRET` must be set in production and should never be exposed to the frontend.
- `CLIENT_URL` is used for CORS allowlist configuration and should be set to the deployed frontend domain in production.
- Gemini and utility provider credentials remain backend-only.

### Frontend (`frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5002/api
```

For production deployments, set the same variable to the deployed backend URL, for example:
```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com/api
```

## Production readiness summary

### Frontend production setup

- The frontend is Vite-based and builds successfully with `npm run build`.
- API configuration now uses `VITE_API_BASE_URL` with a local fallback for development.
- SPA fallback is included via `frontend/vercel.json` to support direct navigation on routes such as `/dashboard`, `/settings`, and `/utilities`.
- Hardcoded localhost API URLs are not used in runtime app code.

### Backend production setup

- The backend uses `process.env.PORT` and defaults to `5001` only for local development.
- CORS allows configured frontend origins while keeping development localhost access available.
- Cookies are still used for auth, so credentials remain enabled for same-site or cross-site setups when the deployment type supports them.
- The middleware now fails safely when `JWT_SECRET` is missing instead of silently using a weak fallback value.
- The public `/api/health` endpoint remains available without authentication.

## Deployment instructions

### A. MongoDB Atlas configuration

1. Create or locate the MongoDB Atlas cluster used by AURA.
2. Add the backend host IP address to the Atlas network access list.
3. Create a MongoDB user with the minimum required privileges for the application database.
4. Copy the connection string into `MONGO_URI` in the backend environment.
5. Verify that the app can connect to the cluster before publishing the frontend.

Important: do not hardcode credentials in source files or docs. Keep them in the host environment only.

### B. Backend deployment (Render or a similar Node.js host)

1. Create a new Node.js web service.
2. Point it to the backend project folder.
3. Set the runtime environment variables listed above.
4. Configure the build/start command to run the backend:
   ```bash
   npm install
   npm start
   ```
5. Set the backend port to the value provided by the host via `PORT`.
6. Check the application health route:
   ```text
   https://your-backend-url.example/api/health
   ```

### C. Frontend deployment (Vercel)

1. Import the frontend project into Vercel.
2. Set the build command to:
   ```bash
   npm install
   npm run build
   ```
3. Set the output directory to `dist`.
4. Add the environment variable:
   ```env
   VITE_API_BASE_URL=https://your-backend-url.example/api
   ```
5. Deploy and confirm route navigation works.

### D. Production environment variables

Set the following in the backend host:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- optional utility keys as needed

Set the following in the frontend host:
- `VITE_API_BASE_URL`

### E. CORS and authentication cookie configuration

For same-origin or same-site deployment, standard cookie settings are typically sufficient. If the frontend and backend are on different domains, confirm cookie behavior with browser requirements (typically `SameSite=None; Secure` for cross-site cookies). The app should not be changed to a different auth model unless this is necessary and clearly justified.

### F. Post-deployment smoke tests

1. Confirm `/api/health` responds successfully.
2. Try registration and login with a real user.
3. Confirm the auth cookie is set and the app restores the user session after refresh.
4. Open the dashboard and a protected route to verify navigation works.
5. Confirm analytics/profile APIs work for authenticated users only.
6. Validate AI and utility features only where the required providers are configured.

## Security notes

- Keep `.env` and other secret files out of Git.
- Do not commit real keys or credentials.
- Never expose JWT secrets in client code or frontend bundles.
- Use environment variables for all provider keys.
- Keep CORS limited to the deployed frontend origin.
- Use HTTPS in production and secure cookies when cross-site auth is required.
- Fail safely when services are not configured.

## Testing

The repository supports the following checks:

```bash
cd backend
npm test
```

```bash
cd frontend
npm run build
```

This project was also checked for frontend build health and backend auth service behavior.

## Known limitations

- Live production deployment has not been performed in this environment.
- Some external AI and utility providers require API keys that are not present in the local environment.
- MongoDB Atlas connectivity must be confirmed in the actual hosting environment.
- Browser speech features may require HTTPS or localhost to work reliably.

## Deployment checklist

- [x] Frontend build validated locally
- [x] Backend auth safety checks validated
- [x] Vite API configuration updated to use environment variables
- [x] SPA fallback added for Vercel
- [x] Secure JWT secret handling tightened
- [x] Public health endpoint kept available
- [ ] Production MongoDB Atlas credentials configured in host environment
- [ ] Deployed backend service URL configured in Vercel
- [ ] Live deployment performed by the user after explicit authorization

## Final status

This repository is prepared for production deployment work, but it has not been published yet. The codebase remains preserved and operational, while the real deployment and live provider configuration steps are still required outside this environment.


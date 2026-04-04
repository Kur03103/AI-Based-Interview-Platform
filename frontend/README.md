# 💻 AI Interview Platform Frontend (React)

The frontend for the AI Interview Platform is a high-performance Single Page Application (SPA) built with **React 18** and **Tailwind CSS**. It provides a glassmorphic dashboard for candidates to manage their resumes, participate in AI-driven audio interviews, and view their performance reports.

---

## 🎨 UI/UX Design
The application follows a modern **Glassmorphism** design language with:
-   **Vibrant Gradients**: Indigo, Purple, and Green accent colors for different interview states.
-   **Dark/Light Mode**: Full theme switching using a custom `ThemeContext` and Tailwind's `dark` variant.
-   **Responsive Layout**: Fully functional on desktop, tablet, and mobile browsers.

---

## ⚙️ Key Frontend Architectures

### 1. Authentication Lifecycle
Managed through `src/context/AuthContext.js`:
-   **JWT Storage**: Access and refresh tokens are stored in `localStorage`.
-   **Token Interceptor**: Custom `axios` instance (`src/api/axios.js`) automatically attaches headers and handles 401 unauthorized retries.
-   **Google OAuth Callback**: Handled at `src/pages/AuthCallback.jsx` to secure tokens from the backend redirect.

### 2. Audio Pipeline
-   **Mic Recording**: Captures user audio blobs and posts them to the `/api/auth/google/callback/stt/` (or equivalent) endpoint.
-   **Audio Feedback Loop**: 
    -   Displays transcription in real-time.
    -   Triggers a state transition to "Thinking" mode when user stops speaking.
    -   Synthesizes the AI text response using the browser's `SpeechSynthesis` API.

### 3. State-Driven Dashboards
-   **Interview Stats**: Visual representation of scores from `src/pages/Dashboard.jsx`.
-   **Interview History**: Dynamic lists and detailed views of past performance data.
-   **ATS Tracking**: Resume upload and real-time analysis display.

---

## 🏗️ Folder Structure
-   `/src/api`: Axios instance and common service calls.
-   `/src/components`: UI components (Navbar, Sidebar, ProtectedRoute, etc.).
-   `/src/context`: Authentication and Theme state providers.
-   `/src/pages`: Main page entry points (Dashboard, Login, Register, Interview, etc.).
-   `/src/sections`: Complex logical sections (Resume uploaders, analysis charts).

---

## 🚀 Setting Up Locally

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` in the `frontend/` directory (optional if using default backend proxy):
    ```env
    REACT_APP_API_URL=http://localhost:8000
    ```

3.  **Run Development Server**:
    ```bash
    npm start
    ```

---

## 🛡️ Protected Routes
Access to the dashboard and interview pages is guarded by `src/components/ProtectedRoute.jsx`. Any unauthorized attempt to access these routes will gracefully redirect the user back to the `/login` screen.

---

## 📝 Scripts
-   `npm start`: Runs the app in development mode.
-   `npm run build`: Minifies the assets for production deployment.
-   `npm test`: Launches the test runner.

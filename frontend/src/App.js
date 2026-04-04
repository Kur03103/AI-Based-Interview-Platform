import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";

import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Interview from "./pages/Interview";
import InterviewHistory from "./pages/InterviewHistory";
import ResumeHistory from "./pages/ResumeHistory";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<Landing />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />


            {/* Protected Routes - requires authentication */}
            <Route element={<ProtectedRoute />}> 
              <Route path="/home" element={<Dashboard />} />
              <Route path="/interview" element={<Interview />} />
              <Route path="/interview-history" element={<InterviewHistory />} />
              <Route path="/resume-history" element={<ResumeHistory />} />
            </Route>

            {/* Admin only route */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin" element={<AdminPanel />} />
            </Route>

            {/* Fallback route: redirect unknown URLs to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

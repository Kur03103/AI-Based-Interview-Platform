import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoginHelper from "../components/Login";
import ThemeToggle from "../components/ThemeToggle";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (username, password) => {
    await login(username, password);
    // after a successful login redirect to the protected dashboard (home)
    // you can change this to "/landing" if you want the public landing page instead
    navigate("/home");
  };

  const handleSwitchToSignup = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center flex-1">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
              Enter your credentials below to access your dashboard.
            </p>
          </div>
          <ThemeToggle />
        </div>
        <LoginHelper
          onLogin={handleLogin}
          onSwitchToSignup={handleSwitchToSignup}
        />
      </div>
    </div>
  );
};

export default Login;

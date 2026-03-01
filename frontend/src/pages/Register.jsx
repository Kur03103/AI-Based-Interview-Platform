import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SignupHelper from "../components/Signup";
import ThemeToggle from "../components/ThemeToggle";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (userData) => {
    // userData contains confirm_password as well, which backend might reject if not in serializer
    // But our context/serializer handles it.
    await register(userData);
    navigate("/login");
  };

  const handleSwitchToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Join Interview Bloom today
          </p>
        </div>
        <SignupHelper
          onSignup={handleSignup}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </div>
    </div>
  );
};

export default Register;

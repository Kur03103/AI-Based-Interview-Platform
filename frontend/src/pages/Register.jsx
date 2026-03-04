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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-2xl w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="text-center flex-1">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white">
              Create your account
            </h2>
            <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
              Start your journey with Interview Bloom – it only takes a minute.
            </p>
          </div>
          <ThemeToggle />
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

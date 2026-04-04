import React, { useState, forwardRef } from "react";
import { useAuth } from "../context/AuthContext";

const Login = forwardRef(({ onLogin, onSwitchToSignup }, ref) => {
    const { forgotPassword } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await onLogin(username, password);
    } catch (err) {
      // Error handling is done in parent or here?
      // If onLogin throws, we catch it.
      // But onLogin from useAuth (via parent) likely throws.
      console.error("Login error", err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        // Flatten detail or message or non_field_errors
        const msg = data.detail || data.message || JSON.stringify(data);
        setError(msg);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Invalid username or password.");
      }
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend endpoint using 127.0.0.1 as requested
    window.location.href = "http://127.0.0.1:8000/accounts/google/login/";
  };


  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!username) {
        setError("Please enter your email/username first.");
        return;
    }
    setError("");
    try {
        const response = await forgotPassword(username);
        alert(response.message || "Password reset instructions sent.");
    } catch (err) {
        if (err.response && err.response.data && err.response.data.auth_provider === 'google') {
            setError("You signed up using Google. Please login with Google instead.");
        } else {
            setError(err.response?.data?.error || "Failed to process forgot password.");
        }
    }
  };

  return (
    <form ref={ref} onSubmit={handleLogin} className="space-y-6 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md mx-auto">
      <div>
        <label
          htmlFor="login-username"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Username
        </label>
        <input
          id="login-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition duration-300 shadow-sm hover:shadow-md"
        />
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Password
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition duration-300 shadow-sm hover:shadow-md"
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            {error}
          </p>
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition transform hover:scale-105 duration-200 shadow-lg hover:shadow-2xl focus:ring-4 focus:ring-indigo-200"
      >
        Sign In
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white font-semibold py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-200 shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.25.81-.59z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
          />
        </svg>
        Continue with Google
      </button>


      <div className="flex flex-col space-y-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-xs text-right text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition duration-200"
        >
          Forgot password?
        </button>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition duration-200"
          >
            Sign up for free
          </button>
        </div>
      </div>
    </form>
  );
});

Login.displayName = "Login";
export default Login;

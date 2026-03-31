import React, { useState, forwardRef } from "react";

const Login = forwardRef(({ onLogin, onSwitchToSignup }, ref) => {
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

      <div className="flex flex-col space-y-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            alert("Password reset functionality is being set up. Please contact your administrator if you've lost access.");
          }}
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

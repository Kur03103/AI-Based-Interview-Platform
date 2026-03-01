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
    <form ref={ref} onSubmit={handleLogin} className="space-y-5">
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
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition duration-200 hover:border-gray-400 dark:hover:border-gray-500"
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
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition duration-200 hover:border-gray-400 dark:hover:border-gray-500"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105 duration-200 shadow-lg hover:shadow-xl"
      >
        Sign In
      </button>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={(e) => e.preventDefault()}
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Forgot password?
        </button>
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          Create account
        </button>
      </div>
    </form>
  );
});

Login.displayName = "Login";
export default Login;

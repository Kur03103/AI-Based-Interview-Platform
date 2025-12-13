import React, { useState, forwardRef } from 'react';

const Login = forwardRef(({ onLogin, onSwitchToSignup }, ref) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    // Hardcoded validation
    if (username === 'user' && password === 'user123') {
      onLogin(username);
    } else {
      setError('Invalid username or password. Try: user / user123');
    }
  };

  return (
    <form ref={ref} onSubmit={handleLogin} className="space-y-5">
      <div>
        <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-2">
          Username
        </label>
        <input
          id="login-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 hover:border-gray-400"
        />
      </div>

      <div>
        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 hover:border-gray-400"
        />
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

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
          className="text-indigo-600 hover:underline"
        >
          Forgot password?
        </button>
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-indigo-600 hover:underline font-medium"
        >
          Create account
        </button>
      </div>
    </form>
  );
});

Login.displayName = 'Login';
export default Login;

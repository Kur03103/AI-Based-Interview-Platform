import React from "react";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

const Home = () => {
  const { auth, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <nav className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                Interview Bloom
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 dark:text-gray-300">
                Welcome, {auth.user?.username}
              </span>
              <ThemeToggle />
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Dashboard
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You have successfully logged in! This is a protected route.
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-300 dark:border-gray-600 transition-colors duration-300">
            <h3 className="text-lg font-medium text-indigo-600 dark:text-indigo-300 mb-2">
              User Details:
            </h3>
            <pre className="text-sm text-gray-800 dark:text-gray-400 overflow-x-auto">
              {JSON.stringify(auth.user, null, 2)}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;

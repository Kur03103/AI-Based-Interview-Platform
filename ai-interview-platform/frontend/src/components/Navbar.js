import React, { useState } from 'react';

function Avatar({ name }) {
  const initials = name
    ? name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
      {initials}
    </div>
  );
}

export default function Navbar({ userName, onSignOut }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            InterviewBloom
          </div>
          <div className="text-xs text-gray-500 font-medium">AI Platform</div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:block text-gray-700 font-medium">
            Welcome, <span className="text-indigo-600">{userName}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition duration-200"
            >
              <Avatar name={userName} />
              <span className="text-gray-700 font-medium hidden md:inline">{userName}</span>
              <svg
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  showDropdown ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 animate-slide-down">
                <button
                  onClick={() => {
                    onSignOut();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition duration-200 font-medium"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

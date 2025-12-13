import React, { useState, Suspense } from 'react';
import { Transition } from '@headlessui/react';
import Login from './components/Login';
import Signup from './components/Signup';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './sections/Dashboard';
import StartInterview from './sections/StartInterview';
import Proposal from './sections/Proposal';
import About from './sections/About';

export default function App() {
  // Auth states
  const [view, setView] = useState('auth'); // 'auth' | 'loading' | 'dashboard'
  const [isSignup, setIsSignup] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Users store
  const [users, setUsers] = useState([
    { username: 'user', email: 'user@example.com', password: 'user123', name: 'User' }
  ]);

  // Handle Login
  const handleLogin = (username) => {
    setView('loading');
    setTimeout(() => {
      const user = users.find(u => u.username === username);
      setCurrentUser(user || { username, name: username });
      setView('dashboard');
    }, 1500);
  };

  // Handle Signup
  const handleSignup = (username) => {
    setView('loading');
    setTimeout(() => {
      const user = users.find(u => u.username === username);
      setCurrentUser(user);
      setView('dashboard');
    }, 1500);
  };

  // Handle Sign Out
  const handleSignOut = () => {
    setCurrentUser(null);
    setIsSignup(false);
    setActiveSection('dashboard');
    setView('auth');
  };

  // Switch to signup
  const handleSwitchToSignup = () => {
    setIsSignup(true);
  };

  // Switch to login
  const handleSwitchToLogin = () => {
    setIsSignup(false);
  };

  // Render Auth View
  const renderAuthView = () => (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left Section */}
      <div className="md:w-2/5 w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center p-8 md:p-16">
        <div className="max-w-md text-center space-y-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
              Welcome to AI
            </h1>
            <p className="text-lg md:text-xl text-gray-300">
              Real-Time Interview & Skill Evaluation Platform
            </p>
          </div>

          {/* Decorative SVG */}
          <svg className="w-32 h-32 mx-auto opacity-20 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5a4 4 0 100-8 4 4 0 000 8z" />
          </svg>
        </div>
      </div>

      {/* Right Section */}
      <div className="md:w-3/5 w-full flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {isSignup ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600 mt-2">
                {isSignup ? 'Join us and start your AI interview journey' : 'Sign in to continue'}
              </p>
            </div>

            {/* Forms */}
            <Transition
              show={!isSignup}
              enter="transition ease-out duration-300"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-4"
            >
              <Login onLogin={handleLogin} onSwitchToSignup={handleSwitchToSignup} />
            </Transition>

            <Transition
              show={isSignup}
              enter="transition ease-out duration-300"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 -translate-y-4"
            >
              <Signup
                onSignup={handleSignup}
                onSwitchToLogin={handleSwitchToLogin}
                users={users}
                setUsers={setUsers}
              />
            </Transition>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-600 text-sm mt-6">
            © 2025 InterviewBloom. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );

  // Render Loading View
  const renderLoadingView = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Logging you in...</h2>
          <p className="text-gray-600 mt-2">Preparing your dashboard</p>
        </div>
      </div>
    </div>
  );

  // Render Dashboard View
  const renderDashboardView = () => (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={currentUser?.name} onSignOut={handleSignOut} />

      <div className="flex">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

        {/* Main Content */}
        <main className="flex-1 md:ml-64 p-6 md:p-10">
          <Transition
            show={activeSection === 'dashboard'}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div>
              <Dashboard userName={currentUser?.name} setActiveSection={setActiveSection} />
            </div>
          </Transition>

          <Transition
            show={activeSection === 'interview'}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div>
              <StartInterview />
            </div>
          </Transition>

          <Transition
            show={activeSection === 'proposal'}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div>
              <Proposal />
            </div>
          </Transition>

          <Transition
            show={activeSection === 'about'}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div>
              <About />
            </div>
          </Transition>
        </main>
      </div>
    </div>
  );

  return (
    <>
      {view === 'auth' && renderAuthView()}
      {view === 'loading' && renderLoadingView()}
      {view === 'dashboard' && renderDashboardView()}
    </>
  );
}

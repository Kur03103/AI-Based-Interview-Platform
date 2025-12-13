import React, { useState, useEffect } from 'react';

export default function Dashboard({ userName, setActiveSection }) {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    // Stagger animation on load
    const timer = setTimeout(() => {
      setCards([
        {
          id: 1,
          title: 'Start AI Interview',
          description: 'Begin a real-time AI-assisted interview with instant scoring and feedback.',
          icon: '🎯',
          color: 'from-blue-500 to-cyan-500',
          action: 'Start Interview',
          onClick: () => setActiveSection('interview'),
        },
        {
          id: 2,
          title: 'View My Proposal',
          description: 'Review your personalized talent assessment proposal with detailed insights.',
          icon: '📄',
          color: 'from-purple-500 to-pink-500',
          action: 'View Proposal',
          onClick: () => setActiveSection('proposal'),
        },
        {
          id: 3,
          title: 'Learn About Platform',
          description: 'Discover how our AI-powered platform revolutionizes interview and skill evaluation.',
          icon: 'ℹ️',
          color: 'from-green-500 to-emerald-500',
          action: 'Learn More',
          onClick: () => setActiveSection('about'),
        },
      ]);
    }, 200);
    return () => clearTimeout(timer);
  }, [setActiveSection]);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="animate-fadeIn">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
          Welcome back, <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{userName}</span> 👋
        </h1>
        <p className="text-gray-600 text-lg">AI-Powered Real-Time Interview & Skill Evaluation Platform</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <div
            key={card.id}
            className="animate-fadeIn"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div 
              className="h-full bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={card.onClick}
            >
              {/* Gradient top bar */}
              <div className={`h-1 bg-gradient-to-r ${card.color}`}></div>

              {/* Card Content */}
              <div className="p-6">
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm mb-6">{card.description}</p>

                <button
                  onClick={card.onClick}
                  className={`w-full bg-gradient-to-r ${card.color} text-white font-semibold py-2 rounded-lg transition transform hover:scale-105 duration-200 shadow-md hover:shadow-lg`}
                >
                  {card.action}
                </button>
              </div>

              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="animate-fadeIn" style={{ animationDelay: '300ms' }}>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Performance</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">0</p>
              <p className="text-gray-600 text-sm">Interviews Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-gray-600 text-sm">Avg Score</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-pink-600">0</p>
              <p className="text-gray-600 text-sm">Skills Assessed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

export default function StartInterview() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`space-y-6 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Start AI Interview</h1>
      <p className="text-gray-600 text-lg">Begin a real-time AI-powered interview session</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interview Setup Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="text-5xl mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Interview</h2>
          <p className="text-gray-600 mb-6">Test coding skills, algorithms, and system design with AI evaluation.</p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-2 text-gray-700">
              <span className="text-green-500">✓</span>
              <span>Real-time feedback</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <span className="text-green-500">✓</span>
              <span>Instant scoring</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <span className="text-green-500">✓</span>
              <span>Detailed report</span>
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105 duration-200 shadow-lg">
            Start Technical
          </button>
        </div>

        {/* Behavioral Interview Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="text-5xl mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Behavioral Interview</h2>
          <p className="text-gray-600 mb-6">Assess soft skills, communication, and problem-solving abilities.</p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-2 text-gray-700">
              <span className="text-green-500">✓</span>
              <span>AI analysis</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <span className="text-green-500">✓</span>
              <span>Skill matching</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <span className="text-green-500">✓</span>
              <span>Recommendations</span>
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105 duration-200 shadow-lg">
            Start Behavioral
          </button>
        </div>
      </div>

      {/* Interview Guidelines */}
      <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2"> Before You Start</h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• Find a quiet environment with good lighting</li>
          <li>• Ensure your microphone and camera are working</li>
          <li>• Have a notepad ready for notes</li>
          <li>• Allow 30-60 minutes for the interview</li>
        </ul>
      </div>
    </div>
  );
}

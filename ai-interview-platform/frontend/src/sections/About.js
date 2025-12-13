import React, { useState, useEffect } from 'react';

export default function About() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`space-y-8 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">About InterviewBloom</h1>
        <p className="text-gray-600 text-lg">Revolutionizing talent assessment through AI</p>
      </div>

      {/* Main Story */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          InterviewBloom is an AI-powered platform designed to transform how companies evaluate talent and how candidates showcase their skills. We believe that great talent assessment should be fair, efficient, and insightful.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Using cutting-edge artificial intelligence and machine learning, we provide real-time interviews with instant scoring, personalized feedback, and actionable insights for both candidates and employers.
        </p>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Why Choose InterviewBloom?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: '⚡',
              title: 'Real-Time Evaluation',
              description: 'Get instant feedback and scoring as you progress through the interview.',
            },
            {
              icon: '🤖',
              title: 'AI-Powered Analysis',
              description: 'Advanced algorithms analyze your responses for comprehensive skill assessment.',
            },
            {
              icon: '📊',
              title: 'Detailed Reports',
              description: 'Receive comprehensive reports with insights and recommendations for growth.',
            },
            {
              icon: '🌍',
              title: 'Accessible Anywhere',
              description: 'Interview from anywhere, anytime. No special setup required.',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Create Account', desc: 'Sign up in seconds with your email' },
            { step: '2', title: 'Select Interview Type', desc: 'Choose technical or behavioral interview' },
            { step: '3', title: 'Begin Interview', desc: 'Answer AI-generated questions in real-time' },
            { step: '4', title: 'Receive Report', desc: 'Get detailed assessment and recommendations' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                {item.step}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{item.title}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <p className="text-4xl font-bold text-indigo-600">10K+</p>
          <p className="text-gray-600 mt-2">Users Interviewed</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-purple-600">95%</p>
          <p className="text-gray-600 mt-2">Satisfaction Rate</p>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold text-pink-600">50+</p>
          <p className="text-gray-600 mt-2">Companies Partnered</p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Your Interview?</h2>
        <p className="mb-6 text-indigo-100">Join thousands of candidates who are transforming their careers with InterviewBloom.</p>
        <button className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition transform hover:scale-105 duration-200">
          Begin Now
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';

export default function Proposal() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`space-y-6 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">My Proposal</h1>
      <p className="text-gray-600 text-lg">Personalized talent assessment and recommendations</p>

      {/* Proposal Overview */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="text-5xl"></div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Talent Assessment Report</h2>
            <p className="text-gray-600">Generated on December 13, 2025</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="space-y-6">
            {/* Skills Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Core Skills Assessment</h3>
              <div className="space-y-3">
                {[
                  { skill: 'Technical Skills', score: 85 },
                  { skill: 'Communication', score: 78 },
                  { skill: 'Problem Solving', score: 92 },
                  { skill: 'Teamwork', score: 88 },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">{item.skill}</span>
                    <div className="w-64 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-500"
                        style={{
                          width: isLoaded ? `${item.score}%` : '0%',
                        }}
                      ></div>
                    </div>
                    <span className="text-indigo-600 font-bold ml-4">{item.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <h3 className="text-lg font-bold text-green-900 mb-4">🎯 Recommendations</h3>
              <ul className="space-y-2 text-green-800">
                <li>• Focus on advanced system design patterns</li>
                <li>• Enhance cross-team collaboration skills through mentoring</li>
                <li>• Explore leadership development programs</li>
                <li>• Consider specialized technical certifications</li>
              </ul>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-4">📋 Next Steps</h3>
              <ul className="space-y-2 text-blue-800">
                <li>1. Schedule a follow-up interview to discuss results</li>
                <li>2. Create a personalized development plan</li>
                <li>3. Enroll in recommended skill-building courses</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105 duration-200">
             Download Report
          </button>
          <button className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105 duration-200">
             Share with Employer
          </button>
        </div>
      </div>
    </div>
  );
}

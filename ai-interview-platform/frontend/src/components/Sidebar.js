import React from 'react';

export default function Sidebar({ activeSection, setActiveSection }) {
  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: '' },
    { id: 'interview', label: 'Start Interview', icon: '' },
    { id: 'proposal', label: 'My Proposal', icon: '' },
    { id: 'about', label: 'About', icon: '' },
  ];

  return (
    <aside className="hidden md:fixed md:left-0 md:top-16 md:w-64 md:h-[calc(100vh-64px)] md:bg-gradient-to-b md:from-gray-900 md:to-gray-800 md:text-white md:shadow-xl md:flex md:flex-col md:p-6">
      <nav className="space-y-2 flex-1">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition duration-200 flex items-center space-x-3 ${
              activeSection === section.id
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <span className="text-xl">{section.icon}</span>
            <span>{section.label}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-gray-700 pt-4 text-gray-400 text-xs">
        <p className="text-center">© 2025 InterviewBloom</p>
      </div>
    </aside>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Dashboard = () => {
    const { auth, logout } = useAuth();
    const [activeSection, setActiveSection] = useState('dashboard');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar userName={auth.user?.username || 'User'} onSignOut={logout} />

            <div className="flex flex-1 pt-0 md:pt-0">
                <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

                <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
                    {/* Content Area */}
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeSection}</h1>
                            <p className="text-gray-600 mt-1">Welcome back to your dashboard.</p>
                        </div>

                        {/* Render content based on activeSection */}
                        {activeSection === 'dashboard' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="font-semibold text-gray-800 mb-2">My Profile</h3>
                                    <div className="text-sm text-gray-600">
                                        <p>Username: {auth.user?.username}</p>
                                        <p>Email: {auth.user?.email}</p>
                                    </div>
                                </div>
                                {/* Placeholders for other dashboard widgets */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="font-semibold text-gray-800 mb-2">Recent Interviews</h3>
                                    <p className="text-sm text-gray-500">No interviews yet.</p>
                                </div>
                            </div>
                        )}

                        {activeSection !== 'dashboard' && (
                            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                                Content for {activeSection} section coming soon.
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;

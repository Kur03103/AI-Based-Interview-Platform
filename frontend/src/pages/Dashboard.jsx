import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import DashboardHome from '../sections/Dashboard';
import StartInterview from '../sections/StartInterview';
import Proposal from '../sections/Proposal';
import About from '../sections/About';
import ResumeUpload from '../components/ResumeUpload';

import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('dashboard');

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard':
                return <DashboardHome userName={auth.user?.username || 'User'} setActiveSection={setActiveSection} />;
            case 'interview':
                return <StartInterview />;
            case 'proposal':
                return <Proposal />;
            case 'about':
                return <About />;
            case 'resume':
                return <ResumeUpload />;
            default:
                return (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                        Content not found.
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar userName={auth.user?.username || 'User'} onSignOut={handleLogout} />

            <div className="flex flex-1 pt-0 md:pt-0">
                <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

                <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;

import React from 'react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { auth, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100">
            <nav className="bg-gray-800 shadow-lg border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-indigo-400">Interview Bloom</h1>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4 text-gray-300">Welcome, {auth.user?.username}</span>
                            <button
                                onClick={logout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-gray-800 shadow rounded-lg p-6 border border-gray-700">
                    <h2 className="text-2xl font-bold mb-4 text-white">Dashboard</h2>
                    <p className="text-gray-300 mb-4">
                        You have successfully logged in! This is a protected route.
                    </p>
                    <div className="bg-gray-900 p-4 rounded-md border border-gray-600">
                        <h3 className="text-lg font-medium text-indigo-300 mb-2">User Details:</h3>
                        <pre className="text-sm text-gray-400 overflow-x-auto">
                            {JSON.stringify(auth.user, null, 2)}
                        </pre>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;

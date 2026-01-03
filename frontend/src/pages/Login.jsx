import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginHelper from '../components/Login';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (username, password) => {
        await login(username, password);
        navigate('/home');
    };

    const handleSwitchToSignup = () => {
        navigate('/register');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                    <p className="mt-2 text-sm text-gray-600">Please sign in to your account</p>
                </div>
                <LoginHelper onLogin={handleLogin} onSwitchToSignup={handleSwitchToSignup} />
            </div>
        </div>
    );
};

export default Login;

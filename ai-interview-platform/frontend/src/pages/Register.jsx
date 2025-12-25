import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SignupHelper from '../components/Signup';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSignup = async (userData) => {
        // userData contains confirm_password as well, which backend might reject if not in serializer
        // But our context/serializer handles it.
        await register(userData);
        navigate('/login');
    };

    const handleSwitchToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                    <p className="mt-2 text-sm text-gray-600">Join Interview Bloom today</p>
                </div>
                <SignupHelper onSignup={handleSignup} onSwitchToLogin={handleSwitchToLogin} />
            </div>
        </div>
    );
};

export default Register;

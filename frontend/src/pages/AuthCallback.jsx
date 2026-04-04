import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const { loginWithTokens } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const access = query.get('access');
        const refresh = query.get('refresh');

        if (access && refresh) {
            loginWithTokens(access, refresh)
                .then(() => {
                    navigate('/home');
                })
                .catch((err) => {
                    console.error("Auth callback error:", err);
                    navigate('/login?error=Authentication failed');
                });
        } else {
            navigate('/login');
        }
    }, [location, loginWithTokens, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Authenticating...</h2>
                <p className="text-gray-600 dark:text-gray-400">Please wait while we complete your sign-in.</p>
            </div>
        </div>
    );
};

export default AuthCallback;

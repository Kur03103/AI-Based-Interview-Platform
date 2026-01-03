import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { auth } = useAuth();
    const location = useLocation();

    if (auth.loading) {
        return <div>Loading...</div>; // Or a spinner
    }

    return auth.isAuthenticated ? (
        <Outlet />
    ) : (
        <Navigate to="/" replace />
    );
};

export default ProtectedRoute;

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ adminOnly = false }) => {
    const { auth } = useAuth();
    const location = useLocation();

    if (auth.loading) {
        return <div>Loading...</div>; // Or a spinner
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (adminOnly && !auth.user?.is_superuser) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

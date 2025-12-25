import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        user: null,
        isAuthenticated: false,
        loading: true,
    });

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await api.get('/auth/me/');
                    setAuth({
                        user: response.data,
                        isAuthenticated: true,
                        loading: false,
                    });
                } catch (error) {
                    console.error("Auth check failed", error);
                    // Token might be invalid
                    setAuth({
                        user: null,
                        isAuthenticated: false,
                        loading: false,
                    });
                }
            } else {
                setAuth({
                    user: null,
                    isAuthenticated: false,
                    loading: false,
                });
            }
        };

        checkAuth();
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/auth/login/', { username, password });
            const { access, refresh } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);

            // Fetch user details immediately
            const userResponse = await api.get('/auth/me/');

            setAuth({
                user: userResponse.data,
                isAuthenticated: true,
                loading: false,
            });
            return true;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/auth/register/', userData);
            // After register, you might want to auto-login or redirect to login.
            // Following requirement: "either auto-login... OR redirect to /login"
            // Start simple: Redirect to login (return true indicating success)
            return true;
        } catch (error) {
            console.error("Registration failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAuth({
            user: null,
            isAuthenticated: false,
            loading: false,
        });
        // Optional backend logout call
        api.post('/auth/logout/').catch(err => console.warn("Backend logout warning", err));
    };

    return (
        <AuthContext.Provider value={{ auth, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

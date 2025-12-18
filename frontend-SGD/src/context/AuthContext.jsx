import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (e) { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem('token') || null);
    const [isLoading, setIsLoading] = useState(true); 

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
        } else {
            delete axios.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        setIsLoading(false); 
    }, [token]);

    const login = async (email, senha) => {
        try {
            const response = await axios.post('/api/auth/login', { email, senha });
            const { token: receivedToken, user: userData } = response.data;
            
            setToken(receivedToken);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return true;
        } catch (error) {
            throw new Error(error.response?.data?.erro || 'Falha na conexão ou credenciais inválidas.');
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
    };
    
    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, token, isAdmin, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
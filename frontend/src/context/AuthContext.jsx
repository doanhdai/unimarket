import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import websocketService from '../services/websocket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        const response = await authService.login(credentials);
        const { data } = response.data;

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);

        return data;
    };

    const register = async (userData) => {
        const response = await authService.register(userData);
        const { data } = response.data;

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);

        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        websocketService.disconnect();
        setUser(null);
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
    };

    const isAdmin = user?.role === 'ADMIN';
    const isSeller = user?.role === 'SELLER' || user?.sellerApproved;

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            updateUser,
            loading,
            isAdmin,
            isSeller
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService, type AuthResponse } from '../services/authService';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface Workspace {
    id: string;
    name: string;
    slug: string;
    isActive?: boolean;
}

interface AuthContextType {
    user: User | null;
    workspace: Workspace | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    handleOAuthCallback: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
            authService
                .getMe()
                .then((data) => {
                    setUser(data.user);
                    setWorkspace(data.workspace);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const data: AuthResponse = await authService.login({ email, password });
        setUser(data.user);
        setWorkspace(data.workspace);
    };

    const register = async (registerData: any) => {
        const data: AuthResponse = await authService.register(registerData);
        setUser(data.user);
        setWorkspace(data.workspace);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setWorkspace(null);
    };

    const handleOAuthCallback = async (token: string) => {
        localStorage.setItem('token', token);
        try {
            const data = await authService.getMe();
            setUser(data.user);
            setWorkspace(data.workspace);
        } catch (error) {
            localStorage.removeItem('token');
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, workspace, isLoading, login, register, logout, handleOAuthCallback }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

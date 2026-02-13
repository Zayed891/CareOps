import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { handleOAuthCallback } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        
        if (token) {
            handleOAuthCallback(token);
            navigate('/dashboard');
        } else {
            navigate('/login?error=oauth_failed');
        }
    }, [searchParams, navigate, handleOAuthCallback]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Completing sign in...</p>
            </div>
        </div>
    );
};

export default AuthCallback;

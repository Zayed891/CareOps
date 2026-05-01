import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { AlertCircle, Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Check for OAuth errors in URL
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'oauth_failed') {
            setError('Google sign-in failed. Please try again or use email/password.');
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4 relative noise-overlay">
            {/* Background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
            
            <div className="w-full max-w-md relative z-10">
                {/* Logo and Header */}
                <div className="text-center mb-3 animate-fadeIn">
                    <Link to="/" className="inline-block mb-2 hover:scale-105 transition-transform">
                        <Logo size="sm" />
                    </Link>
                    <h1 className="text-lg font-bold text-text-primary font-display">Welcome back</h1>
                </div>

                {/* Login Card */}
                <div className="bg-surface-1 rounded-xl shadow-xl border border-white/[0.06] p-5 animate-scaleIn">
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-3 bg-error-50 border border-error-500/20 rounded-lg p-2.5 animate-slideIn">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-error-500 flex-shrink-0" />
                                <p className="text-xs font-medium text-error-500">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label htmlFor="email" className="label">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-9"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-9"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-2 text-sm font-semibold"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-surface-0" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign in'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/[0.06]"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-surface-1 text-text-muted">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Sign In Button */}
                    <button
                        type="button"
                        onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-white/[0.08] rounded-lg text-sm font-medium text-text-primary bg-surface-2 hover:bg-surface-3 transition-colors"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign in with Google
                    </button>

                    {/* Footer Link */}
                    <div className="mt-3 text-center pt-3 border-t border-white/[0.04]">
                        <p className="text-xs text-text-muted">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                                Create workspace
                            </Link>
                            {' · '}
                            <Link to="/" className="text-text-muted hover:text-text-secondary transition-colors">
                                Back to home
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

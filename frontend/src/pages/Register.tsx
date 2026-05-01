import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import { AlertCircle, User, Mail, Lock, Building2, ChevronDown } from 'lucide-react';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        workspaceName: '',
        workspaceAddress: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        contactEmail: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOptional, setShowOptional] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
            navigate('/onboarding');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4 relative noise-overlay">
            {/* Background glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

            <div className="w-full max-w-2xl relative z-10">
                {/* Logo and Header */}
                <div className="text-center mb-3 animate-fadeIn">
                    <Link to="/" className="inline-block mb-2 hover:scale-105 transition-transform">
                        <Logo size="sm" />
                    </Link>
                    <h1 className="text-lg font-semibold text-text-primary font-display">Create your workspace</h1>
                </div>

                {/* Register Card */}
                <div className="bg-surface-1 rounded-xl shadow-xl border border-white/[0.24] p-5 animate-scaleIn">
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
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="name" className="label">Your Name</label>
                                <div className="relative">
                                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input pl-9"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="label">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="input pl-9"
                                        placeholder="you@example.com"
                                    />
                                </div>
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
                                    autoComplete="new-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input pl-9"
                                    placeholder="Min. 8 characters"
                                />
                            </div>
                        </div>

                        {/* Business Information */}
                        <div className="pt-3 border-t border-white/[0.24]">
                            <div className="flex items-center gap-1.5 mb-2">
                                <Building2 className="h-3.5 w-3.5 text-text-secondary" />
                                <h3 className="text-xs font-semibold text-text-primary font-display uppercase tracking-wider">Business Details</h3>
                            </div>

                            <div className="space-y-2.5">
                                <div>
                                    <label htmlFor="workspaceName" className="label">Business Name</label>
                                    <input
                                        id="workspaceName"
                                        name="workspaceName"
                                        type="text"
                                        required
                                        value={formData.workspaceName}
                                        onChange={handleChange}
                                        className="input"
                                        placeholder="My Business"
                                    />
                                </div>

                                {/* Optional Fields Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setShowOptional(!showOptional)}
                                    className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
                                >
                                    <ChevronDown className={`h-3 w-3 transition-transform ${showOptional ? 'rotate-180' : ''}`} />
                                    {showOptional ? 'Hide' : 'Add'} optional details
                                </button>

                                {showOptional && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 animate-slideIn">
                                        <div>
                                            <label htmlFor="workspaceAddress" className="label">Address</label>
                                            <input
                                                id="workspaceAddress"
                                                name="workspaceAddress"
                                                type="text"
                                                value={formData.workspaceAddress}
                                                onChange={handleChange}
                                                className="input"
                                                placeholder="123 Main St"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="contactEmail" className="label">Contact Email</label>
                                            <input
                                                id="contactEmail"
                                                name="contactEmail"
                                                type="email"
                                                value={formData.contactEmail}
                                                onChange={handleChange}
                                                className="input"
                                                placeholder="contact@business.com"
                                            />
                                        </div>
                                    </div>
                                )}
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
                                    Creating...
                                </span>
                            ) : 'Create workspace'}
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="mt-3 text-center pt-3 border-t border-white/[0.16]">
                        <p className="text-xs text-text-muted">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                                Sign in
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

export default Register;

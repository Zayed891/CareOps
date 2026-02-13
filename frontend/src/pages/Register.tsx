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
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Logo and Header */}
                <div className="text-center mb-3 animate-fadeIn">
                    <Link to="/" className="inline-block mb-2 hover:scale-105 transition-transform">
                        <Logo size="sm" />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">Create your workspace</h1>
                </div>

                {/* Register Card */}
                <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-5 animate-scaleIn">
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2.5 animate-slideIn">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                <p className="text-xs font-medium text-red-900">{error}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Personal Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="name" className="label">Your Name</label>
                                <div className="relative">
                                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                                <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-1.5 mb-2">
                                <Building2 className="h-3.5 w-3.5 text-gray-700" />
                                <h3 className="text-xs font-semibold text-gray-900">Business Details</h3>
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
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
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
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </span>
                            ) : 'Create workspace'}
                        </button>
                    </form>

                    {/* Footer Link */}
                    <div className="mt-3 text-center pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                                Sign in
                            </Link>
                            {' · '}
                            <Link to="/" className="text-gray-500 hover:text-gray-700 transition-colors">
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

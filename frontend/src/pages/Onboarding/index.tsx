import React, { useState, useEffect } from 'react';
import { Rocket, Check, Circle, ArrowRight, Plug, Calendar, FileText, Package, Users } from 'lucide-react';
import { workspaceService } from '../../services/settingsService';
import { useNavigate } from 'react-router-dom';
import type { WorkspaceStatus } from '../../types/modules';

const STEPS = [
    { key: 'workspace', label: 'Create Workspace', icon: Rocket, description: 'Your workspace was created when you registered.', path: '/dashboard' },
    { key: 'integrations', label: 'Connect Integrations', icon: Plug, description: 'Add email or SMS integrations to communicate with customers.', path: '/settings' },
    { key: 'serviceTypes', label: 'Add Service Types', icon: Calendar, description: 'Define the services you offer and their durations.', path: '/bookings' },
    { key: 'availability', label: 'Set Availability', icon: Calendar, description: 'Set your available hours for each service type.', path: '/bookings?tab=availability' },
    { key: 'forms', label: 'Create a Form', icon: FileText, description: 'Build intake forms for your customers.', path: '/forms' },
    { key: 'inventory', label: 'Add Inventory', icon: Package, description: 'Track products and supplies in your inventory.', path: '/inventory' },
    { key: 'staff', label: 'Invite Staff', icon: Users, description: 'Add team members and assign permissions.', path: '/staff' },
];

const OnboardingPage: React.FC = () => {
    const [status, setStatus] = useState<WorkspaceStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [activating, setActivating] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        try {
            setLoading(true);
            const result = await workspaceService.getStatus();
            setStatus(result);
        } catch {
            setError('Failed to load workspace status');
        } finally {
            setLoading(false);
        }
    };

    const completedCount = status ? Object.values(status.setup).filter(Boolean).length : 0;
    const totalSteps = STEPS.length;
    const progress = Math.round((completedCount / totalSteps) * 100);

    const handleActivate = async () => {
        try {
            setActivating(true);
            await workspaceService.activate();
            navigate('/dashboard');
        } catch {
            setError('Setup is incomplete. Please complete the required steps first.');
            setActivating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-fadeIn">
            <div className="text-center mb-10">
                <div className="inline-flex p-4 bg-amber-900/30 rounded-2xl mb-4">
                    <Rocket className="h-16 w-16 text-amber-400" />
                </div>
                <h1 className="text-3xl font-semibold text-text-primary mb-3">Set Up Your Workspace</h1>
                <p className="text-text-secondary text-lg">Complete these steps to get CareOps ready for your business.</p>
            </div>

            {error && <div className="mb-4 p-3 bg-error-50 text-error-500 rounded-lg text-sm">{error}</div>}

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
                    <span>{completedCount} of {totalSteps} steps completed</span>
                    <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
            </div>

            {/* Steps */}
            <div className="space-y-4 mb-10">
                {STEPS.map(step => {
                    const isDone = status?.setup?.[step.key] || false;
                    return (
                        <div
                            key={step.key}
                            className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all cursor-pointer ${isDone
                                    ? 'bg-success-50 border-success-300 shadow-sm'
                                    : 'bg-surface-1 border-white/[0.06] hover:border-amber-500/30 hover:shadow-lg hover:-translate-y-0.5'
                                }`}
                            onClick={() => !isDone && navigate(step.path)}
                        >
                            <div className="flex items-center gap-3">
                                {isDone ? (
                                    <div className="h-8 w-8 rounded-full bg-green-100 text-success-500 flex items-center justify-center">
                                        <Check className="h-4 w-4" />
                                    </div>
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-surface-2 text-text-muted flex items-center justify-center">
                                        <Circle className="h-4 w-4" />
                                    </div>
                                )}
                                <div>
                                    <p className={`text-sm font-medium ${isDone ? 'text-green-800' : 'text-text-primary'}`}>{step.label}</p>
                                    <p className="text-xs text-text-muted">{step.description}</p>
                                </div>
                            </div>
                            {!isDone && <ArrowRight className="h-4 w-4 text-text-muted" />}
                        </div>
                    );
                })}
            </div>

            {/* Activate */}
            <button
                onClick={handleActivate}
                disabled={activating || progress < 100}
                className={`w-full py-4 rounded-xl text-base font-semibold shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 ${progress >= 100
                    ? 'bg-amber-500 text-white hover:bg-amber-400 hover:shadow-xl shadow-primary-200'
                    : 'bg-surface-2 text-text-muted cursor-not-allowed shadow-none'
                    }`}
            >
                {activating ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Setting up your workspace...</span>
                    </div>
                ) : progress >= 100 ? (
                    <span className="flex items-center justify-center gap-2">
                        <Rocket className="h-5 w-5" />
                        Launch Workspace
                    </span>
                ) : (
                    `Complete all steps to activate (${progress}%)`
                )}
            </button>
        </div>
    );
};

export default OnboardingPage;

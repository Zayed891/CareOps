import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink';
    className?: string;
}

const COLORS = {
    gray: 'bg-surface-3 text-text-secondary border border-white/[0.08]',
    red: 'bg-error-50 text-error-500 border border-error-500/20',
    yellow: 'bg-warning-50 text-warning-500 border border-warning-500/20',
    green: 'bg-success-50 text-success-500 border border-success-500/20',
    blue: 'bg-blue-900/30 text-blue-400 border border-blue-500/20',
    indigo: 'bg-indigo-900/30 text-indigo-400 border border-indigo-500/20',
    purple: 'bg-purple-900/30 text-purple-400 border border-purple-500/20',
    pink: 'bg-pink-900/30 text-pink-400 border border-pink-500/20',
};

const Badge: React.FC<BadgeProps> = ({ children, color = 'gray', className = '' }) => {
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${COLORS[color]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;

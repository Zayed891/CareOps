import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'indigo' | 'purple' | 'pink';
    className?: string;
}

const COLORS = {
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
};

const Badge: React.FC<BadgeProps> = ({ children, color = 'gray', className = '' }) => {
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${COLORS[color]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;

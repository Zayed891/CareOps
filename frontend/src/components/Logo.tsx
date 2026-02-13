import React from 'react';

interface LogoProps {
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    variant?: 'default' | 'white';
}

const Logo: React.FC<LogoProps> = ({ 
    className = '', 
    size = 'md', 
    showText = true,
    variant = 'default' 
}) => {
    const iconSizeClasses = {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
    };

    const textSizeClasses = {
        xs: 'text-base',
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl',
        xl: 'text-3xl',
    };

    const textColorClass = variant === 'white' ? 'text-white' : 'text-gray-900';

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            {/* Icon - geometric interconnected nodes representing operations */}
            <div className={`${iconSizeClasses[size]} flex-shrink-0`}>
                <svg
                    className="w-full h-full"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Background circle for contrast */}
                    <rect width="40" height="40" rx="8" fill={variant === 'white' ? 'rgba(255,255,255,0.1)' : '#2563EB'} />
                    
                    {/* Network icon - representing connected operations */}
                    <circle cx="20" cy="12" r="3" fill={variant === 'white' ? 'white' : 'white'} />
                    <circle cx="12" cy="22" r="3" fill={variant === 'white' ? 'white' : 'white'} />
                    <circle cx="28" cy="22" r="3" fill={variant === 'white' ? 'white' : 'white'} />
                    <circle cx="20" cy="28" r="3" fill={variant === 'white' ? 'white' : 'white'} />
                    
                    {/* Connection lines */}
                    <line x1="20" y1="15" x2="20" y2="25" stroke={variant === 'white' ? 'rgba(255,255,255,0.6)' : '#93C5FD'} strokeWidth="1.5" />
                    <line x1="18.5" y1="13.5" x2="13.5" y2="20.5" stroke={variant === 'white' ? 'rgba(255,255,255,0.6)' : '#93C5FD'} strokeWidth="1.5" />
                    <line x1="21.5" y1="13.5" x2="26.5" y2="20.5" stroke={variant === 'white' ? 'rgba(255,255,255,0.6)' : '#93C5FD'} strokeWidth="1.5" />
                    <line x1="14" y1="24" x2="18" y2="26.5" stroke={variant === 'white' ? 'rgba(255,255,255,0.6)' : '#93C5FD'} strokeWidth="1.5" />
                    <line x1="26" y1="24" x2="22" y2="26.5" stroke={variant === 'white' ? 'rgba(255,255,255,0.6)' : '#93C5FD'} strokeWidth="1.5" />
                </svg>
            </div>

            {/* Text */}
            {showText && (
                <span className={`font-bold tracking-tight ${textSizeClasses[size]} ${textColorClass}`}>
                    CareOps
                </span>
            )}
        </div>
    );
};

export default Logo;

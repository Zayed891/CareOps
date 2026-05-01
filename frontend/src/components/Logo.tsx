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

    return (
        <div className={`flex items-center gap-2.5 ${className}`}>
            {/* Icon — geometric network with amber gradient */}
            <div className={`${iconSizeClasses[size]} flex-shrink-0`}>
                <svg
                    className="w-full h-full"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#F5C563" />
                            <stop offset="1" stopColor="#D4922A" />
                        </linearGradient>
                        <linearGradient id="logoGradLight" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#FDE29B" stopOpacity="0.6" />
                            <stop offset="1" stopColor="#F5C563" stopOpacity="0.3" />
                        </linearGradient>
                    </defs>
                    {/* Background */}
                    <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
                    
                    {/* Network nodes */}
                    <circle cx="20" cy="12" r="3" fill="#0C0E12" />
                    <circle cx="12" cy="22" r="3" fill="#0C0E12" />
                    <circle cx="28" cy="22" r="3" fill="#0C0E12" />
                    <circle cx="20" cy="28" r="3" fill="#0C0E12" />
                    
                    {/* Connection lines */}
                    <line x1="20" y1="15" x2="20" y2="25" stroke="#0C0E12" strokeWidth="1.5" strokeOpacity="0.4" />
                    <line x1="18.5" y1="13.5" x2="13.5" y2="20.5" stroke="#0C0E12" strokeWidth="1.5" strokeOpacity="0.4" />
                    <line x1="21.5" y1="13.5" x2="26.5" y2="20.5" stroke="#0C0E12" strokeWidth="1.5" strokeOpacity="0.4" />
                    <line x1="14" y1="24" x2="18" y2="26.5" stroke="#0C0E12" strokeWidth="1.5" strokeOpacity="0.4" />
                    <line x1="26" y1="24" x2="22" y2="26.5" stroke="#0C0E12" strokeWidth="1.5" strokeOpacity="0.4" />
                </svg>
            </div>

            {/* Text */}
            {showText && (
                <span className={`font-display font-semibold tracking-tighter ${textSizeClasses[size]} ${variant === 'white' ? 'text-white' : 'text-text-primary'}`}>
                    Care<span className="text-amber-400">Ops</span>
                </span>
            )}
        </div>
    );
};

export default Logo;

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Dark surfaces
                surface: {
                    0: '#0C0E12',
                    1: '#14161C',
                    2: '#1A1D26',
                    3: '#22262F',
                    4: '#2A2F3A',
                },
                // Warm amber accent
                amber: {
                    50: '#FFF9EB',
                    100: '#FEF0CD',
                    200: '#FDE29B',
                    300: '#F9CF63',
                    400: '#F5C563',
                    500: '#E8A838',
                    600: '#D4922A',
                    700: '#B0731E',
                    800: '#8E5C1B',
                    900: '#744C19',
                },
                // Keep primary for backward compat but map to amber
                primary: {
                    50: '#FFF9EB',
                    100: '#FEF0CD',
                    200: '#FDE29B',
                    300: '#F9CF63',
                    400: '#F5C563',
                    500: '#E8A838',
                    600: '#D4922A',
                    700: '#B0731E',
                    800: '#8E5C1B',
                    900: '#744C19',
                },
                success: {
                    50: '#0D2818',
                    100: '#14532D',
                    200: '#166534',
                    500: '#34D399',
                    600: '#10B981',
                    700: '#059669',
                },
                warning: {
                    50: '#271D08',
                    100: '#422D0C',
                    200: '#5C3D10',
                    500: '#FBBF24',
                    600: '#D97706',
                    700: '#B45309',
                },
                error: {
                    50: '#2A0F0F',
                    100: '#450A0A',
                    200: '#7F1D1D',
                    500: '#F87171',
                    600: '#EF4444',
                    700: '#DC2626',
                },
                // Text colors
                text: {
                    primary: '#F0F0F2',
                    secondary: '#8B8FA3',
                    muted: '#5C6070',
                },
                // Border
                border: {
                    subtle: 'rgba(255, 255, 255, 0.06)',
                    DEFAULT: 'rgba(255, 255, 255, 0.08)',
                    hover: 'rgba(255, 255, 255, 0.12)',
                    strong: 'rgba(255, 255, 255, 0.18)',
                },
            },
            fontFamily: {
                sans: ['Satoshi', 'system-ui', 'sans-serif'],
                display: ['Satoshi', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                'sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
                'card': '0 2px 8px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.3)',
                'card-hover': '0 8px 24px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2)',
                'lg': '0 12px 32px rgba(0, 0, 0, 0.3)',
                'xl': '0 20px 48px rgba(0, 0, 0, 0.4)',
                '2xl': '0 32px 64px rgba(0, 0, 0, 0.5)',
                'glow-amber': '0 0 20px rgba(232, 168, 56, 0.15), 0 0 40px rgba(232, 168, 56, 0.05)',
                'glow-success': '0 0 20px rgba(52, 211, 153, 0.15)',
                'glow-error': '0 0 20px rgba(248, 113, 113, 0.15)',
                'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            },
            borderRadius: {
                'lg': '0.625rem',
                'xl': '0.875rem',
                '2xl': '1.125rem',
                '3xl': '1.5rem',
            },
            animation: {
                'fadeIn': 'fadeIn 0.4s ease-out',
                'slideIn': 'slideIn 0.4s ease-out',
                'slideUp': 'slideUp 0.4s ease-out',
                'scaleIn': 'scaleIn 0.3s ease-out',
                'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
                'shimmer': 'shimmer 2s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'glow-pulse': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(232, 168, 56, 0.1)' },
                    '50%': { boxShadow: '0 0 30px rgba(232, 168, 56, 0.2)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            backgroundImage: {
                'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
}

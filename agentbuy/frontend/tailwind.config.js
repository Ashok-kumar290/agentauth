/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#6366f1',
                secondary: '#8b5cf6',
                background: '#0f0f1a',
                surface: '#1a1a2e',
                accent: '#00d9ff',
            },
            animation: {
                'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                'pulse-ring': {
                    '0%': { transform: 'scale(0.8)', opacity: '1' },
                    '100%': { transform: 'scale(2)', opacity: '0' },
                },
                'glow': {
                    '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' },
                    '100%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.8)' },
                },
            },
        },
    },
    plugins: [],
};

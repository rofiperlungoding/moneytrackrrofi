/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Premium Cinematic Green Theme
        'cinematic-dark': '#0A0F0A',
        'cinematic-darker': '#061008',
        'cinematic-base': '#0D1B0D',
        'cinematic-surface': '#162B16',
        'cinematic-surface-elevated': '#1E3A1E',
        'cinematic-glass': 'rgba(34, 197, 94, 0.08)',
        'cinematic-border': 'rgba(34, 197, 94, 0.15)',
        'cinematic-text': '#F0FDF4',
        'cinematic-text-secondary': '#BBF7D0',
        'cinematic-text-muted': '#86EFAC',
        
        // Cinematic Green Palette
        'cinema-green': '#22C55E',
        'cinema-green-light': '#4ADE80',
        'cinema-green-bright': '#65F578',
        'cinema-green-dark': '#16A34A',
        'cinema-green-deeper': '#15803D',
        'cinema-emerald': '#10B981',
        'cinema-jade': '#059669',
        'cinema-lime': '#84CC16',
        
        // Light theme colors (for compatibility)
        'light-base': '#F8FBF8',
        'light-surface': '#FFFFFF',
        'light-glass': 'rgba(34, 197, 94, 0.05)',
        'light-border': 'rgba(34, 197, 94, 0.15)',
        'light-text': '#0F172A',
        'light-text-secondary': '#475569',
        
        // Premium accent colors
        'premium-gold': '#F59E0B',
        'premium-silver': '#94A3B8',
        'premium-copper': '#EA580C',
        
        // Financial status colors
        'financial-positive': '#22C55E',
        'financial-positive-light': '#4ADE80',
        'financial-positive-bg': 'rgba(34, 197, 94, 0.1)',
        'financial-negative': '#EF4444',
        'financial-negative-light': '#F87171',
        'financial-negative-bg': 'rgba(239, 68, 68, 0.1)',
        'financial-neutral': '#94A3B8',
        'financial-neutral-bg': 'rgba(148, 163, 184, 0.1)',
        
        // Fun colors for child-friendly elements
        'fun-blue': '#3B82F6',
        'fun-green': '#22C55E',
        'fun-purple': '#8B5CF6',
        'fun-pink': '#EC4899',
        'fun-orange': '#F97316',
        'fun-yellow': '#F59E0B',
        'fun-red': '#EF4444',
        
        // Main accent
        'lime-accent': '#22C55E',
        'lime-glow': 'rgba(34, 197, 94, 0.3)',
      },
      fontFamily: {
        'editorial': ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'cinematic': ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'cinematic-gradient': 'linear-gradient(135deg, #0A0F0A 0%, #162B16 25%, #1E3A1E 50%, #22C55E 100%)',
        'cinematic-radial': 'radial-gradient(circle at center, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
        'premium-green': 'linear-gradient(135deg, #15803D 0%, #22C55E 50%, #4ADE80 100%)',
        'glass-green': 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(74, 222, 128, 0.05) 100%)',
        'emerald-glow': 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
        'dark-emerald': 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)',
      },
      boxShadow: {
        'cinematic': '0 25px 50px -12px rgba(34, 197, 94, 0.25)',
        'cinematic-lg': '0 35px 60px -12px rgba(34, 197, 94, 0.35)',
        'premium': '0 20px 40px rgba(34, 197, 94, 0.15), 0 0 0 1px rgba(34, 197, 94, 0.1)',
        'premium-lg': '0 25px 50px rgba(34, 197, 94, 0.2), 0 0 0 1px rgba(34, 197, 94, 0.15)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.4)',
        'glow-green-lg': '0 0 40px rgba(34, 197, 94, 0.6)',
        'inner-glow': 'inset 0 1px 0 0 rgba(34, 197, 94, 0.1)',
        'glass': '0 8px 32px rgba(34, 197, 94, 0.12)',
        'elevated': '0 12px 40px rgba(34, 197, 94, 0.15)',
        'floating': '0 6px 20px rgba(34, 197, 94, 0.2)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(34, 197, 94, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        'glass': '24px',
        'premium': '32px',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
    },
  },
  plugins: [],
  safelist: [
    // Ensure dynamic classes are included
    'border-cinema-green/30',
    'border-cinema-green/40',
    'bg-cinema-green/20',
    'bg-cinema-green/30',
    'text-cinema-green',
    'shadow-glow-green',
  ],
};
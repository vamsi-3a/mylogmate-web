import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary accent — matches design handoff #7EB0F7
        accent: {
          DEFAULT: '#7EB0F7',
          hover: '#6BA0EB',
          active: '#5C95E0',
          light: '#93B5FF',
          muted: 'rgba(126,176,247,0.15)',
          tint: '#EEF4FF',
        },
        // Dark mode accent
        'dark-accent': {
          DEFAULT: '#6B9FFF',
          hover: '#85B0FF',
          active: '#5C95E0',
          muted: 'rgba(107,159,255,0.12)',
          tint: 'rgba(107,159,255,0.1)',
        },
        // Dark mode layered surfaces
        surface: {
          1: '#171717',
          2: '#1F1F1F',
          3: '#262626',
          4: '#1A1A1A',
        },
        // Semantic ink colors
        ink: {
          DEFAULT: '#1A1A1A',
          2: '#6B7280',
          3: '#9CA3AF',
        },
        // Tint palettes (for picker cards, log entry tags)
        sage: {
          tint: '#EFF5EE',
          accent: '#6BBF8A',
          text: '#3F6B4A',
        },
        cream: {
          tint: '#FAF7F0',
          accent: '#C9A35A',
          text: '#9C7A3C',
        },
      },
      borderRadius: {
        card: '1rem',        // 16px
        'card-lg': '1.25rem', // 20px
        'card-xl': '1.375rem', // 22px
        'card-2xl': '1.5rem', // 24px
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,30,50,.03), 0 8px 24px -12px rgba(20,30,50,.10)',
        'card-lg': '0 1px 2px rgba(20,30,50,.03), 0 18px 40px -20px rgba(20,30,50,.14)',
        'card-xl': '0 1px 2px rgba(20,30,50,.03), 0 24px 60px -28px rgba(20,30,50,.18)',
        float: '0 1px 2px rgba(20,30,50,.04), 0 18px 40px rgba(20,30,50,.10)',
        focus: '0 0 0 4px rgba(126,176,247,.18)',
        'button-primary': '0 1px 2px rgba(110,150,210,.18), 0 6px 16px rgba(126,176,247,.32)',
      },
      animation: {
        shimmer: 'shimmer 1.4s ease-in-out infinite',
        'thinking-dot': 'thinking-dot 1.1s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.4s ease-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '400% 0' },
          '100%': { backgroundPosition: '-400% 0' },
        },
        'thinking-dot': {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.85)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
    },
  },
  plugins: [],
} satisfies Config;

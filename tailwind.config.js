/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        teacher: {
          50:  '#f0f7ff', 100: '#dbeefe', 200: '#bde0fd', 300: '#7ec8fb',
          400: '#38aaf5', 500: '#0e8fe0', 600: '#0271bf', 700: '#025a9a',
          800: '#064d7f', 900: '#0b4169', 950: '#072948',
        },
        teal: {
          50:  '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
          400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
          800: '#115e59', 900: '#134e4a',
        },
        play: {
          yellow: '#FFD93D', orange: '#FF6B35', blue: '#4CC9F0',
          green: '#06D6A0', pink: '#FF6B9D', purple: '#9B5DE5', red: '#F72585',
        },
        slate: {
          50:  '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a', 950: '#020617',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        fun:     ['"Nunito"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':      '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'card-lg':   '0 8px 32px rgba(0,0,0,0.12)',
        'glow-blue': '0 0 0 3px rgba(14,143,224,0.25)',
        'glow-teal': '0 0 0 3px rgba(20,184,166,0.25)',
        'modal':     '0 20px 60px rgba(0,0,0,0.25)',
        'fun':       '0 6px 0 rgba(0,0,0,0.15)',
        'fun-sm':    '0 3px 0 rgba(0,0,0,0.15)',
      },
      animation: {
        'fade-in':    'fadeIn 0.35s ease-out',
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'bounce-in':  'bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        'wiggle':     'wiggle 0.5s ease-in-out',
        'float':      'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'star-pop':   'starPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'progress':   'progress 1.8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        bounceIn:  { from: { opacity: 0, transform: 'scale(0.8)' }, to: { opacity: 1, transform: 'scale(1)' } },
        wiggle:    { '0%,100%': { transform: 'rotate(0deg)' }, '25%': { transform: 'rotate(-8deg)' }, '75%': { transform: 'rotate(8deg)' } },
        float:     { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
        starPop:   { from: { opacity: 0, transform: 'scale(0) rotate(-20deg)' }, to: { opacity: 1, transform: 'scale(1) rotate(0deg)' } },
        progress:  { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(300%)' } },
      },
    },
  },
  plugins: [],
};

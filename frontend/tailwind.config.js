/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#effbff',
          100: '#d9f8ff',
          200: '#bceeff',
          300: '#8fe4ff',
          400: '#5dcaf9',
          500: '#2ea2ef',
          600: '#1a7ed8',
          700: '#1d64ad',
          800: '#1f537f',
          900: '#1d4569',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        slateDeep: '#020817',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(45,212,191,0.15), 0 20px 60px rgba(12,74,110,0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

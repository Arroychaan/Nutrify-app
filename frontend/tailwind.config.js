/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        display: ['var(--font-outfit)', 'Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7', // Emerald 300
          400: '#34d399',
          500: '#10b981', // Emerald 500 (V1.1 Primary)
          600: '#059669', // Emerald 600 (V1.1 Dark)
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        secondary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366F1', // Indigo 500 (V1.1 Accent)
          600: '#4F46E5',
        },
        neutral: {
          50: '#F8FAFC', // Slate 50 (Background)
          100: '#F1F5F9',
          200: '#E2E8F0', // Border
          400: '#94A3B8', // Text Tertiary
          600: '#475569', // Text Secondary
          900: '#0F172A', // Text Primary
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to bottom right, #10B981, #059669)',
        'gradient-accent': 'linear-gradient(to bottom right, #6366F1, #4F46E5)',
        'gradient-fire': 'linear-gradient(to bottom right, #F59E0B, #EA580C)',
        'gradient-glass': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4))',
      },
      boxShadow: {
        'glass-sm': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'glass-md': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-fraunces)', 'Fraunces', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Core brand palette — Indonesian earth tones
        'primary-dark': {
          DEFAULT: '#1E1810',
          50: '#F5F0EB',
          100: '#E8DFD5',
          200: '#C9B9A5',
          300: '#A99375',
          400: '#7A6548',
          500: '#4A3B28',
          600: '#352A1C',
          700: '#271F15',
          800: '#1E1810',
          900: '#130F0A',
        },
        'primary-action': {
          DEFAULT: '#C4603A',
          50: '#FBF0EB',
          100: '#F5D9CD',
          200: '#EAAE98',
          300: '#DF8363',
          400: '#D16F4C',
          500: '#C4603A',
          600: '#A84F2F',
          700: '#8C3F25',
          800: '#702F1B',
          900: '#541F11',
        },
        'secondary': {
          DEFAULT: '#3D6B4F',
          50: '#EDF5F0',
          100: '#D4E8DA',
          200: '#A8D1B5',
          300: '#7CBA90',
          400: '#5A9A6F',
          500: '#3D6B4F',
          600: '#325942',
          700: '#274634',
          800: '#1C3326',
          900: '#112018',
        },
        'background': {
          DEFAULT: '#FAF0E0',
          50: '#FEFCF7',
          100: '#FDF7ED',
          200: '#FAF0E0',
          300: '#F3E2C5',
          400: '#ECD4AA',
          500: '#E5C68F',
          600: '#D4A85C',
          700: '#B8873A',
          800: '#8A652C',
          900: '#5C431D',
        },
        'accent': {
          DEFAULT: '#E8A838',
          50: '#FDF6E8',
          100: '#FAEAC5',
          200: '#F5D48B',
          300: '#F0BE51',
          400: '#ECB240',
          500: '#E8A838',
          600: '#D4922A',
          700: '#B07722',
          800: '#8C5D1A',
          900: '#684412',
        },
        // Semantic aliases
        'surface': '#FFFAF2',
        'surface-alt': '#F5EBD8',
        'text-primary': '#1E1810',
        'text-secondary': '#5C4F3D',
        'text-muted': '#8C7E6A',
        'border-warm': '#E8DFD0',
        'border-light': '#F0E8DA',
        // Status
        'success': '#3D6B4F',
        'error': '#C44B3A',
        'warning': '#E8A838',
      },
      backgroundImage: {
        // Warm earth-tone gradients
        'gradient-hero': 'linear-gradient(135deg, #FAF0E0 0%, #F5EBD8 50%, #F0E3CA 100%)',
        'gradient-terracotta': 'linear-gradient(135deg, #C4603A 0%, #A84F2F 50%, #8C3F25 100%)',
        'gradient-forest': 'linear-gradient(135deg, #3D6B4F 0%, #325942 50%, #274634 100%)',
        'gradient-amber': 'linear-gradient(135deg, #E8A838 0%, #D4922A 50%, #B07722 100%)',
        'gradient-warm': 'linear-gradient(180deg, #FAF0E0 0%, #FFFAF2 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1E1810 0%, #2A2018 50%, #352A1C 100%)',
        // Subtle texture
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E\")",
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'badge': '6px',
        'pill': '9999px',
      },
      boxShadow: {
        // Warm shadows — no cold blue/grey
        'warm-sm': '0 1px 3px rgba(30, 24, 16, 0.06), 0 1px 2px rgba(30, 24, 16, 0.04)',
        'warm-md': '0 4px 12px rgba(30, 24, 16, 0.08), 0 2px 4px rgba(30, 24, 16, 0.04)',
        'warm-lg': '0 8px 24px rgba(30, 24, 16, 0.10), 0 4px 8px rgba(30, 24, 16, 0.06)',
        'warm-xl': '0 16px 48px rgba(30, 24, 16, 0.12), 0 8px 16px rgba(30, 24, 16, 0.08)',
        // Card
        'card': '0 1px 4px rgba(30, 24, 16, 0.04), 0 4px 16px rgba(30, 24, 16, 0.06)',
        'card-hover': '0 4px 12px rgba(30, 24, 16, 0.08), 0 8px 32px rgba(30, 24, 16, 0.10)',
        // Glow for CTA
        'glow-action': '0 0 24px -4px rgba(196, 96, 58, 0.35)',
        'glow-accent': '0 0 24px -4px rgba(232, 168, 56, 0.30)',
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.75' },
        },
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
}

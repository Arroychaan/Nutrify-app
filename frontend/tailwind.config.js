/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: 'var(--color-sage)',
          light: 'var(--color-sage-light)',
          muted: 'var(--color-sage-muted)',
        },
        twilight: {
          DEFAULT: 'var(--color-twilight)',
          light: 'var(--color-twilight-light)',
          pale: 'var(--color-twilight-pale)',
        },
        gold: {
          DEFAULT: 'var(--color-gold)',
          muted: 'var(--color-gold-muted)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          2: 'var(--color-surface-2)',
          3: 'var(--color-surface-3)',
        },
        ink: {
          DEFAULT: 'var(--color-ink)',
          2: 'var(--color-ink-2)',
          3: 'var(--color-ink-3)',
        },
        status: {
          success: 'var(--color-success)',
          warning: 'var(--color-warning)',
          danger: 'var(--color-danger)',
        },
        premium: {
          DEFAULT: 'var(--color-premium)',
          light: 'var(--color-premium-light)',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        editorial: ['"Playfair Display"', 'serif'],
        handwritten: ['"Caveat"', 'cursive'],
      },
      fontSize: {
        'display-xl': ['64px', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '400' }],
        'display-lg': ['48px', { lineHeight: '1.1', fontWeight: '400' }],
        'display-md': ['36px', { lineHeight: '1.15', fontWeight: '400' }],
        'heading': ['24px', { lineHeight: '1.2', fontWeight: '700' }],
        'subheading': ['18px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.7', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.05em' }],
        'data': ['14px', { lineHeight: '1.2', fontWeight: '700' }], // Tabular nums can be added via class
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        'full': '9999px',
        'xl': '12px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(26,33,27,0.08)',
        'float': '0 8px 48px rgba(26,33,27,0.14)',
        'glow': '0 0 40px rgba(217,108,74,0.20)',
        'scrapbook': '2px 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.2)',
        'polaroid': '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), 0 10px 15px -3px rgba(0,0,0,0.1)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '400ms',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-ring': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.3s ease forwards',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

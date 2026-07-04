/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        dim: 'var(--color-dim)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          press: 'var(--color-primary-press)',
          light: 'var(--color-primary-light)',
          // legacy mappings to avoid breakage
          300: 'var(--color-primary-light)',
          500: 'var(--color-primary)',
          600: 'var(--color-primary-press)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        // legacy mappings for warm- classes
        warm: {
          bg: 'var(--color-background)',
          card: 'var(--color-card)',
          border: 'var(--color-border)',
          muted: 'var(--color-muted)',
          dim: 'var(--color-dim)',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '28px',
      },
      spacing: {
        '13': '3.25rem',
        safe: 'env(safe-area-inset-bottom)',
        'safe-top': 'env(safe-area-inset-top)',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.18)',
        'sm': '0 1px 3px rgba(0,0,0,0.22), 0 1px 2px rgba(0,0,0,0.14)',
        'md': '0 2px 8px rgba(0,0,0,0.24), 0 1px 3px rgba(0,0,0,0.14)',
        'lg': '0 4px 16px rgba(0,0,0,0.26), 0 2px 6px rgba(0,0,0,0.14)',
        'xl': '0 8px 28px rgba(0,0,0,0.28), 0 3px 8px rgba(0,0,0,0.14)',
        soft: '0 1px 3px rgba(0,0,0,0.22), 0 1px 2px rgba(0,0,0,0.14)',
        card: '0 2px 8px rgba(0,0,0,0.24), 0 1px 3px rgba(0,0,0,0.14)',
        float: '0 4px 16px rgba(0,0,0,0.26), 0 0 0 1px rgba(255,255,255,0.05)',
        'float-lg': '0 8px 28px rgba(0,0,0,0.30), 0 0 0 1px rgba(255,255,255,0.06)',
        'selection': '0 0 0 2px var(--color-primary)',
        'btn': '0 1px 0 rgba(255,255,255,0.08) inset',
        'primary-glow': '0 2px 8px rgba(0,113,227,0.20)',
        'success-glow': '0 2px 8px rgba(52,199,89,0.20)',
        'selection-ring': '0 0 0 2px var(--color-primary)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out both',
        'fade-in-up': 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-up': 'slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'check-pop': 'checkPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'shimmer': 'shimmer 1.8s infinite linear',
        'page-enter': 'pageEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'marquee': 'marquee 35s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        checkPop: {
          '0%': { opacity: '0', transform: 'scale(0.4)' },
          '70%': { opacity: '1', transform: 'scale(1.1)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pageEnter: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        marquee: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '100%': { transform: 'translate3d(-50%, 0, 0)' },
        },
      },
    },
  },
  plugins: [],
};

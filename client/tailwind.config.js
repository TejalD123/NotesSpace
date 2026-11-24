const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        page: c('page'),
        surface: c('surface'),
        tint: c('tint'),
        line: c('line'),
        ink: c('ink'),
        muted: c('muted'),
        brand: c('brand'),
        'brand-soft': c('brand-soft'),
        'brand-ink': c('brand-ink'),
        key: { bg: c('key-bg'), bar: c('key-bar'), ink: c('key-ink') },
        tip: { bg: c('tip-bg'), bar: c('tip-bar'), ink: c('tip-ink') },
        warn: { bg: c('warn-bg'), bar: c('warn-bar'), ink: c('warn-ink') },
        ex: { bg: c('ex-bg'), bar: c('ex-bar'), ink: c('ex-ink') },
        mark: c('mark'),
      },
      boxShadow: {
        card: '0 1px 2px rgb(var(--shadow) / 0.06), 0 4px 16px rgb(var(--shadow) / 0.05)',
        pop: '0 12px 40px rgb(var(--shadow) / 0.18)',
      },
      keyframes: {
        slide: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(350%)' },
        },
        'toast-in': {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        'pop-in': {
          from: { opacity: 0, transform: 'scale(0.96)' },
          to: { opacity: 1, transform: 'scale(1)' },
        },
      },
      animation: {
        slide: 'slide 1.4s ease-in-out infinite',
        'toast-in': 'toast-in 0.2s ease-out',
        'pop-in': 'pop-in 0.15s ease-out',
      },
    },
  },
  plugins: [],
};

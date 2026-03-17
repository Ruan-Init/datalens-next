/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          1: '#07070f',
          2: '#0e0e1a',
          3: '#13131f',
          4: '#1a1a28',
          5: '#1f1f30',
        },
        accent: {
          DEFAULT: '#6c5ce7',
          2: '#a29bfe',
          3: '#74b9ff',
          4: '#00cec9',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          2: 'rgba(255,255,255,0.10)',
          3: 'rgba(255,255,255,0.15)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.3s ease forwards',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

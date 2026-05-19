import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './actions/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'somma-black':  '#0a0a0a',
        'somma-blue':   '#005EFF',
        'somma-orange': '#FF4800',
        'somma-yellow': '#FDB716',
        'somma-pink':   '#FD6FDB',
        'somma-cream':  '#F9F0DC',
        'somma-white':  '#F9F0DC',
      },
      fontFamily: {
        bebas: ['var(--font-bebas)', 'sans-serif'],
        dm:    ['var(--font-dm)',    'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'float':     'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(-3deg)' },
          '50%':       { transform: 'translateY(-12px) rotate(3deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config

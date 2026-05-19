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
        'somma-blue':   '#0D1B8E',
        'somma-orange': '#E8561A',
        'somma-yellow': '#FAC775',
        'somma-white':  '#f5f2ec',
      },
      fontFamily: {
        bebas: ['var(--font-bebas)', 'sans-serif'],
        dm:    ['var(--font-dm)',    'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config

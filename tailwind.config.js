/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--p50)',
          100: 'var(--p100)',
          200: 'var(--p200)',
          300: 'var(--p300)',
          400: 'var(--p400)',
          500: 'var(--p500)',
          600: 'var(--p600)',
          700: 'var(--p700)',
          800: 'var(--p800)',
          900: 'var(--p900)',
        },
        elegant: {
          50: '#f8f7f4',
          100: '#f0ede6',
          200: '#e1dac9',
          300: '#cdc0a3',
          400: '#b8a07d',
          500: '#a68860',
          600: '#8f7354',
          700: '#765e46',
          800: '#624f3d',
          900: '#524335',
        }
      },
      fontFamily: {
        serif: ['var(--font-heading)', 'serif'],
        sans: ['var(--font-body)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

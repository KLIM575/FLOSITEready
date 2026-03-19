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
          50: '#fdf4f5',
          100: '#fce7eb',
          200: '#f9d0d9',
          300: '#f5a8b8',
          400: '#ef7591',
          500: '#e5446d',
          600: '#d1285c',
          700: '#b01d4d',
          800: '#931b47',
          900: '#7d1b42',
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
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

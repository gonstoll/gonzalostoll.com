/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        white: 'var(--color-white',
        black: 'var(--color-black',
        primary: 'var(--color-primary)',
      },
    },
  },
  plugins: [],
}

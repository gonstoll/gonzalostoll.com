/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
const {fontFamily, transitionProperty} = defaultTheme

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        white: 'var(--color-white)',
        black: 'var(--color-black)',
        primary: 'var(--color-primary)',
        codeBg: 'var(--color-code-bg)',
      },
      transitionProperty: {
        top: `top, opacity, ${transitionProperty.colors}`,
        toggle: `${transitionProperty.transform}, ${transitionProperty.colors}`,
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        mono: ['var(--font-mono)', ...fontFamily.mono],
      },
      borderRadius: {
        xs: '0.0625rem', // 1px
      },
      maxWidth: {
        xxs: '7.5rem'
      }
    },
  },
  plugins: [],
}

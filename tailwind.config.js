/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        purple: {
          25: '#fefcff',
          50: '#faf7ff',
          100: '#f3edff',
          200: '#e9d8ff',
          300: '#d8bbff',
          400: '#B19CD9',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
    },
  },
  plugins: [],
};

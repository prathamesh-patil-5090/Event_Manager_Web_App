/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(0.5rem)' },
          '75%': { transform: 'translateX(-0.5rem)' },
        }
      },
      animation: {
        shake: 'shake 0.5s ease-in-out',
      }
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0ea5e9',
          dark: '#0369a1',
        },
        asphalt: '#0b0f14',
        steel: '#1f2937',
        chrome: '#9ca3af',
      },
      boxShadow: {
        card: '0 10px 25px -5px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
};


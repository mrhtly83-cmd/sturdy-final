/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sturdy: {
          teal: '#14b8a6',
          slate: '#0f172a',
        },
      },
      animation: {
        sturdyFloat: 'sturdyFloat 6s ease-in-out infinite',
        sturdyPop: 'sturdyPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        calmFadeUp: 'calmFadeUp 0.8s ease-out forwards',
      },
    },
  },
  plugins: [],
};
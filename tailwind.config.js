/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./mobile/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // The core brand color for accents and buttons
        sturdy: {
          teal: '#14b8a6', // Teal-500 equivalent
          blue: '#2563eb',
          slate: '#0f172a', // Deep background
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      animation: {
        sturdyFloat: 'sturdyFloat 6s ease-in-out infinite',
        sturdyGlow: 'sturdyGlow 4s ease-in-out infinite',
        sturdyPop: 'sturdyPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        calmFadeUp: 'calmFadeUp 0.8s ease-out forwards',
        calmFadeIn: 'calmFadeIn 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
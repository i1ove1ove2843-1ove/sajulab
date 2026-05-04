/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        black: ['var(--font-black)', 'sans-serif'],
        jua: ['var(--font-jua)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

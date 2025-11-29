/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'moria-orange': '#f97316',
        'moria-blue': '#2563eb',
        'moria-black': '#1a1a1a',
      },
    },
  },
  plugins: [],
}

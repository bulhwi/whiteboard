/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'canvas-bg': '#f8f9fa',
        'pen-black': '#000000',
        'pen-red': '#dc3545',
        'pen-blue': '#007bff',
      },
    },
  },
  plugins: [],
}
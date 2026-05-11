/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: '#FAF6F0',
        'warm-white': '#FFF9F2',
        'coffee-dark': '#2C1810',
        'coffee-mid': '#5C3D2E',
        'coffee-light': '#8B5E3C',
        caramel: '#C8854A',
        gold: '#D4A853',
        sage: '#7A8C6E',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        dm: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
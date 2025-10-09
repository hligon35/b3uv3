/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brandBlue: {
          DEFAULT: '#7BAFD4',
          dark: '#4B86AB',
          light: '#A9CBE2'
        },
        brandOrange: {
          DEFAULT: '#CC5500',
          dark: '#A64400',
          light: '#E6762A'
        },
        navy: '#0A1A2A',
      },
      fontFamily: {
        display: ['Oswald', 'Impact', 'Arial Black', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        script: ['Dancing Script', 'Brush Script MT', 'cursive']
      }
    },
  },
  plugins: [],
};

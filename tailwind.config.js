/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        marker: ['"Permanent Marker"', 'cursive'],
        caveat: ['"Caveat"', 'cursive'],
        bebas: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        koyoto: ['"Bebas Neue"', '"Plus Jakarta Sans"', 'Impact', 'sans-serif'],
      },
      colors: {
        sap: {
          blue: '#0070F2',
          dark: '#0a192f',
        }
      },
      backgroundImage: {
        'gradient-conic': 'conic-gradient(var(--conic-position), var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

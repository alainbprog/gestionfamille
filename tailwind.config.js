/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'Inter', 'system-ui', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      colors: {
        cream: '#f6f2ea',
        ink: '#4a4a42',
        brand: {
          50: '#eef4ec',
          100: '#dcebd4',
          200: '#c4dcb8',
          500: '#86ac6f',
          600: '#6f9a58',
          700: '#587c45',
        },
      },
    },
  },
  plugins: [],
}

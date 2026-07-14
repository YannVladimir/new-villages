/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3F2A78',
          hover: '#4B2E9E',
          dark: '#2A1C52',
        },
        background: {
          light: '#F6F5FB',
          dark: '#121212',
        }
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

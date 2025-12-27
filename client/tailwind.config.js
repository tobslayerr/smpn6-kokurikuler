/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb',   
        secondary: '#e11d48', 
        success: '#059669',  
        warning: '#d97706',   
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'], 
      }
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#00A651', dark: '#007a3d', light: '#e6f7ef' }
      }
    }
  },
  plugins: []
}

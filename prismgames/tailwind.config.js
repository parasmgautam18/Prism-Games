/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(320px)' }, // matches h-80
        }
      },
      animation: {
        scanline: 'scanline 3s linear infinite',
      }
    },
  },
  plugins: [],
}
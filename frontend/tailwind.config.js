/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0F172A', // Slate-900
          800: '#1E293B',
          700: '#334155',
        },
        primary: {
          DEFAULT: '#FF4655', // Red sharp
          hover: '#E03E4C'
        }
      },
      boxShadow: {
        'glow': '0 0 15px rgba(255, 70, 85, 0.3)',
      }
    },
  },
  plugins: [],
}

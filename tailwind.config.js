/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: '#070d09', // Deep dark pitch black/green
          900: '#0b160e', // Very dark green
          800: '#122517', // Dark forest green
          700: '#1b3b24', // Medium forest green
          600: '#275232', // Forest green
          500: '#346d43', // Green grass
          400: '#4fa164', // Light green grass
          300: '#75cb8a', // Bright grass green
        },
        trophy: {
          400: '#ffd700', // Gold
          500: '#e5b800', // Deep Gold
          600: '#c69e00', // Darker Gold
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-green': '0 0 15px rgba(52, 109, 67, 0.4)',
        'glow-gold': '0 0 15px rgba(229, 184, 0, 0.4)',
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.4)',
      }
    },
  },
  plugins: [],
}

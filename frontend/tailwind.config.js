/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          bg: '#F5F0FA',
          lavender: '#E9DDF7',
          'soft-purple': '#B88BE8',
          'primary-purple': '#9B5DE5',
          'deep-purple': '#7040B8',
          white: '#FFFFFF',
          'text-primary': '#171525',
          'text-secondary': '#777184',
          'text-muted': '#A9A3B1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass-card': '0 10px 40px rgba(120, 80, 160, 0.08)',
        'glass-button': '0 4px 15px rgba(120, 80, 160, 0.12)',
        'orb-glow': '0 0 60px rgba(155, 93, 229, 0.35)',
      },
      backdropBlur: {
        'glass': '24px',
      }
    },
  },
  plugins: [],
}

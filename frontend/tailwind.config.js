/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Hospital blue/white healthcare palette
        primary: {
          50: '#eef6ff',
          100: '#d9ecff',
          200: '#b8dcff',
          300: '#86c4ff',
          400: '#4aa4ff',
          500: '#1f83f5',
          600: '#0f66d1',
          700: '#0d52a8',
          800: '#0f4487',
          900: '#123a6f',
        },
        accent: {
          teal: '#0ea5a0',
          mint: '#e6fbf6',
        },
        surface: {
          light: '#f7fafc',
          dark: '#0b1220',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Sora"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(15, 68, 135, 0.08)',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Golf Course Greens
        grass: {
          50: '#f7faf7',
          100: '#e8f5e8',
          200: '#d1ebd1',
          300: '#a8dba8',
          400: '#6bc26b',
          500: '#4caf50',
          600: '#3d8b40',
          700: '#2e6b31',
          800: '#1f4a21',
          900: '#0f2910',
        },
        // Sky Blues
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Sunset Oranges
        sunset: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Forest Greens
        forest: {
          50: '#f6f8f6',
          100: '#e9f0e9',
          200: '#d3e1d3',
          300: '#a7c3a7',
          400: '#7ba57b',
          500: '#4f874f',
          600: '#3f6b3f',
          700: '#2f4f2f',
          800: '#1f331f',
          900: '#0f170f',
        },
        // Sand Beige
        sand: {
          50: '#fefefe',
          100: '#fdfcfb',
          200: '#fbf8f5',
          300: '#f7f2eb',
          400: '#f0e8db',
          500: '#e8dcc7',
          600: '#d4c4a8',
          700: '#b8a583',
          800: '#9c8661',
          900: '#7e6b4e',
        },
        // Ocean Blues
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

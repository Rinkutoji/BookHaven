 /** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // BookHaven warm palette
        brand: {
          50:  '#fff8f0',
          100: '#ffeedd',
          200: '#ffd9b3',
          300: '#ffbe80',
          400: '#ff9f4a',
          500: '#f97316', // primary orange
          600: '#ea6d0a',
          700: '#c2560c',
          800: '#9a4510',
          900: '#7c3910',
        },
        cream: {
          50:  '#fdfaf5',
          100: '#faf4e8',
          200: '#f5e8d0',
          300: '#edd8b0',
          400: '#e3c48c',
          500: '#d4a96a',
        },
        warm: {
          50:  '#fdf6ee',
          100: '#faebd7',
          900: '#2d1810',
        },
        ink: {
          DEFAULT: '#1a0f0a',
          light:   '#3d2015',
          muted:   '#7a5c4a',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px rgba(120,60,20,0.10)',
        'warm':    '0 4px 16px rgba(120,60,20,0.12)',
        'warm-lg': '0 8px 32px rgba(120,60,20,0.16)',
        'warm-xl': '0 20px 60px rgba(120,60,20,0.20)',
      },
      backgroundImage: {
        'texture': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c2560c' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn:    { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:   { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { from: { opacity: 0, transform: 'translateY(-8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

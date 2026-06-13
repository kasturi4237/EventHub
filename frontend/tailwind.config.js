/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      colors: {
        violet: {
          25: '#FDFCFF'
        }
      },
      boxShadow: {
        soft: '0 2px 16px rgba(109, 40, 217, 0.07)',
        card: '0 4px 32px rgba(109, 40, 217, 0.10)'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
}

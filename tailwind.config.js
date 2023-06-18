/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        'o': '0px 0px 9px 5px rgba(255, 255, 255, 0.3)',
      },
      keyframes: {
        bgMove: {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        bounce: {
          '0%': { bottom: '4' },
          '100%': { bottom: '1' }
        }
      },
      animation: {
        bgMove: 'bgMove 4s linear infinite',
        bounce: 'bounce 1s ease-in-out alternate infinite'
      },
      transitionProperty: {
        'cardTransition': 'left, transform' 
      }
    },
    backgroundSize: {
      'x2': '200%',
    },
  },
  plugins: [],
}
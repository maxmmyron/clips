/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      animation: {
        notification: 'notification 1s ease-out',
        wiggle: 'wiggle 3s ease-in-out',
      },
      keyframes: {
        notification: {
          'from': {transform: 'translateY(0)', opacity: 1},
          'to': {transform: 'translateY(-100%)', opacity: 0},
        },
        wiggle: {
          '0%': {transform: 'rotate(0deg) scale(1)'},
          '10%': {transform: 'rotate(8deg) scale(1.1) translateX(1px)'},
          '20%': {transform: 'rotate(-8deg) scale(0.9) translateX(-4px)'},
          '30%': {transform: 'rotate(8deg) scale(1.05) translateX(0.85px)'},
          '40%': {transform: 'rotate(-8deg) scale(0.95) translateX(-3px)'},
          '50%': {transform: 'rotate(8deg) scale(1.02) translateX(0.65px)'},
          '60%': {transform: 'rotate(-8deg) scale(0.98) translateX(-2px)'},
          '70%': {transform: 'rotate(8deg) scale(1.01) translateX(0.4px)'},
          '80%': {transform: 'rotate(-8deg) scale(0.99) translateX(-1px)'},
          '90%': {transform: 'rotate(8deg) scale(1.005)'},
          '100%': {transform: 'rotate(0deg) scale(1)'},
        }
      },
      screens: {
        '3xl': '1772px',
      },
      boxShadow: {
        "inner-lg": "inset 0 10px 15px 0 rgba(0, 0, 0, 0.1)",
      }
    },
  },
  safelist: [
    {
      pattern: /from-(neutral|gray)-[0-9]{3}/,
      variants: ['before', 'after'],
    }
  ],
  plugins: [],
}


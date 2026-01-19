/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        card: '#1A1A1A',
        primary: '#6236FF',
        secondary: '#2C2C2E',
      },
      fontFamily: {
        sans: ['Inter_Regular'],
        bold: ['Inter_Bold'],
        hero: ['BebasNeue_Regular'],
      }
    },
  },
  plugins: [],
}

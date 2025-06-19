/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        customGreen: {
          50: "#f3fef8",
          100: "#dcf9e6",
          200: "#adebc6",
          300: "#7ed9a2",
          400: "#4ec77b",
          500: "#27ae60",
          600: "#1f914b",
          700: "#1a743b",
          800: "#165c2e",
          900: "#12381a",
        },
      },
      fontFamily: {
        inter: ["Inter_400Regular"],
        grotesk: ["SpaceGrotesk_700Bold"],
      },
    },
  },
  plugins: [],
};

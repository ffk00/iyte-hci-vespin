const { colors } = require("./src/theme/colors");
const { spacing } = require("./src/theme/spacing");
const { fontFamily, fontSize } = require("./src/theme/typography");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors,
      spacing,
      fontFamily,
      fontSize,
    },
  },
  plugins: [],
};

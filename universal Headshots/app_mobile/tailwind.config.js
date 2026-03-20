/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#8b5cf6", // Violet 500
        background: "#0A0A0F",
      },
    },
  },
  plugins: [],
};

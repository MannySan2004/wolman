/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#e50914",
          black: "#141414",
          dark: "#181818",
        },
      },
    },
  },
  plugins: [],
};

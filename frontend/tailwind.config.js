/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0f1f3d",
          800: "#132a4f",
          900: "#0b1830",
        },
        brand: {
          50: "#eef4ff",
          100: "#dbe8ff",
          200: "#bdd6ff",
          300: "#8fb9ff",
          400: "#5b94ff",
          500: "#2f6bff",
          600: "#1c4fe0",
          700: "#173fb3",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(15, 31, 61, 0.06), 0 1px 6px rgba(15, 31, 61, 0.06)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};

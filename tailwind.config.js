/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF",
        surface: "#F5F7FA",
        ink: "#0A0A0A",
        subtle: "#6B7280",
        accent: "#2563EB",
        border: "#E5E7EB",
        risk: {
          low: "#10B981",
          medium: "#F59E0B",
          high: "#EF4444",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(10, 10, 10, 0.04), 0 1px 3px 0 rgba(10, 10, 10, 0.06)",
      },
    },
  },
  plugins: [],
};

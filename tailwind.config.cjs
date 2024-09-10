/ @type {import('tailwindcss').Config} */;
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E201E",
        "green-01": "#EDF1D6",
        "green-02": "#9DC08B",
        "green-03": "#609966",
        "green-04": "#59875E",
        "green-05": "#40513B",
        "red-01": "#ED2B2A",
        "red-02": "#D21312",
        "orange-01": "#F26419",
        "orange-02": "#F6AE2D",
        "orange-03": "#E25D15",
        "orange-04": "#FF6C22",
        "orange-05": "#F1B648",
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["disabled"],
      cursor: ["disabled"],
    },
  },
  plugins: [],
  fontFamily: {
    body: ["Chakra Petch", "sans-serif"],
    sans: ["Chakra Petch", "sans-serif"],
    screens: {
      sm: "640px",
      md: "768px",
      lg: "960px",
      xl: "1200px",
    },
  },
};

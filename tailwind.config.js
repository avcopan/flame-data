/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      outlineWidth: {
        1: "0.5px",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        flame_data: {
          "color-scheme": "dark",
          primary: "#1db88e",
          "primary-content": "#131616",
          secondary: "#bd93f9",
          accent: "#ffb86c",
          neutral: "#708090",
          "base-100": "#272935",
          "base-content": "#f8f8f2",
          info: "#8be9fd",
          success: "#50fa7b",
          warning: "#f28c18",
          error: "#ff5555",
        },
      },
    ],
  },
};

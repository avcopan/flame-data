/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#FFFF00",
          secondary: "#F28500",
          accent: "#f43f5e",
          neutral: "#374151",
          "base-100": "#212121",
          info: "#c7d2fe",
          success: "#5eead4",
          warning: "#c2410c",
          error: "#7f1d1d",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};

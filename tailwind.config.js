/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      outlineWidth: {
        1: "0.5px",
      },
      height: {
        "screen-most": "80vh",
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
          neutral: "#9ca3af",
          "base-100": "#212121",
          "base-content": "#f8f8f2",
          info: "#8be9fd",
          success: "#50fa7b",
          warning: "#f1fa8c",
          error: "#ff5555",
        },
      },
    ],
  },
};

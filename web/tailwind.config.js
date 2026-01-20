import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light",
      "dark",
      // Custom Web3-themed colors can be added here
      {
        web3: {
          primary: "#6366f1", // Indigo
          secondary: "#8b5cf6", // Purple
          accent: "#ec4899", // Pink
          neutral: "#1f2937", // Gray-800
          "base-100": "#ffffff",
          info: "#3b82f6",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
};

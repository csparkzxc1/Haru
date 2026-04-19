import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        haru: {
          ink: "#1C1C1E",
          paper: "#FAFAF7",
          accent: "#FF6B35",
          muted: "#8E8E93",
        },
      },
      letterSpacing: {
        korean: "-0.01em",
      },
    },
  },
  plugins: [],
};

export default config;

module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        haru: {
          ink: "#1C1C1E",
          paper: "#FAFAF7",
          accent: "#FF6B35",
          muted: "#8E8E93",
        },
      },
    },
  },
  plugins: [],
};

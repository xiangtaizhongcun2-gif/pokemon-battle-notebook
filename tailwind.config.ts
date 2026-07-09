import type { Config } from "tailwindcss";

const config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        notebook: {
          background: "#f7f4ed",
          card: "#fffdf8",
          border: "#ded7ca",
          text: "#172026",
          muted: "#52616b",
          accent: "#8a5a2b",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;

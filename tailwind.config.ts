import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#302a22",
        rust: "#ae472a",
        paper: "#f8f4e9",
        forest: "#393230",
      },
    },
  },
  plugins: [],
} satisfies Config;

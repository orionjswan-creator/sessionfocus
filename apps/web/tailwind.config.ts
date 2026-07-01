import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17201c",
        moss: "#335b4c",
        sage: "#6d8b7f",
        clay: "#a45f4d",
        sun: "#dba943",
        linen: "#f6f2ea"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(23, 32, 28, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;

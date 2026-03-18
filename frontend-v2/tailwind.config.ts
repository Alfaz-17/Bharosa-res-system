import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F5F6FA",
        foreground: "#1A202C",
        sidebar: {
          DEFAULT: "#1A1D2E",
          text: "#A0AEC0",
          active: "#FFFFFF",
        },
        brand: {
          DEFAULT: "#F97316",
          hover: "#EA6C0A",
        },
        subtle: "#718096",
        border: "#E2E8F0",
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#3B82F6",
        card: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 4px rgba(0,0,0,0.08)",
        modal: "0 20px 60px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};
export default config;


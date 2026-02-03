/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: {
          light: "#f8fafc",
          dark: "#0a0e1a",
        },
        card: {
          light: "#ffffff",
          dark: "#1e293b",
        },
        primary: {
          light: "#2563eb",
          dark: "#3b82f6",
        },
        accent: {
          light: "#0ea5e9",
          dark: "#38bdf8",
        },
      },
      boxShadow: {
        soft: "0 10px 40px rgba(15,23,42,0.08)",
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.5)",
        "glow-cyan": "0 0 20px rgba(6, 182, 212, 0.5)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};



/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#F46A35",
          "orange-hover": "#DC5425",
          amber: "#FFB45E",
          "amber-hover": "#EAA04C",
          "orange-light": "#FFF0E8",
          "orange-dark": "#B83A10",
        },
        kb: {
          bg: "var(--kb-bg)",
          surface: "var(--kb-surface)",
          "surface-subtle": "var(--kb-surface-subtle)",
          border: "var(--kb-border)",
          text: "var(--kb-text)",
          muted: "var(--kb-muted)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "zoom-in-95": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out forwards",
        "zoom-in-95": "zoom-in-95 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}

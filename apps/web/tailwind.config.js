/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Semantic tokens driven by CSS variables (see index.css) so the
        // accessibility panel can swap themes (high-contrast, dark) at runtime.
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        brand: "rgb(var(--brand) / <alpha-value>)",
        "brand-soft": "rgb(var(--brand-soft) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        positive: "rgb(var(--positive) / <alpha-value>)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
        reading: "var(--font-reading)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        calm: "0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.10)",
      },
      maxWidth: {
        reading: "42rem",
      },
    },
  },
  plugins: [],
};

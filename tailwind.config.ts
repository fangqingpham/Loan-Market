import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand = warm orange (from the chosen earthy palette). Used for
        // links, icon tiles, primary buttons, and section eyebrows.
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea7317",
          700: "#c2570c",
          800: "#9a4710",
          900: "#7c3d12",
        },
        // "verified"/safe tone — re-themed to a warm bronze/tan from the palette
        // (keeps the same component API while fitting the warm scheme; no green).
        verified: {
          50: "#fbf6ef",
          100: "#f5e9d7",
          200: "#ead2af",
          300: "#dcb784",
          400: "#cd9a5b",
          500: "#bf8443",
          600: "#a86c38",
          700: "#8a5430",
          800: "#71452d",
          900: "#5f3a28",
        },
        // Warm pumpkin-orange accent (#F67531) — the headline CTA / feature-card
        // color. 600 is the exact requested colour; other steps scale around it.
        accent: {
          50: "#fff5ee",
          100: "#ffe8d8",
          200: "#ffcdaf",
          300: "#fdab7d",
          400: "#f9904f",
          500: "#f67e3c",
          600: "#f67531",
          700: "#d65a1e",
          800: "#ad481c",
          900: "#8c3c1b",
        },
        // Warm golden highlight (the yellow swatch) — small highlights/badges.
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97f06",
        },
        // Muted mauve/taupe (the last swatch) — quiet neutral accents.
        mauve: {
          100: "#efe7e6",
          200: "#d9c8c6",
          300: "#bda6a3",
          400: "#9d827f",
          500: "#836663",
        },
        // Deep warm near-black for the hero overlay and dark bands.
        ink: {
          800: "#241715",
          900: "#1a0f0d",
          950: "#120a09",
        },
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 4px 20px -4px rgb(30 20 15 / 0.10)",
        lift: "0 18px 40px -12px rgb(30 20 15 / 0.22)",
        "accent-glow": "0 12px 30px -8px rgb(246 117 49 / 0.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.8s ease-out both",
        float: "float 6s ease-in-out infinite",
        "scale-in": "scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;

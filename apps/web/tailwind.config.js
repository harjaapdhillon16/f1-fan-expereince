/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--f1-ink) / <alpha-value>)",
        carbon: "rgb(var(--f1-carbon) / <alpha-value>)",
        steel: "rgb(var(--f1-steel) / <alpha-value>)",
        redline: "rgb(var(--f1-red) / <alpha-value>)",
        flare: "rgb(var(--f1-flare) / <alpha-value>)",
        ice: "rgb(var(--f1-ice) / <alpha-value>)",
        mist: "rgb(var(--f1-mist) / <alpha-value>)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { opacity: "0", transform: "translateX(-18px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.9s ease-out both",
        "slide-in": "slide-in 0.8s ease-out both",
        "pulse-soft": "pulse-soft 2.6s ease-in-out infinite",
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(circle at top, rgba(225, 6, 0, 0.35), transparent 55%), radial-gradient(circle at bottom, rgba(255, 176, 0, 0.25), transparent 50%)",
      },
      boxShadow: {
        "glow-red": "0 0 40px rgba(225, 6, 0, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;

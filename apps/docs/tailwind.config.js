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
        opsink: "rgb(var(--ops-ink) / <alpha-value>)",
        opspanel: "rgb(var(--ops-panel) / <alpha-value>)",
        opsslate: "rgb(var(--ops-slate) / <alpha-value>)",
        opsred: "rgb(var(--ops-red) / <alpha-value>)",
        opssignal: "rgb(var(--ops-signal) / <alpha-value>)",
        opslime: "rgb(var(--ops-lime) / <alpha-value>)",
        opsfog: "rgb(var(--ops-fog) / <alpha-value>)",
      },
      fontFamily: {
        heading: ["var(--font-ops-heading)", "sans-serif"],
        body: ["var(--font-ops-body)", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        sweep: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s ease-out both",
        sweep: "sweep 0.9s ease-out both",
        pulse: "pulse 2.4s ease-in-out infinite",
      },
      backgroundImage: {
        "ops-gradient":
          "radial-gradient(circle at top, rgba(225, 6, 0, 0.12), transparent 60%), radial-gradient(circle at 70% 120%, rgba(0, 0, 0, 0.06), transparent 45%)",
      },
      boxShadow: {
        "ops-glow": "0 0 32px rgba(225, 6, 0, 0.2)",
        "ops-red": "0 0 26px rgba(225, 6, 0, 0.3)",
      },
    },
  },
  plugins: [],
};

export default config;

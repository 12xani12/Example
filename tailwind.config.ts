import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: { DEFAULT: "#F5D9D8", light: "#FAEBEA" },
        rose: { DEFAULT: "#D98291", light: "#E9AFB9", deep: "#B4596B", deeper: "#9A4657" },
        cream: { DEFAULT: "#FFF9F3", dark: "#F8EEE4" },
        sage: { DEFAULT: "#DCE3D5", dark: "#B9C6AE", deep: "#5E6F55" },
        peach: { DEFAULT: "#F4E4D6", light: "#FAF0E7" },
        charcoal: { DEFAULT: "#302C2B", soft: "#5A5352", muted: "#6F6766" },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      boxShadow: {
        soft: "0 6px 24px -8px rgba(48, 44, 43, 0.12)",
        card: "0 12px 32px -12px rgba(48, 44, 43, 0.22)",
        lift: "0 18px 40px -14px rgba(48, 44, 43, 0.28)",
      },
      borderRadius: { xl2: "1.25rem" },
      keyframes: {
        "fade-up": { "0%": { opacity: "0", transform: "translateY(14px)" }, "100%": { opacity: "1", transform: "none" } },
        "fade-in": { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        "page-turn": { "0%": { opacity: "0.2", transform: "rotateY(-14deg) translateX(-8px)" }, "100%": { opacity: "1", transform: "none" } },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        "fade-in": "fade-in 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const tokenColor = (name: string) => `hsl(var(--${name}))`;

const dualToken = (base: string) => ({
  DEFAULT: tokenColor(base),
  foreground: tokenColor(`${base}-foreground`),
});

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1360px" },
    },
    extend: {
      colors: {
        border: tokenColor("border"),
        input: tokenColor("input"),
        ring: tokenColor("ring"),
        background: tokenColor("background"),
        foreground: tokenColor("foreground"),
        brand: dualToken("brand"),
        primary: dualToken("primary"),
        secondary: dualToken("secondary"),
        destructive: dualToken("destructive"),
        muted: dualToken("muted"),
        accent: dualToken("accent"),
        popover: dualToken("popover"),
        card: dualToken("card"),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "panel-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "panel-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "panel-down": "panel-down 0.2s ease-out",
        "panel-up": "panel-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default config;

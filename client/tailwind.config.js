import { fontFamily } from "tailwindcss/defaultTheme";
import plugin from "tailwindcss/plugin";
import svgToDataUri from "mini-svg-data-uri";
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Sidecar Brand Colors - Indigo/Violet accent
        sidecar: {
          indigo: {
            50: "#eef2ff",
            100: "#e0e7ff",
            200: "#c7d2fe",
            300: "#a5b4fc",
            400: "#818cf8",
            500: "#6366f1",
            600: "#4f46e5",
            700: "#4338ca",
            800: "#3730a3",
            900: "#312e81",
            950: "#1e1b4b",
          },
          violet: {
            50: "#faf5ff",
            100: "#f3e8ff",
            200: "#e9d5ff",
            300: "#d8b4fe",
            400: "#c084fc",
            500: "#a855f7",
            600: "#9333ea",
            700: "#7e22ce",
            800: "#6b21a8",
            900: "#581c87",
            950: "#3b0764",
          },
        },
        // Semantic color mappings
        primary: "var(--color-accent)",
        accent: "var(--color-accent)",
        border: "var(--color-border)",
        background: "var(--color-bg)",
        surface: "var(--color-surface)",
        foreground: "var(--color-text)",
        muted: "var(--color-muted)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", ...fontFamily.sans],
        mono: [
          "JetBrains Mono",
          "IBM Plex Mono",
          "Menlo",
          "Monaco",
          "Courier New",
          ...fontFamily.mono,
        ],
        code: [
          "JetBrains Mono",
          "IBM Plex Mono",
          "Menlo",
          "Monaco",
          ...fontFamily.mono,
        ],
      },
      letterSpacing: {
        tagline: ".15em",
      },
      spacing: {
        0.25: "0.0625rem",
        7.5: "1.875rem",
        15: "3.75rem",
      },
      opacity: {
        15: ".15",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      transitionTimingFunction: {
        DEFAULT: "linear",
      },
      zIndex: {
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
      },
      borderWidth: {
        DEFAULT: "0.0625rem",
      },
      backgroundImage: {
        "radial-gradient": "radial-gradient(var(--tw-gradient-stops))",
        "conic-gradient":
          "conic-gradient(from 225deg, #FFC876, #79FFF7, #9F53FF, #FF98E2, #FFC876)",
      },
    },
  },
  plugins: [
    plugin(
      ({ addBase, addComponents, addUtilities, matchUtilities, theme }) => {
        addBase({});
        addComponents({
          ".container": {
            "@apply max-w-[77.5rem] mx-auto px-5 md:px-10 lg:px-15 xl:max-w-[87.5rem]":
              {},
          },
          ".h1": {
            "@apply font-semibold text-[2.5rem] leading-[3.25rem] md:text-[2.75rem] md:leading-[3.75rem] lg:text-[3.25rem] lg:leading-[4.0625rem] xl:text-[3.75rem] xl:leading-[4.5rem]":
              {},
          },
          ".h2": {
            "@apply text-[1.75rem] leading-[2.5rem] md:text-[2rem] md:leading-[2.5rem] lg:text-[2.5rem] lg:leading-[3.5rem] xl:text-[3rem] xl:leading-tight":
              {},
          },
          ".h3": {
            "@apply text-[2rem] leading-normal md:text-[2.5rem]": {},
          },
          ".h4": {
            "@apply text-[2rem] leading-normal": {},
          },
          ".h5": {
            "@apply text-2xl leading-normal": {},
          },
          ".h6": {
            "@apply font-semibold text-lg leading-8": {},
          },
          ".body-1": {
            "@apply text-[0.875rem] leading-[1.5rem] md:text-[1rem] md:leading-[1.75rem] lg:text-[1.25rem] lg:leading-8":
              {},
          },
          ".body-2": {
            "@apply font-light text-[0.875rem] leading-6 md:text-base": {},
          },
          ".caption": {
            "@apply text-sm": {},
          },
          ".tagline": {
            "@apply font-grotesk font-light text-xs tracking-tagline uppercase":
              {},
          },
          ".quote": {
            "@apply font-code text-lg leading-normal": {},
          },
          ".button": {
            "@apply font-code text-xs font-bold uppercase tracking-wider": {},
          },
        });
        addUtilities({
          ".tap-highlight-color": {
            "-webkit-tap-highlight-color": "rgba(0, 0, 0, 0)",
          },
          ".scrollbar-hide": {
            "-ms-overflow-style": "none",
            "scrollbar-width": "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          },
        });
        matchUtilities(
          {
            "bg-grid": (value) => ({
              backgroundImage: `url("${svgToDataUri(
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="${value}"><path d="M0 .5H31.5V32"/></svg>`,
              )}")`,
            }),
          },
          {
            values: flattenColorPalette(theme("backgroundColor")),
            type: "color",
          },
        );
        matchUtilities(
          {
            highlight: (value) => ({ boxShadow: `inset 0 1px 0 0 ${value}` }),
          },
          {
            values: flattenColorPalette(theme("backgroundColor")),
            type: "color",
          },
        );
      },
    ),
  ],
};

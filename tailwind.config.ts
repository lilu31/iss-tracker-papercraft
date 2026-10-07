import type { Config } from "tailwindcss";

/**
 * Papercraft-Diorama: die Farben sind absichtlich matt und pastellig, weil sie
 * wie Bastelkarton wirken sollen. Es gibt keinen Dark Mode - die App ist ein
 * helles, warmes Bastelprojekt.
 */
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Canvas: warmes, mattes Zeichenpapier
        paper: {
          cream: "#FDF6E9",
          white: "#FFFDF8",
          sand: "#F4E4C4",
          edge: "#E8D5B0",
        },
        // Karte
        ocean: {
          DEFAULT: "#A9D6E5",
          deep: "#8CC5DA",
        },
        land: {
          DEFAULT: "#A9CF9B",
          deep: "#8FBF84",
        },
        // Schrift
        ink: {
          DEFAULT: "#4A3F35",
          soft: "#7A6A58",
          faint: "#B3A48F",
        },
        // Akzente: kraeftiges Bastelpapier
        accent: {
          red: "#E4572E",
          yellow: "#F2B33D",
          blue: "#3E7CB1",
          green: "#5A9E4B",
        },
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "ui-rounded", "system-ui", "sans-serif"],
        display: ["var(--font-baloo)", "var(--font-nunito)", "ui-rounded", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      /**
       * Der harte, versetzte Schatten ist der Trick: weiche Schatten wirken
       * digital, eine harte Kante liest sich als aufeinandergeklebte Papierlage.
       */
      boxShadow: {
        paper:
          "inset 0 2px 0 0 rgba(255,255,255,0.85), 0 4px 0 -1px rgba(190,155,105,0.35), 0 10px 18px -6px rgba(122,94,58,0.35)",
        "paper-lg":
          "inset 0 2px 0 0 rgba(255,255,255,0.85), 0 7px 0 -2px rgba(190,155,105,0.35), 0 20px 30px -10px rgba(122,94,58,0.40)",
        "paper-xl":
          "inset 0 3px 0 0 rgba(255,255,255,0.9), 0 10px 0 -3px rgba(190,155,105,0.35), 0 30px 45px -12px rgba(122,94,58,0.45)",
      },
      keyframes: {
        // Sanftes Wippen - die ISS "schwebt" ueber der Karte.
        bob: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        // Weicher Ring statt hartem Ping.
        halo: {
          "0%": { transform: "scale(0.85)", opacity: "0.65" },
          "100%": { transform: "scale(1.9)", opacity: "0" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0) rotate(-1deg)" },
          "50%": { transform: "translateY(-6px) rotate(1deg)" },
        },
      },
      animation: {
        bob: "bob 3s ease-in-out infinite",
        halo: "halo 2.4s ease-out infinite",
        drift: "drift 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

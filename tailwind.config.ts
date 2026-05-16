import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    /* ── Border radius — exact token values ── */
    borderRadius: {
      none: "0px",
      sm:   "var(--radius-sm)",   /* 8px  */
      md:   "var(--radius-md)",   /* 12px */
      lg:   "var(--radius-lg)",   /* 16px */
      xl:   "var(--radius-xl)",   /* 20px */
      "2xl":"var(--radius-2xl)",  /* 24px */
      full: "var(--radius-full)", /* 9999px */
    },

    extend: {
      /* ── Font family ── */
      fontFamily: {
        gilroy: ["Gilroy", "var(--font-gilroy)", "sans-serif"],
      },

      /* ── Type scale — from font.size tokens ── */
      fontSize: {
        display:  ["64px",  { lineHeight: "1.1",  fontWeight: "800" }],
        h1:       ["48px",  { lineHeight: "1.1",  fontWeight: "700" }],
        h2:       ["36px",  { lineHeight: "1.3",  fontWeight: "700" }],
        h3:       ["28px",  { lineHeight: "1.3",  fontWeight: "600" }],
        h4:       ["22px",  { lineHeight: "1.3",  fontWeight: "600" }],
        h5:       ["18px",  { lineHeight: "1.5",  fontWeight: "600" }],
        "body-lg":["16px",  { lineHeight: "1.6" }],
        body:     ["15px",  { lineHeight: "1.6" }],
        small:    ["13px",  { lineHeight: "1.5" }],
        xs:       ["11px",  { lineHeight: "1.5" }],
        label:    ["10px",  { lineHeight: "1.5", fontWeight: "600" }],
      },

      /* ── Colors — all design system tokens ── */
      colors: {
        /* Brand */
        brand: {
          primary:  "var(--color-brand-primary)",
          light:    "var(--color-brand-primary-light)",
          secondary:"var(--color-brand-secondary)",
          bg:       "var(--color-brand-primary-bg)",
        },
        /* Backgrounds / surfaces */
        surface: {
          page:    "var(--color-bg-page)",
          card:    "var(--color-bg-card)",
          item:    "var(--color-bg-item)",
          overlay: "var(--color-bg-overlay)",
        },
        /* Content / text */
        content: {
          primary:  "var(--color-item-primary)",
          secondary:"var(--color-item-secondary)",
          disabled: "var(--color-item-disabled)",
          inverse:  "var(--color-item-on-brand)",
        },
        /* Strokes / borders */
        stroke: {
          default: "var(--color-border-default)",
          focus:   "var(--color-border-focus)",
          error:   "var(--color-border-error)",
        },
        /* Semantic */
        success:      "var(--color-semantic-success)",
        warning:      "var(--color-semantic-warning)",
        error:        "var(--color-semantic-error)",
        info:         "var(--color-semantic-info)",
        "success-bg": "var(--color-semantic-success-bg)",
        "warning-bg": "var(--color-semantic-warning-bg)",
        "error-bg":   "var(--color-semantic-error-bg)",
        "info-bg":    "var(--color-semantic-info-bg)",
      },

      /* ── Spacing — design system px values ── */
      spacing: {
        "ds-1":  "4px",
        "ds-1.5":"6px",
        "ds-2":  "8px",
        "ds-2.5":"10px",
        "ds-3":  "12px",
        "ds-4":  "16px",
        "ds-5":  "20px",
        "ds-6":  "24px",
        "ds-8":  "32px",
        "ds-10": "40px",
        "ds-12": "48px",
        "ds-16": "64px",
      },

      /* ── Letter spacing — from font.letter-spacing tokens ── */
      letterSpacing: {
        tight:  "var(--ls-tight)",
        normal: "var(--ls-normal)",
        wide:   "var(--ls-wide)",
        widest: "0.15em",
      },
    },
  },
  plugins: [],
};

export default config;

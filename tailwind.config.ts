import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "rgba(var(--primary), <alpha-value>)",
          secondary: "rgba(var(--secondary), <alpha-value>)",
        },
        semantic: {
          success: "rgba(var(--success), <alpha-value>)",
          warning: "rgba(var(--warning), <alpha-value>)",
          error: "rgba(var(--error), <alpha-value>)",
          info: "rgba(var(--info), <alpha-value>)",
        }
      }
    },
  },
  plugins: [],
};
export default config;

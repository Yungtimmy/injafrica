import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        sb: {
          green:      '#006633',
          'green-dark': '#004d26',
          'green-light': '#007a3d',
          yellow:     '#f5c000',
          'yellow-dark': '#d4a800',
          bg:         '#0d130e',
          card:       '#162119',
          'card-2':   '#1e2e22',
          border:     '#2a3f2e',
          muted:      '#6b8070',
          live:       '#e53935',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;

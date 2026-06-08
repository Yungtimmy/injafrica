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
        primary: '#5C4EFF',
        'primary-dark': '#4438e0',
        'primary-light': '#7B6FFF',
        gold: '#FFD700',
        'gold-dark': '#E6C200',
        pitch: '#1a3a2a',
        'pitch-light': '#2d5a3d',
        dark: '#0a0a0f',
        'dark-card': '#12121a',
        'dark-border': '#1e1e2e',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;

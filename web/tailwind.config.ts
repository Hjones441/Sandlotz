import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple:        '#5B21B6',
          'purple-dark': '#1E1040',
          'purple-mid':  '#2D1B69',
          'purple-light':'#7C3AED',
          yellow:        '#EAB308',
          'yellow-bright': '#FFD700',
        },
      },
    },
  },
  plugins: [],
}

export default config

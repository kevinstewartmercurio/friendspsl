/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "background": "var(--background)",
        "primary-text": "var(--primary-text)",
        "secondary-text": "var(--secondary-text)",
        "menu-bg": "var(--menu-bg)",
        "add-player-text": "var(--add-player-text)",
        "add-player-text-hover": "var(--add-player-text-hover)",
        "add-player-bg": "var(--add-player-bg)",
        "add-player-bg-hover": "var(--add-player-bg-hover)",
        "generate-schedule-text": "var(--generate-schedule-text)",
        "generate-schedule-bg": "var(--generate-schedule-bg)",
        "generate-schedule-bg-hover": "var(--generate-schedule-bg-hover)",
        "remove-player-text": "var(--remove-player-text)",
        "remove-player-text-hover": "var(--remove-player-text-hover)",
        "remove-player-bg": "var(--remove-player-bg)",
        "remove-player-bg-hover": "var(--remove-player-bg-hover)",
        "schedule-accent": "var(--schedule-accent)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

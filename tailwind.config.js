/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false, // prevents Tailwind's CSS reset from breaking Angular Material styles
  },
  plugins: [],
};

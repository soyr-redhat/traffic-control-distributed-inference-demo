/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'redhat': {
          red: '#EE0000',
          dark: '#0f0f0f',
          gray: '#3c3f42',
        }
      },
      fontFamily: {
        'display': ['"Red Hat Display"', 'sans-serif'],
        'text': ['"Red Hat Text"', 'sans-serif'],
        'mono': ['"Red Hat Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}

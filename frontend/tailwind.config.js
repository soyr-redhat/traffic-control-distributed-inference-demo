/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber': {
          cyan: '#00ffff',
          magenta: '#ff00ff',
          green: '#00ff41',
          yellow: '#ffff00',
          bg: '#0a0e27',
          'bg-light': '#1a1f3a',
          border: '#00ffff',
          glow: 'rgba(0, 255, 255, 0.5)',
        },
        'redhat': {
          red: '#EE0000',
          dark: '#0f0f0f',
          gray: '#3c3f42',
        }
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'mono': ['"IBM Plex Mono"', 'monospace'],
        'tech': ['"Share Tech Mono"', 'monospace'],
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        pulseNeon: {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
          },
          '50%': {
            opacity: '0.7',
            boxShadow: '0 0 40px rgba(0, 255, 255, 0.5)',
          },
        },
        dataStream: {
          '0%': {
            transform: 'translateY(-100%)',
            opacity: '0',
          },
          '10%': {
            opacity: '1',
          },
          '90%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translateY(100vh)',
            opacity: '0',
          },
        },
      },
      animation: {
        glitch: 'glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite',
        pulseNeon: 'pulseNeon 2s ease-in-out infinite',
        dataStream: 'dataStream 3s linear infinite',
      },
    },
  },
  plugins: [],
}

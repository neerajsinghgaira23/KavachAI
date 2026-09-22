/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soc: {
          canvas: "#020617",      // Slate-950
          card: "#0f172a",        // Slate-900 surface
          inner: "#1e293b",       // Slate-800 elevated
          interactive: "#334155", // Slate-700 interactive
          border: "#1e293b",      // Subtle border
          cyan: "#22d3ee",        // Cyan-400
          emerald: "#34d399",     // Emerald-400
          amber: "#fbbf24",       // Amber-400
          rose: "#f43f5e",        // Rose-500
          crimson: "#e11d48",     // Crimson-600
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radarSweep 2.5s linear infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}

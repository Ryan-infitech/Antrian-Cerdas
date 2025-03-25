/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', "cursive", "system-ui"],
      },
      animation: {
        pulse: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-slow": "pulse 5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-card": "bounce-card 3s infinite",
        "bounce-card-delayed": "bounce-card 3s infinite 0.5s",
        "pixel-glitch": "pixel-glitch 0.3s infinite",
        "pixel-rotate": "pixel-rotate 8s linear infinite",
        "spin-slow": "spin 6s linear infinite",
        "bounce-slow": "bounce 6s infinite",
        ping: "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "bounce-card": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pixel-rotate": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "pixel-float-1": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-15px) rotate(5deg)" },
        },
        "pixel-float-2": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(-5deg)" },
        },
        "pixel-float-3": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(15px)" },
        },
        "pixel-float-4": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(-15px)" },
        },
      },
      transitionDelay: {
        150: "150ms",
        450: "450ms",
        700: "700ms",
      },
    },
  },
  plugins: [],
};

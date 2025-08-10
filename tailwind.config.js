const { hairlineWidth } = require('nativewind/theme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter'],
      },
      colors: {
        // ONLY colors from your shared image - clean and minimal
        base: {
          DEFAULT: '#0B1020', // main background
          900: '#080E19', // deepest background
        },
        primary: {
          light: '#22D3EE', // cyan accent
          DEFAULT: '#14B8A6', // teal accent
          dark: '#0D9488', // deeper teal
        },
        secondary: {
          light: '#60A5FA', // sky blue
          DEFAULT: '#3B82F6', // blue
        },
        // Glass card styling - exact from your config
        card: 'rgba(255,255,255,0.05)',
        cardBorder: 'rgba(255,255,255,0.1)',
        // Text colors
        text: {
          primary: '#FFFFFF',
          secondary: '#CBD5E1',
          muted: '#64748B',
        },
        // Status colors
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      borderRadius: {
        phone: '1.6rem', // matches rounded card edges
      },
      boxShadow: {
        phone: '0 40px 120px -20px rgba(0,0,0,0.6)',
        glass: '0 10px 30px rgba(0,0,0,0.35)',
      },
      keyframes: {
        fadein: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        floatin: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        fadein: 'fadein 0.6s ease-out',
        floatin: 'floatin 0.5s ease-out',
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  plugins: [],
};

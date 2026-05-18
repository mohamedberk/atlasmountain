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
        primary: {
          DEFAULT: 'var(--primary)',
          light: 'var(--primary-light)',
          dark: 'var(--primary-dark)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          light: 'var(--secondary-light)',
          dark: 'var(--secondary-dark)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent-light)',
          dark: 'var(--accent-dark)',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        sand: {
          light: 'var(--sand-light)',
          DEFAULT: 'var(--sand-medium)',
          dark: 'var(--sand-dark)',
        },
        azure: {
          light: 'var(--azure-light)',
          DEFAULT: 'var(--azure-medium)',
          dark: 'var(--azure-dark)',
        },
        sky: {
          light: 'var(--sky-light)',
          DEFAULT: 'var(--sky-medium)',
          dark: 'var(--sky-dark)',
        },
        deep: {
          light: 'var(--deep-light)',
          DEFAULT: 'var(--deep-medium)',
          dark: 'var(--deep-dark)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        card: '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
        'glass-sm': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'glass-lg': '0 12px 40px rgba(0, 0, 0, 0.15)',
        glow: '0 0 15px rgba(40, 110, 179, 0.3)',
        'glow-lg': '0 0 25px rgba(40, 110, 179, 0.5)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-azure': 'linear-gradient(to right, var(--deep-dark), var(--primary))',
        'gradient-sky': 'linear-gradient(to right, var(--azure-light), var(--primary-light))',
        'gradient-ocean': 'linear-gradient(to right, var(--sky-dark), var(--sky-light))',
        'noise-pattern': "url('/img/noise.png')",
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      gridTemplateColumns: {
        'bento': 'repeat(auto-fit, minmax(280px, 1fr))',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 15px rgba(40, 110, 179, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(40, 110, 179, 0.5)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(40, 110, 179, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(40, 110, 179, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

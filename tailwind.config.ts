import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        secondary: 'hsl(var(--secondary))',
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        accent: 'hsl(var(--accent))',
        'accent-foreground': 'hsl(var(--accent-foreground))',
        ring: 'hsl(var(--ring))',
        brand: {
          50: '#faf7f3',
          100: '#f5ebe0',
          200: '#ecd2b8',
          300: '#dfb07f',
          400: '#cf8c52',
          500: '#C17B3C',
          600: '#a86430',
          700: '#854c27',
          800: '#6b3d24',
          900: '#58331f'
        }
      },
      boxShadow: {
        warm: '0 20px 60px rgba(193, 123, 60, 0.16)'
      },
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(circle at top left, rgba(193,123,60,0.14), transparent 34%), radial-gradient(circle at top right, rgba(17,24,39,0.06), transparent 30%), linear-gradient(180deg, #FAFAF8 0%, #ffffff 100%)'
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        }
      },
      animation: {
        marquee: 'marquee 32s linear infinite'
      }
    }
  },
  plugins: []
};

export default config;
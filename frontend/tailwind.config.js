/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
        extend: {
                fontFamily: {
                        outfit: ['Outfit', 'sans-serif'],
                        dm: ['DM Sans', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                },
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                },
                colors: {
                        // Light theme base colors
                        void: '#F8FAFC',
                        surface: '#FFFFFF',
                        // Deep blues for contrast elements
                        deep: {
                                DEFAULT: '#0F172A',
                                50: '#1E293B',
                        },
                        fuchsia: {
                                DEFAULT: '#D946EF',
                                50: '#FDF4FF',
                                100: '#FAE8FF',
                                200: '#F5D0FE',
                                300: '#F0ABFC',
                                400: '#E879F9',
                                500: '#D946EF',
                                600: '#C026D3',
                                700: '#A21CAF',
                                800: '#86198F',
                                900: '#701A75',
                        },
                        // Sky blue spectrum for sunlight effects
                        sky: {
                                50: '#F0F9FF',
                                100: '#E0F2FE',
                                200: '#BAE6FD',
                                300: '#7DD3FC',
                                400: '#38BDF8',
                                500: '#0EA5E9',
                                600: '#0284C7',
                                700: '#0369A1',
                        },
                        flesh: {
                                DEFAULT: '#E7D5C9',
                                dim: '#CFB8A7',
                                light: '#F5EDE8',
                        },
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary))',
                                foreground: 'hsl(var(--primary-foreground))'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary))',
                                foreground: 'hsl(var(--secondary-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        }
                },
                keyframes: {
                        'accordion-down': {
                                from: { height: '0' },
                                to: { height: 'var(--radix-accordion-content-height)' }
                        },
                        'accordion-up': {
                                from: { height: 'var(--radix-accordion-content-height)' },
                                to: { height: '0' }
                        },
                        'pulse-glow': {
                                '0%, 100%': { boxShadow: '0 0 10px rgba(217, 70, 239, 0.3)' },
                                '50%': { boxShadow: '0 0 30px rgba(217, 70, 239, 0.6)' }
                        },
                        'float': {
                                '0%, 100%': { transform: 'translateY(0)' },
                                '50%': { transform: 'translateY(-10px)' }
                        },
                        'shimmer': {
                                '0%': { backgroundPosition: '-200% 0' },
                                '100%': { backgroundPosition: '200% 0' }
                        },
                        'prism': {
                                '0%, 100%': { 
                                        backgroundPosition: '0% 50%',
                                        filter: 'hue-rotate(0deg)'
                                },
                                '50%': { 
                                        backgroundPosition: '100% 50%',
                                        filter: 'hue-rotate(30deg)'
                                }
                        },
                        'sunbeam': {
                                '0%': { opacity: '0.3', transform: 'translateX(-100%)' },
                                '50%': { opacity: '0.6' },
                                '100%': { opacity: '0.3', transform: 'translateX(100%)' }
                        },
                        'typing': {
                                '0%, 60%, 100%': { transform: 'translateY(0)' },
                                '30%': { transform: 'translateY(-8px)' }
                        },
                        'flame': {
                                '0%, 100%': { transform: 'scale(1) rotate(-2deg)' },
                                '50%': { transform: 'scale(1.1) rotate(2deg)' }
                        }
                },
                animation: {
                        'accordion-down': 'accordion-down 0.2s ease-out',
                        'accordion-up': 'accordion-up 0.2s ease-out',
                        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                        'float': 'float 3s ease-in-out infinite',
                        'shimmer': 'shimmer 3s linear infinite',
                        'prism': 'prism 8s ease infinite',
                        'sunbeam': 'sunbeam 4s ease-in-out infinite',
                        'typing': 'typing 1.4s infinite',
                        'flame': 'flame 1s ease-in-out infinite alternate'
                }
        }
  },
  plugins: [require("tailwindcss-animate")],
};

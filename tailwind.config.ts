import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';
import defaultTheme from 'tailwindcss/defaultTheme';
export default {
    darkMode: 'class',
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        screens: {
            xxs: '420px',
            xs: '468px',
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1160px',
            '2xl': '1280px',
            '3xl': '1500px',
            '4xl': '1640px',
            '5xl': '1920px',
        },
        extend: {
            spacing: {
                ...defaultTheme.spacing,
                common: '0.75rem',
                'common-multiplied': `${0.75 * 2}rem`,
            },
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                'primary-white': 'hsl(var(--primary-white))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                dropdown: 'hsl(var(--dropdown-bg))',
                black: {
                    DEFAULT: 'hsl(var(--black))',
                },
                'forground-border':
                    'hsla(var(--fg-border), var(--tw-bg-opacity, 1))',
                'dark-gray': {
                    DEFAULT: 'hsl(var(--dark-gray))',
                },
                gray: {
                    DEFAULT: 'hsl(var(--gray))',
                },
                'primary-light': {
                    DEFAULT: 'hsl(var(--primary-light))',
                },
                'border-primary-light': {
                    DEFAULT: 'hsl(var(--border-primary-light))',
                },
                warning: {
                    DEFAULT: 'hsl(var(--warning))',
                },
                purple: {
                    DEFAULT: 'hsl(var(--purple))',
                },
                'pure-white': {
                    DEFAULT: 'hsl(var(--pure-white))',
                },
                'pure-black': {
                    DEFAULT: 'hsl(var(--pure-black))',
                },
                heading: 'hsl(var(--heading))',
                danger: {
                    DEFAULT: 'hsl(var(--danger))',
                },
                shiny: {
                    DEFAULT: 'hsl(var(--shiny))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))',
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground':
                        'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground':
                        'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            animation: {
                'star-movement-bottom':
                    'star-movement-bottom linear infinite alternate',
                'star-movement-top':
                    'star-movement-top linear infinite alternate',
                shine: 'shine 5s linear infinite',
                'fade-left': 'fade-left 1s ease-in-out',
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'border-glow': 'borderGlow 2s infinite alternate ease-in-out',
            },

            keyframes: {
                shimmer: {
                    '0%': {
                        transform: 'translateX(-100%)',
                    },
                    '100%': {
                        transform: 'translateX(100%)',
                    },
                },
                'star-movement-bottom': {
                    '0%': {
                        transform: 'translate(0%, 0%)',
                        opacity: '1',
                    },
                    '100%': {
                        transform: 'translate(-100%, 0%)',
                        opacity: '0',
                    },
                },
                'star-movement-top': {
                    '0%': {
                        transform: 'translate(0%, 0%)',
                        opacity: '1',
                    },
                    '100%': {
                        transform: 'translate(100%, 0%)',
                        opacity: '0',
                    },
                },
                shine: {
                    '0%': {
                        'background-position': '100%',
                    },
                    '100%': {
                        'background-position': '-100%',
                    },
                },
                'fade-left': {
                    '0%': {
                        opacity: '0',
                    },
                    '100%': {
                        opacity: '1',
                    },
                },
                'accordion-down': {
                    from: {
                        height: '0',
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)',
                    },
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)',
                    },
                    to: {
                        height: '0',
                    },
                },
                borderGlow: {
                    '0%': {
                        boxShadow: '0 0 5px hsl(var(--primary))',
                    },
                    '50%': {
                        boxShadow: '0 0 15px hsl(var(--primary))',
                    },
                    '100%': {
                        boxShadow: '0 0 5px hsl(var(--primary))',
                    },
                },
            },
        },
    },
    plugins: [tailwindcssAnimate, require('tailwindcss-animate')],
} satisfies Config;

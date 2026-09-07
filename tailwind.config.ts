import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors - New Premium Palette
        "amber-gold": "#C8956C",
        "warm-terra": "#8B7355",

        // Secondary Colors
        "blush-cream": "#E8D5C4",
        "sage-mist": "#9CAF88",
        "dusty-blue": "#8BA4B4",

        // Neutrals - Warm Palette
        "deep-espresso": "#3D3330",
        "warm-charcoal": "#5C534E",
        "neutral-warm-gray": "#9E948A",
        "stone": "#D4CCC5",
        "cream": "#FAF7F4",
        "pure-white": "#FFFFFF",

        // Legacy colors (kept for backward compatibility)
        "sunrise-gold": "#C8956C", // Updated to amber-gold
        "ocean-teal": "#8BA4B4", // Updated to dusty-blue
        "gold": "#C8956C",
        "care-green": "#9CAF88", // Updated to sage-mist
        "warm-sand": "#E8D5C4", // Updated to blush-cream
        "soft-coral": "#E8A598",
        "sky-blue": "#8BA4B4", // Updated to dusty-blue
        "charcoal": "#3D3330", // Updated to deep-espresso
        "medium-gray": "#6B6B6B",
        "light-gray": "#B0B0B0",
        "silver-mist": "#E8E8E8",
        "off-white": "#FAF7F4", // Updated to cream

        // Functional Colors
        "success": "#7A9B76",
        "warning": "#D4A84B",
        "error": "#C4756A",
        "info": "#7A9BB4",

        // Background & Foreground
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "system-ui",
          "sans-serif"
        ],
        heading: [
          "var(--font-playfair)",
          "Georgia",
          "serif"
        ]
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#3D3330',
            a: {
              color: '#C8956C',
              '&:hover': {
                color: '#8B7355',
              },
            },
            h1: {
              color: '#3D3330',
            },
            h2: {
              color: '#3D3330',
            },
            h3: {
              color: '#3D3330',
            },
            h4: {
              color: '#3D3330',
            },
            strong: {
              color: '#3D3330',
            },
          },
        },
      },
      // === Editorial Typography ===
      fontSize: {
        'editorial-xs': '0.875rem',
        'editorial-sm': '1rem',
        'editorial-base': '1.125rem',
        'editorial-lg': '1.25rem',
        'editorial-xl': '1.5rem',
        'editorial-2xl': '2rem',
        'editorial-3xl': '2.5rem',
        'editorial-4xl': '3.5rem',
        'editorial-5xl': '5rem',
        'editorial-6xl': '6.5rem',
      },
      // === Editorial Spacing ===
      spacing: {
        'editorial-xs': '1rem',
        'editorial-sm': '1.5rem',
        'editorial-md': '2.5rem',
        'editorial-lg': '4rem',
        'editorial-xl': '6rem',
        'editorial-2xl': '10rem',
      },
      padding: {
        'editorial': 'var(--space-editorial-lg)',
        'editorial-lg': 'var(--space-editorial-xl)',
        'editorial-xl': 'var(--space-editorial-2xl)',
      },
      margin: {
        'editorial': 'var(--space-editorial-lg)',
        'editorial-lg': 'var(--space-editorial-xl)',
        'editorial-xl': 'var(--space-editorial-2xl)',
      },
      // === Editorial Easing ===
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slow': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1000': '1000ms',
      },
      // === Editorial Grid ===
      gridColumn: {
        'span-3': 'span 3',
        'span-4': 'span 4',
        'span-5': 'span 5',
        'span-6': 'span 6',
        'span-7': 'span 7',
        'span-8': 'span 8',
        'asymmetric-left': '1 / 7',
        'asymmetric-right': '7 / 13',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        "accordion-up": {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out"
      }
    }
  },
  plugins: [],
};
export default config;

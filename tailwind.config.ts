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
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			'sunrise-gold': '#F5A623',
  			'ocean-teal': '#2AAAA0',
  			gold: '#F5A623',
  			'care-green': '#2AAAA0',
  			'warm-sand': '#E8DDD4',
  			'soft-coral': '#E8A598',
  			'sky-blue': '#8FBCD4',
  			charcoal: '#2D2D2D',
  			'medium-gray': '#6B6B6B',
  			'light-gray': '#B0B0B0',
  			'silver-mist': '#E8E8E8',
  			'off-white': '#FAF8F5'
  		},
  		fontFamily: {
  			sans: [
  				'var(--font-inter)',
  				'system-ui',
  				'sans-serif'
  			],
  			heading: [
  				'var(--font-playfair)',
  				'Georgia',
  				'serif'
  			]
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [],
};
export default config;

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			screens: {
				'3xl': '2400px',
			},
			keyframes: {
        slide: {
          '0%': {
            transform: 'translateY(-1000px)',
						visibility: 'hidden',
          },
          '100%': {
            transform: 'translateY(0px)',
						visibility: 'visible',
          },
        },
      },
			animation: {
				slide: 'slide 1s ease-in-out',
			},
			fontFamily: {
				sans: ['VT323', 'monospace']
			}
		},
	},
	plugins: [],
}

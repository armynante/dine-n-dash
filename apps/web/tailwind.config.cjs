/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
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
				sans: ['Inconsolata','monospace']
			}
		},
	},
	plugins: [],
}

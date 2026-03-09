/** @type {import('tailwindcss').Config} */
module.exports = {
	// Указываем все файлы где используются классы Tailwind
	content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			// Токены из дизайн-системы FitnessUp
			colors: {
				background: '#0a0a0a', // тёмный фон
				surface: '#141414', // карточки
				primary: '#0072f5', // синий акцент
				foreground: '#f4f4f5', // основной текст
				muted: '#71717a', // второстепенный текст
				border: '#27272a' // границы
			},
			fontFamily: {
				sans: ['Geist'],
				mono: ['GeistMono']
			}
		}
	},
	plugins: []
}

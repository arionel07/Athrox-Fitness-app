/**
 * @file app/_layout.tsx
 * @description Корневой layout — загружает шрифты и инициализирует БД.
 */

import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect } from 'react'
import { DatabaseProvider } from '../src/shared/db/DatabaseProvider'

// Держим splash screen пока не загрузятся шрифты
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
	const [fontsLoaded, fontError] = useFonts({
		// Geist — основной шрифт
		Geist: require('../assets/fonts/Geist-Regular.ttf'),
		'Geist-Medium': require('../assets/fonts/Geist-Medium.ttf'),
		'Geist-SemiBold': require('../assets/fonts/Geist-SemiBold.ttf'),
		'Geist-Bold': require('../assets/fonts/Geist-Bold.ttf'),
		// Geist Mono — для чисел и метрик
		GeistMono: require('../assets/fonts/GeistMono-Regular.ttf'),
		'GeistMono-Medium': require('../assets/fonts/GeistMono-Medium.ttf'),
		'GeistMono-SemiBold': require('../assets/fonts/GeistMono-SemiBold.ttf'),
		'GeistMono-Bold': require('../assets/fonts/GeistMono-Bold.ttf')
	})

	useEffect(() => {
		// Скрываем splash как только шрифты загружены
		if (fontsLoaded || fontError) {
			SplashScreen.hideAsync()
		}
	}, [fontsLoaded, fontError])

	if (!fontsLoaded && !fontError) return null
	return (
		<DatabaseProvider>
			<Stack screenOptions={{ headerShown: false }} />
		</DatabaseProvider>
	)
}

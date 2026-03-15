/**
 * @file app/_layout.tsx
 * @description Корневой layout — шрифты + анимированный сплэш с буквой А.
 */

import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions } from 'react-native'
import Svg, { Line } from 'react-native-svg'
import { DatabaseProvider } from '../src/shared/db/DatabaseProvider'

SplashScreen.preventAutoHideAsync()

const { width, height } = Dimensions.get('window')

// ─── Анимированный сплэш ──────────────────────────────────────────
function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
	const opacity = useRef(new Animated.Value(0)).current
	const scale = useRef(new Animated.Value(0.85)).current
	const bgOpacity = useRef(new Animated.Value(1)).current

	useEffect(() => {
		Animated.sequence([
			Animated.delay(100),

			// Буква появляется
			Animated.parallel([
				Animated.timing(opacity, {
					toValue: 1,
					duration: 600,
					useNativeDriver: true
				}),
				Animated.spring(scale, {
					toValue: 1,
					friction: 8,
					tension: 40,
					useNativeDriver: true
				})
			]),

			// Держим
			Animated.delay(800),

			// Уходим
			Animated.parallel([
				Animated.timing(opacity, {
					toValue: 0,
					duration: 400,
					useNativeDriver: true
				}),
				Animated.timing(bgOpacity, {
					toValue: 0,
					duration: 400,
					useNativeDriver: true
				})
			])
		]).start(() => onFinish())
	}, [])

	return (
		<Animated.View
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width,
				height,
				backgroundColor: '#0a0a0a',
				alignItems: 'center',
				justifyContent: 'center',
				zIndex: 999,
				opacity: bgOpacity
			}}
		>
			<Animated.View style={{ opacity, transform: [{ scale }] }}>
				<Svg
					width={160}
					height={160}
					viewBox="0 0 100 100"
					fill="none"
				>
					{/* Левая нога А — 5 линий */}
					{[0, 1.5, 3, 4.5, 6].map((offset, i) => (
						<Line
							key={`l${i}`}
							x1={10 + offset}
							y1={95}
							x2={50 + offset * 0.3}
							y2={8}
							stroke="white"
							strokeWidth="1"
							strokeLinecap="round"
						/>
					))}

					{/* Правая нога А — 5 линий */}
					{[0, 1.5, 3, 4.5, 6].map((offset, i) => (
						<Line
							key={`r${i}`}
							x1={90 - offset}
							y1={95}
							x2={50 - offset * 0.3}
							y2={8}
							stroke="white"
							strokeWidth="1"
							strokeLinecap="round"
						/>
					))}

					{/* Перекладина А — 5 линий */}
					{[0, 1.5, 3, 4.5, 6].map((offset, i) => (
						<Line
							key={`m${i}`}
							x1={28}
							y1={58 + offset}
							x2={72}
							y2={58 + offset}
							stroke="white"
							strokeWidth="1"
							strokeLinecap="round"
						/>
					))}
				</Svg>
			</Animated.View>
		</Animated.View>
	)
}

// ─── Root Layout ──────────────────────────────────────────────────
export default function RootLayout() {
	const [fontsLoaded, fontError] = useFonts({
		Geist: require('../assets/fonts/Geist-Regular.ttf'),
		'Geist-Medium': require('../assets/fonts/Geist-Medium.ttf'),
		'Geist-SemiBold': require('../assets/fonts/Geist-SemiBold.ttf'),
		'Geist-Bold': require('../assets/fonts/Geist-Bold.ttf'),
		GeistMono: require('../assets/fonts/GeistMono-Regular.ttf'),
		'GeistMono-Medium': require('../assets/fonts/GeistMono-Medium.ttf'),
		'GeistMono-SemiBold': require('../assets/fonts/GeistMono-SemiBold.ttf'),
		'GeistMono-Bold': require('../assets/fonts/GeistMono-Bold.ttf')
	})

	const [showSplash, setShowSplash] = useState(true)

	useEffect(() => {
		if (fontsLoaded || fontError) {
			SplashScreen.hideAsync()
		}
	}, [fontsLoaded, fontError])

	if (!fontsLoaded && !fontError) return null

	return (
		<DatabaseProvider>
			<Stack screenOptions={{ headerShown: false }} />
			{showSplash && <AnimatedSplash onFinish={() => setShowSplash(false)} />}
		</DatabaseProvider>
	)
}

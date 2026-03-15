/**
 * @file widgets/RestTimer/RestTimer.tsx
 * @description Таймер отдыха между подходами.
 *
 * Логика:
 * — Запускается автоматически когда подход отмечен выполненным
 * — Показывает оставшееся время большим шрифтом
 * — Кнопки +15с / -15с / сброс
 * — Вибрация и звук когда время вышло
 * — Пресеты: 60с / 90с / 120с / 180с
 */

import * as Haptics from 'expo-haptics'
import { memo, useCallback, useEffect, useRef } from 'react'
import { TouchableOpacity, View } from 'react-native'
import Animated, {
	Easing,
	useAnimatedProps,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import Svg, {
	Circle,
	Path,
	Polygon,
	Rect,
	Text as SvgText
} from 'react-native-svg'
import { useTimerStore } from '../../shared/store/timer.store'
import { Colors, Spacing } from '../../shared/theme/tokens.theme'
import { BottomSheet } from '../../shared/ui/BottomSheet'
import { Text } from '../../shared/ui/Text'

const AnimatedCircle = Animated.createAnimatedComponent(Circle)

const PRESETS = [60, 90, 120, 180]

// Круговой прогресс
const RADIUS = 54
const STROKE = 6
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60)
	const s = seconds % 60
	return `${m}:${String(s).padStart(2, '0')}`
}

export const RestTimer = memo(() => {
	const {
		isVisible,
		isRunning,
		duration,
		remaining,
		hide,
		setRemaining,
		setRunning,
		show
	} = useTimerStore()

	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
	const progress = useSharedValue(1)

	// Анимация прогресс-кольца
	const animatedProps = useAnimatedProps(() => ({
		strokeDashoffset: CIRCUMFERENCE * (1 - progress.value)
	}))

	// Запуск/остановка таймера
	useEffect(() => {
		if (isRunning && isVisible) {
			intervalRef.current = setInterval(() => {
				const current = useTimerStore.getState().remaining
				if (current <= 1) {
					setRemaining(0)
					setRunning(false)
					clearInterval(intervalRef.current!)
					// Вибрация — работает на реальном устройстве
					Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
				} else {
					setRemaining(current - 1)
				}
			}, 1000)
		} else {
			if (intervalRef.current) clearInterval(intervalRef.current)
		}
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current)
		}
	}, [isRunning, isVisible])

	// Анимируем кольцо при изменении remaining
	useEffect(() => {
		progress.value = withTiming(duration > 0 ? remaining / duration : 0, {
			duration: 900,
			easing: Easing.linear
		})
	}, [remaining, duration])

	const handleClose = useCallback(() => {
		if (intervalRef.current) clearInterval(intervalRef.current)
		hide()
	}, [hide])

	const handleAdjust = useCallback(
		(delta: number) => {
			const next = Math.max(5, Math.min(600, remaining + delta))
			setRemaining(next)
		},
		[remaining]
	)

	const handlePreset = useCallback(
		(secs: number) => {
			show(secs)
		},
		[show]
	)

	const handleToggle = useCallback(() => {
		setRunning(!isRunning)
	}, [isRunning])

	const handleReset = useCallback(() => {
		setRemaining(duration)
		setRunning(true)
	}, [duration])

	const isDone = remaining === 0

	return (
		<BottomSheet
			visible={isVisible}
			onClose={handleClose}
			sheetHeight={360}
		>
			<View style={{ flex: 1, paddingHorizontal: Spacing.xl, gap: Spacing.md }}>
				{/* Заголовок */}
				<Text
					variant="label"
					style={{ textAlign: 'center' }}
				>
					{isDone ? 'Отдых завершён!' : 'Отдых'}
				</Text>
				{/* Круговой таймер */}
				<View
					style={{
						alignItems: 'center',
						justifyContent: 'center',
						height: 130
					}}
				>
					<Svg
						width={130}
						height={130}
						viewBox="0 0 130 130"
					>
						{/* Фон кольца */}
						<Circle
							cx="65"
							cy="65"
							r={RADIUS}
							stroke={Colors.border}
							strokeWidth={STROKE}
							fill="none"
						/>
						{/* Прогресс */}
						<AnimatedCircle
							cx="65"
							cy="65"
							r={RADIUS}
							stroke={isDone ? Colors.success : Colors.primary}
							strokeWidth={STROKE}
							fill="none"
							strokeDasharray={CIRCUMFERENCE}
							animatedProps={animatedProps}
							strokeLinecap="round"
							rotation="-90"
							origin="65, 65"
						/>
						{/* Время — внутри SVG, всегда поверх кольца */}
						<SvgText
							x="65"
							y="72"
							fontSize="26"
							fontFamily="GeistMono"
							fontWeight="600"
							fill={isDone ? Colors.success : Colors.foreground}
							textAnchor="middle"
							letterSpacing="1"
						>
							{formatTime(remaining)}
						</SvgText>
					</Svg>
				</View>
				{/* +/- кнопки */}
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'center',
						gap: Spacing.xl
					}}
				>
					{/* −15 */}
					<TouchableOpacity
						onPress={() => handleAdjust(-15)}
						style={{
							width: 44,
							height: 44,
							borderRadius: 22,
							backgroundColor: Colors.background,
							borderWidth: 1,
							borderColor: Colors.border,
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<Text
							variant="bodySmall"
							color={Colors.muted}
						>
							−15
						</Text>
					</TouchableOpacity>

					{/* Старт / Пауза / Сброс */}
					<TouchableOpacity
						onPress={isDone ? handleReset : handleToggle}
						style={{
							width: 52,
							height: 52,
							borderRadius: 26,
							backgroundColor: isDone ? Colors.success : Colors.primary,
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						{isDone ? (
							// Иконка сброса — стрелка по кругу
							<Svg
								width={22}
								height={22}
								viewBox="0 0 24 24"
								fill="none"
							>
								<Path
									d="M1 4v6h6M23 20v-6h-6"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
								<Path
									d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</Svg>
						) : isRunning ? (
							// Иконка паузы
							<Svg
								width={20}
								height={20}
								viewBox="0 0 24 24"
								fill="none"
							>
								<Rect
									x="6"
									y="4"
									width="4"
									height="16"
									rx="1"
									fill="white"
								/>
								<Rect
									x="14"
									y="4"
									width="4"
									height="16"
									rx="1"
									fill="white"
								/>
							</Svg>
						) : (
							// Иконка плей
							<Svg
								width={20}
								height={20}
								viewBox="0 0 24 24"
								fill="none"
							>
								<Polygon
									points="5,3 19,12 5,21"
									fill="white"
								/>
							</Svg>
						)}
					</TouchableOpacity>

					{/* +15 */}
					<TouchableOpacity
						onPress={() => handleAdjust(15)}
						style={{
							width: 44,
							height: 44,
							borderRadius: 22,
							backgroundColor: Colors.background,
							borderWidth: 1,
							borderColor: Colors.border,
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<Text
							variant="bodySmall"
							color={Colors.muted}
						>
							+15
						</Text>
					</TouchableOpacity>
				</View>
				{/* Пресеты */}
				<View style={{ flexDirection: 'row', gap: Spacing.sm }}>
					{PRESETS.map(secs => (
						<TouchableOpacity
							key={secs}
							onPress={() => handlePreset(secs)}
							style={{
								flex: 1,
								paddingVertical: Spacing.xs,
								borderRadius: 8,
								borderWidth: 1,
								borderColor: duration === secs ? Colors.primary : Colors.border,
								backgroundColor:
									duration === secs ? 'rgba(0,114,245,0.1)' : 'transparent',
								alignItems: 'center'
							}}
						>
							<Text
								variant="metricTiny"
								color={duration === secs ? Colors.primary : Colors.muted}
							>
								{secs < 60 ? `${secs}с` : `${secs / 60}м`}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			</View>
		</BottomSheet>
	)
})

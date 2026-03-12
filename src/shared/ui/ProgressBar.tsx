/**
 * @file shared/ui/ProgressBar.tsx
 * @description Прогресс-бар с анимацией заполнения.
 *
 * Оптимизация:
 * — Анимация через Reanimated (не JS thread)
 * — useEffect запускает анимацию только при изменении progress
 * — memo предотвращает лишние ре-рендеры
 */

import { memo, useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { Colors, Radius, Spacing } from '../theme/tokens.theme'
import { Text } from './Text'

interface IProgressBarProps {
	// Значение от 0 до 1 (0.7 = 70%)
	progress: number
	label?: string
	valueLabel?: string // текст справа ("1800 / 2200 ккал")
	color?: string
	height?: number
}

export const ProgressBar = memo(
	({
		progress,
		color = Colors.primary,
		height = 4,
		label,
		valueLabel
	}: IProgressBarProps) => {
		// Clamp: значение всегда между 0 и 1
		const clampedProgress = Math.min(1, Math.max(0, progress))

		// Shared value живёт на UI thread — анимация без JS
		const width = useSharedValue(0)

		useEffect(() => {
			// Плавное заполнение за 600ms при монтировании или изменении
			width.value = withTiming(clampedProgress, {
				duration: 600,
				easing: Easing.out(Easing.cubic)
			})
		}, [clampedProgress])

		const animatedStyle = useAnimatedStyle(() => ({
			width: `${width.value * 100}%`
		}))

		return (
			<View>
				{/* Заголовок и значение */}
				{(label || valueLabel) && (
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							marginBottom: Spacing.xs
						}}
					>
						{label && <Text variant="bodySmall">{label}</Text>}
						{valueLabel && (
							<Text
								variant="metricTiny"
								color={Colors.muted}
							>
								{valueLabel}
							</Text>
						)}

						{/* Трек */}
						<View
							style={{
								height,
								backgroundColor: Colors.border,
								borderRadius: Radius.full,
								overflow: 'hidden'
							}}
						>
							{/* Заполнение с анимацией */}
							<Animated.View
								style={[
									{
										height: '100%',
										backgroundColor: color,
										borderRadius: Radius.full
									},
									animatedStyle
								]}
							/>
						</View>
					</View>
				)}
			</View>
		)
	}
)

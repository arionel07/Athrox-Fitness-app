/**
 * @file shared/ui/ProgressBar.tsx
 * @description Прогресс-бар с анимацией заполнения.
 *
 * Оптимизация:
 * — onLayout получает реальную ширину контейнера в пикселях
 * — Reanimated анимирует в пикселях — надёжно на всех устройствах
 * — memo предотвращает лишние ре-рендеры
 */

import { memo, useEffect, useState } from 'react'
import { LayoutChangeEvent, View } from 'react-native'
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { Colors, Radius, Spacing } from '../theme/tokens.theme'
import { Text } from './Text'

interface IProgressBarProps {
	progress: number // 0 до 1
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
		// Clamp значение между 0 и 1
		const clampedProgress = Math.min(1, Math.max(0, progress))

		// Реальная ширина контейнера в пикселях
		const [containerWidth, setContainerWidth] = useState(0)

		// Анимированное значение ширины заполнения
		const animatedWidth = useSharedValue(0)

		// Получаем ширину контейнера после рендера
		const onLayout = (e: LayoutChangeEvent) => {
			setContainerWidth(e.nativeEvent.layout.width)
		}

		// Запускаем анимацию когда знаем ширину и progress
		useEffect(() => {
			if (containerWidth === 0) return

			animatedWidth.value = withTiming(containerWidth * clampedProgress, {
				duration: 600,
				easing: Easing.out(Easing.cubic)
			})
		}, [clampedProgress, containerWidth])

		const animatedStyle = useAnimatedStyle(() => ({
			width: animatedWidth.value
		}))

		return (
			<View>
				{/* Заголовок и значение */}
				{(label || valueLabel) && (
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center',
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
					</View>
				)}

				{/* Трек */}
				<View
					onLayout={onLayout}
					style={{
						height,
						backgroundColor: Colors.border,
						borderRadius: Radius.full,
						overflow: 'hidden'
					}}
				>
					{/* Заполнение */}
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
		)
	}
)

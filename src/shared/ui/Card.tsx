/**
 * @file shared/ui/Card.tsx
 * @description Основной контейнер интерфейса.
 *
 * Из дизайн-системы:
 * — 16px radius
 * — 1px border
 * — тёмный фон #141414
 * — glassmorphism вариант для overlay элементов
 */

type TCardVariant = 'default' | 'glass' | 'outlined'
import { memo } from 'react'
import { View, type ViewProps, type ViewStyle } from 'react-native'
import { Colors, Radius, Shadows, Spacing } from '../theme/tokens.theme'

interface ICardProps extends ViewProps {
	variant?: TCardVariant
	padding?: number
}

// Стили по варианту — вычисляем один раз вне компонента
const variantStyles: Record<TCardVariant, ViewStyle> = {
	default: {
		backgroundColor: Colors.surface,
		borderWidth: 1,
		borderColor: Colors.border
	},
	glass: {
		// Glassmorphism — полупрозрачный фон
		backgroundColor: 'rgba(255,255,255,0.04)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.08)'
	},
	outlined: {
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderColor: Colors.border,
		borderStyle: 'dashed'
	}
}

export const Card = memo(
	({
		variant = 'default',
		padding = Spacing.lg,
		style,
		children,
		...props
	}: ICardProps) => {
		return (
			<View
				style={[
					{
						borderRadius: Radius.lg,
						padding,
						...Shadows.card
					},
					variantStyles[variant],
					style
				]}
			>
				{children}
			</View>
		)
	}
)

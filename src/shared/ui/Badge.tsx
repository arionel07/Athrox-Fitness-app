/**
 * @file shared/ui/Badge.tsx
 * @description Маленький тег для статусов и метрик.
 *
 * Варианты:
 * — success: зелёный — рост показателей
 * — danger: красный — падение
 * — warning: жёлтый — предупреждения
 * — default: серый — нейтральный статус
 */

import { memo } from 'react'
import { View } from 'react-native'
import { Colors, Radius, Spacing } from '../theme/tokens.theme'
import { Text } from './Text'

type TBadgeVariant = 'default' | 'success' | 'danger' | 'warning' | 'info'

interface IBadgeProps {
	label: string
	variant?: TBadgeVariant
}

// Цвета фона и текста по варианту
const badgeStyles: Record<TBadgeVariant, { bg: string; text: string }> = {
	default: { bg: Colors.surface, text: Colors.muted },
	success: { bg: 'rgba(23, 201, 100, 0.12)', text: Colors.success },
	danger: { bg: 'rgba(243, 18, 96, 0.12)', text: Colors.danger },
	warning: { bg: 'rgba(245, 165, 36, 0.12)', text: Colors.warning },
	info: { bg: 'rgba(0, 114, 245, 0.12)', text: Colors.info }
}

export const Badge = memo(({ label, variant = 'default' }: IBadgeProps) => {
	const { bg, text } = badgeStyles[variant]

	return (
		<View
			style={{
				backgroundColor: bg,
				borderRadius: Radius.full,
				paddingHorizontal: Spacing.md,
				paddingVertical: Spacing.xs,
				alignSelf: 'flex-start'
			}}
		>
			<Text
				variant="metricTiny"
				color={text}
				style={{ fontWeight: '600' }}
			>
				{label}
			</Text>
		</View>
	)
})

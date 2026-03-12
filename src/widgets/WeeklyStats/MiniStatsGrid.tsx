/**
 * @file widgets/WeeklyStats/MiniStatsGrid.tsx
 * @description 2x2 сетка мини-карточек — Сон / Белок / Вес / Ккал.
 * Из дизайн-системы: секция "Восстановление".
 */

import { memo } from 'react'
import { View } from 'react-native'
import { Spacing } from '../../shared/theme/tokens.theme'
import { Badge } from '../../shared/ui/Badge'
import { Card } from '../../shared/ui/Card'
import { Text } from '../../shared/ui/Text'

interface IMiniStatItem {
	label: string
	value: string
	unit: string
	// Для Badge — показывает изменение
	delta?: string
	deltaVariant?: 'success' | 'danger' | 'warning' | 'default'
}

interface IMiniStatsGridProps {
	sleep: IMiniStatItem
	protein: IMiniStatItem
	weight: IMiniStatItem
	calories: IMiniStatItem
}

// ─── Одна мини-карточка ───────────────────────────────────────────
const MiniStatCard = memo(
	({ label, value, unit, delta, deltaVariant }: IMiniStatItem) => {
		return (
			<Card
				padding={Spacing.md}
				style={{ flex: 1 }}
			>
				<Text
					variant="label"
					style={{ marginBottom: Spacing.sm }}
				>
					{label}
				</Text>

				<View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
					<Text variant="metricSmall">{value}</Text>
					<Text variant="metricTiny">{unit}</Text>
				</View>

				{delta && (
					<Badge
						variant={deltaVariant ?? 'default'}
						label={delta}
					/>
				)}
			</Card>
		)
	}
)

// ─── 2×2 сетка ────────────────────────────────────────────────────
export const MiniStatsGrid = memo(
	({ sleep, protein, weight, calories }: IMiniStatsGridProps) => {
		return (
			<View style={{ gap: Spacing.sm }}>
				{/* Строка 1: Сон + Белок */}
				<View style={{ flexDirection: 'row', gap: Spacing.sm }}>
					<MiniStatCard {...sleep} />
					<MiniStatCard {...protein} />
				</View>
				{/* Строка 2: Вес + Ккал */}
				<View style={{ flexDirection: 'row', gap: Spacing.sm }}>
					<MiniStatCard {...weight} />
					<MiniStatCard {...calories} />
				</View>
			</View>
		)
	}
)

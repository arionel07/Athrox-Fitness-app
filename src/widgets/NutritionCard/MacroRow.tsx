/**
 * @file widgets/NutritionCard/MacroRow.tsx
 * @description Строка макронутриента с прогресс-баром.
 */

import { memo } from 'react'
import { View } from 'react-native'
import { ProgressBar } from '../../shared/ui/ProgressBar'

interface MacroRowProps {
	label: string
	current: number
	goal: number
	unit: string
	color: string
}

export const MacroRow = memo(
	({ label, current, goal, unit, color }: MacroRowProps) => (
		<View style={{ gap: 4 }}>
			<ProgressBar
				progress={goal > 0 ? current / goal : 0}
				label={label}
				valueLabel={`${current} / ${goal} ${unit}`}
				color={color}
			/>
		</View>
	)
)

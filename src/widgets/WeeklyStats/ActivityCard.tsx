/**
 * @file widgets/WeeklyStats/ActivityCard.tsx
 * @description Карточка активности — прогресс-бары тренировок/питания/сна.
 *
 * Из дизайн-системы: Activity Card — кольца + 3 прогресс-бара.
 * Упрощённая версия без SVG колец — добавим кольца позже.
 */

import { memo } from 'react'
import { View } from 'react-native'
import { Colors, Spacing } from '../../shared/theme/tokens.theme'
import { Card } from '../../shared/ui/Card'
import { ProgressBar } from '../../shared/ui/ProgressBar'
import { Text } from '../../shared/ui/Text'

interface IActivityCardProps {
	// Тренировки
	workoutsThisWeek: number
	workoutsGoal: number
	// Калории
	avgCalories: number
	caloriesGoal: number
	// Сон

	avgSleepHours: number
	sleepGoal: number
}

export const ActivityCard = memo(
	({
		workoutsThisWeek,
		workoutsGoal,
		avgCalories,
		caloriesGoal,
		avgSleepHours,
		sleepGoal
	}: IActivityCardProps) => {
		return (
			<Card>
				<Text
					variant="label"
					style={{ marginBottom: Spacing.lg }}
				>
					Активность недели
				</Text>

				<View>
					{/* Тренировки */}
					<ProgressBar
						progress={workoutsGoal > 0 ? workoutsThisWeek / workoutsGoal : 0}
						label="Тренировки"
						valueLabel={`${workoutsThisWeek} / ${workoutsGoal}`}
						color={Colors.primary}
					/>
					{/* Калории */}
					<ProgressBar
						progress={caloriesGoal > 0 ? avgCalories / caloriesGoal : 0}
						label="Калории"
						valueLabel={`${Math.round(avgCalories)} / ${caloriesGoal} ккал`}
						color={Colors.success}
					/>
					{/* Сон */}
					<ProgressBar
						progress={sleepGoal > 0 ? avgSleepHours / sleepGoal : 0}
						label="Сон"
						valueLabel={`${avgSleepHours.toFixed(1)} / ${sleepGoal}Ч`}
						color={Colors.warning}
					/>
				</View>
			</Card>
		)
	}
)

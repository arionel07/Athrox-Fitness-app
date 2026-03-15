/**
 * @file widgets/WorkoutTemplate/TemplateCard.tsx
 * @description Карточка шаблона тренировки.
 */

import { memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { IWorkoutTemplate } from '../../entities/template/template.type'
import { Colors, Spacing } from '../../shared/theme/tokens.theme'
import { Badge } from '../../shared/ui/Badge'
import { Card } from '../../shared/ui/Card'
import { Text } from '../../shared/ui/Text'

const TYPE_LABELS: Record<string, string> = {
	strength: 'Силовая',
	cardio: 'Кардио',
	stretching: 'Растяжка'
}

const TYPE_VARIANTS: Record<string, 'info' | 'success' | 'warning'> = {
	strength: 'info',
	cardio: 'success',
	stretching: 'warning'
}
interface TemplateCardProps {
	template: IWorkoutTemplate
	onUse: (template: IWorkoutTemplate) => void
	onDelete: (id: string) => void
}

export const TemplateCard = memo(
	({ template, onUse, onDelete }: TemplateCardProps) => {
		const totalSets = template.exercises.reduce(
			(s, ex) => s + ex.sets.length,
			0
		)

		return (
			<Card style={{ gap: Spacing.sm }}>
				{/* Заголовок */}
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'flex-start'
					}}
				>
					<View style={{ flex: 1, gap: 4 }}>
						<Text variant="body">{template.name}</Text>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								gap: Spacing.sm
							}}
						>
							<Badge
								label={TYPE_LABELS[template.type] ?? template.type}
								variant={TYPE_VARIANTS[template.type] ?? 'default'}
							/>
							<Text
								variant="metricTiny"
								color={Colors.muted}
							>
								{template.exercises.length} упр · {totalSets} подх
							</Text>
						</View>
					</View>
					<TouchableOpacity
						onPress={() => onDelete(template.id)}
						activeOpacity={0.7}
					>
						<Text
							variant="metricTiny"
							color={Colors.danger}
						>
							Удалить
						</Text>
					</TouchableOpacity>
				</View>

				{/* Список упражнений */}
				<View style={{ gap: 2 }}>
					{template.exercises.map(ex => (
						<View
							key={ex.id}
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								gap: Spacing.sm
							}}
						>
							<View
								style={{
									width: 4,
									height: 4,
									borderRadius: 2,
									backgroundColor: Colors.muted
								}}
							/>
							<Text
								variant="bodySmall"
								color={Colors.muted}
							>
								{ex.name}
								{ex.sets.length > 0 && (
									<Text
										variant="metricTiny"
										color={Colors.border}
									>
										{' '}
										· {ex.sets.length} подх
									</Text>
								)}
							</Text>
						</View>
					))}
				</View>

				{/* Использовать */}
				<TouchableOpacity
					onPress={() => onUse(template)}
					activeOpacity={0.7}
					style={{
						backgroundColor: Colors.primary,
						borderRadius: 8,
						paddingVertical: Spacing.sm,
						alignItems: 'center',
						marginTop: 4
					}}
				>
					<Text
						variant="bodySmall"
						color={Colors.foreground}
					>
						Использовать шаблон
					</Text>
				</TouchableOpacity>
			</Card>
		)
	}
)

/**
 * @file widgets/WorkoutHistory/WorkoutHistoryCard.tsx
 * @description Карточка одной прошлой тренировки в списке истории.
 */

import { memo, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { IWorkoutSession } from '../../entities/workout/workout.type'
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

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	})
}

function formatDuration(startedAt: string, finishedAt: string): string {
	const diff = new Date(finishedAt).getTime() - new Date(startedAt).getTime()
	const mins = Math.round(diff / 60000)
	if (mins < 60) return `${mins} мин`
	return `${Math.floor(mins / 60)}ч ${mins % 60}м`
}

function totalSets(session: IWorkoutSession): number {
	return session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
}
function totalValue(session: IWorkoutSession): number {
	return session.exercises.reduce(
		(sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
		0
	)
}

interface WorkoutHistoryCardProps {
	session: IWorkoutSession
	onDelete: (id: string) => void
}

export const WorkoutHistoryCard = memo(
	({ session, onDelete }: WorkoutHistoryCardProps) => {
		const [expanded, setExpanded] = useState(false)

		const volume = totalValue(session)
		const sets = totalSets(session)

		return (
			<Card style={{ gap: Spacing.sm }}>
				{/* Заголовок */}
				<TouchableOpacity
					onPress={() => setExpanded(v => !v)}
					activeOpacity={0.7}
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'flex-start'
					}}
				>
					<View style={{ flex: 1, gap: 4 }}>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								gap: Spacing.sm
							}}
						>
							<Badge
								label={TYPE_LABELS[session.type] ?? session.type}
								variant={TYPE_VARIANTS[session.type] ?? 'default'}
							/>
							<Text
								variant="metricTiny"
								color={Colors.muted}
							>
								{formatDate(session.startedAt)}
							</Text>
						</View>

						{/* Статистика */}

						<View
							style={{ flexDirection: 'row', gap: Spacing.lg, marginTop: 4 }}
						>
							<View>
								<Text
									variant="metricTiny"
									color={Colors.muted}
								>
									Упражнений
								</Text>
								<Text variant="bodySmall">{session.exercises.length}</Text>
							</View>
							<View>
								<Text
									variant="metricTiny"
									color={Colors.muted}
								>
									Подходов
								</Text>
								<Text variant="bodySmall">{sets}</Text>
							</View>
							{volume > 0 && (
								<View>
									<Text
										variant="metricTiny"
										color={Colors.muted}
									>
										Объём
									</Text>
									<Text variant="bodySmall">
										{Math.round((volume / 1000) * 10) / 10}т
									</Text>
								</View>
							)}
							<View>
								<Text
									variant="metricTiny"
									color={Colors.muted}
								>
									Время
								</Text>
								<Text variant="bodySmall">
									{formatDuration(session.startedAt, session.finishedAt)}
								</Text>
							</View>
						</View>
					</View>

					<Text
						variant="metricTiny"
						color={Colors.muted}
					>
						{expanded ? '▲' : '▼'}
					</Text>
				</TouchableOpacity>

				{/* Детали — упражнения */}
				{expanded && (
					<View
						style={{
							gap: Spacing.sm,
							borderTopWidth: 1,
							borderTopColor: Colors.border,
							paddingTop: Spacing.sm
						}}
					>
						{session.exercises.map(ex => (
							<View
								key={ex.id}
								style={{ gap: 4 }}
							>
								<Text variant="bodySmall">{ex.name}</Text>
								<View
									style={{
										flexDirection: 'row',
										flexWrap: 'wrap',
										gap: Spacing.xs
									}}
								>
									{ex.sets.map((set, i) => (
										<View
											key={set.id}
											style={{
												backgroundColor: set.completed
													? 'rgba(0,114,245,0.15)'
													: Colors.surface,
												borderWidth: 1,
												borderColor: set.completed
													? Colors.primary
													: Colors.border,
												borderRadius: 6,
												paddingHorizontal: Spacing.sm,
												paddingVertical: 3
											}}
										>
											<Text
												variant="metricTiny"
												color={set.completed ? Colors.primary : Colors.muted}
												style={{ fontFamily: 'GeistMono' }}
											>
												{set.weight}×{set.reps}
											</Text>
										</View>
									))}
								</View>
							</View>
						))}

						{/* Удалить */}
						<TouchableOpacity
							onPress={() => onDelete(session.id)}
							activeOpacity={0.7}
							style={{ alignSelf: 'flex-end', paddingVertical: 4 }}
						>
							<Text
								variant="metricTiny"
								color={Colors.danger}
							>
								Удалить тренировку
							</Text>
						</TouchableOpacity>
					</View>
				)}
			</Card>
		)
	}
)

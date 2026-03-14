/**
 * @file widgets/WorkoutCard/ExerciseCard.tsx
 * @description Карточка упражнения — название + список подходов.
 *
 * Локальный state для подходов — при сохранении тренировки
 * данные уходят в родительский компонент через onUpdate.
 */

import React, { memo, useCallback, useEffect, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'

import { generateId } from '../../shared/hooks/useId.hook'
import { Colors, Spacing } from '../../shared/theme/tokens.theme'
import { Card } from '../../shared/ui/Card'
import { Input } from '../../shared/ui/Input'
import { Text } from '../../shared/ui/Text'
import { SetRow } from './SetRow'

// ─── Локальный тип подхода для UI state ───────────────────────────
// Вес и повторения храним как строки — TextInput работает со строками

interface ILocalSet {
	id: string
	weight: string
	reps: string
	completed: boolean
}

interface IExerciseCardProps {
	index: number
	onUpdate: (name: string, local: ILocalSet[]) => void
	onDelete: () => void
}

export const ExerciseCard = memo(
	({ index, onUpdate, onDelete }: IExerciseCardProps) => {
		const [name, setName] = useState('')
		const [sets, setSets] = useState<ILocalSet[]>([
			// Начинаем с одного пустого подхода
			{ id: generateId(), weight: '', reps: '', completed: false }
		])

		// ── Уведомляем родителя через useEffect — не во время рендера ───
		useEffect(() => {
			onUpdate(name, sets)
		}, [name, sets])

		const handleNameChange = useCallback((value: string) => {
			setName(value)
		}, [])

		const handleWeightChange = useCallback((setId: string, value: string) => {
			setSets(prev =>
				prev.map(s => (s.id === setId ? { ...s, weight: value } : s))
			)
		}, [])

		const handleRepsChange = useCallback((setId: string, value: string) => {
			setSets(prev =>
				prev.map(s => (s.id === setId ? { ...s, reps: value } : s))
			)
		}, [])

		const handleToggleCompleted = useCallback((setId: string) => {
			setSets(prev =>
				prev.map(s => (s.id === setId ? { ...s, completed: !s.completed } : s))
			)
		}, [])

		const handleDeleteSet = useCallback((setId: string) => {
			setSets(prev => {
				if (prev.length <= 1) return prev
				return prev.filter(s => s.id !== setId)
			})
		}, [])

		const handleAddSet = useCallback(() => {
			setSets(prev => {
				const lastSet = prev[prev.length - 1]
				return [
					...prev,
					{
						id: generateId(),
						weight: lastSet?.weight ?? '',
						reps: '',
						completed: false
					}
				]
			})
		}, [])

		return (
			<Card style={{ gap: Spacing.md }}>
				{/* Заголовок карточки */}
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center'
					}}
				>
					<Text
						variant="bodySmall"
						color={Colors.muted}
					>
						Упражнение {index + 1}
					</Text>
					<TouchableOpacity
						onPress={onDelete}
						activeOpacity={0.7}
					>
						<Text
							variant="bodySmall"
							color={Colors.danger}
						>
							Удалить
						</Text>
					</TouchableOpacity>
				</View>
				{/* Название упражнения */}
				<Input
					value={name}
					onChangeText={handleNameChange}
					placeholder="Название упражнения"
					returnKeyType="done"
				/>
				{/* Заголовок колонок */}
				<View
					style={{
						flexDirection: 'row',
						gap: Spacing.sm,
						paddingHorizontal: 2
					}}
				>
					<Text
						variant="label"
						style={{ width: 20 }}
					>
						#
					</Text>
					<Text
						variant="label"
						style={{ flex: 1, textAlign: 'center' }}
					>
						Вес
					</Text>
					<Text
						variant="label"
						style={{ width: 16 }}
					/>
					<Text
						variant="label"
						style={{ flex: 1, textAlign: 'center' }}
					>
						Reps
					</Text>
					{/* Место под чекбокс и удаление */}
					<View style={{ width: 28 + 28 + Spacing.sm }} />
				</View>
				{/* Подходы */}
				{sets.map((set, setIndex) => (
					<SetRow
						key={set.id}
						index={setIndex + 1}
						weight={set.weight}
						reps={set.reps}
						completed={set.completed}
						onChangeWeight={v => handleWeightChange(set.id, v)}
						onChangeReps={v => handleRepsChange(set.id, v)}
						onToggleCompleted={() => handleToggleCompleted(set.id)}
						onDelete={() => handleDeleteSet(set.id)}
					/>
				))}
				{/* Добавить подход */}
				<TouchableOpacity
					onPress={handleAddSet}
					activeOpacity={0.7}
					style={{
						borderWidth: 1,
						borderColor: Colors.border,
						borderStyle: 'dashed',
						borderRadius: 8,
						paddingVertical: Spacing.sm,
						alignItems: 'center'
					}}
				>
					<Text
						variant="bodySmall"
						color={Colors.muted}
					>
						+ Добавить подход
					</Text>
				</TouchableOpacity>
			</Card>
		)
	}
)

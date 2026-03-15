/**
 * @file app/(tabs)/workout.tsx
 * @description Экран записи тренировки — в разработке.
 */

import { router, useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TouchableOpacity,
	View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TWorkoutType } from '../../src/entities/workout/workout.type'
import { generateId } from '../../src/shared/hooks/useId.hook'
import { useWorkouts } from '../../src/shared/hooks/useWorkouts.hook'
import { useTemplateStore } from '../../src/shared/store/template.store'
import { Colors, Spacing } from '../../src/shared/theme/tokens.theme'
import { Button } from '../../src/shared/ui/Button'
import { Card } from '../../src/shared/ui/Card'
import {
	CalendarIcon,
	CardioIcon,
	StrengthIcon,
	StretchingIcon
} from '../../src/shared/ui/Icons'
import { Text } from '../../src/shared/ui/Text'
import { RestTimer } from '../../src/widgets/RestTimer/RestTimer'
import { ExerciseCard } from '../../src/widgets/WorkoutCard/ExerciseCard'

// ─── Иконки для типов тренировок ──────────────────────────────────

const TYPE_ICONS = {
	strength: StrengthIcon,
	cardio: CardioIcon,
	stretching: StretchingIcon
}

// ─── Типы тренировок ──────────────────────────────────────────────
const WORKOUT_TYPES: { key: TWorkoutType; label: string }[] = [
	{ key: 'strength', label: ' Силовая' },
	{ key: 'cardio', label: 'Кардио' },
	{ key: 'stretching', label: 'Растяжка' }
]

// ─── Локальный тип для упражнений в UI state ──────────────────────
interface ILocalExercise {
	id: string
	name: string
	sets: {
		id: string
		weight: string
		reps: string
		completed: boolean
	}[]
}

export default function WorkoutScreen() {
	const { createSession } = useWorkouts()

	const { templateId } = useLocalSearchParams<{ templateId?: string }>()
	const templates = useTemplateStore(s => s.templates)

	// ── State ──────────────────────────────────────────────────────
	const [workoutType, setWorkoutType] = useState<TWorkoutType>('strength')
	const [exercises, setExercises] = useState<ILocalExercise[]>([
		{
			id: generateId(),
			name: '',
			sets: [{ id: generateId(), weight: '', reps: '', completed: false }]
		}
	])
	const [isSaving, setIsSaving] = useState(false)

	// ── Добавляем упражнение ───────────────────────────────────────
	const handleAddExercise = useCallback(() => {
		setExercises(prev => [
			...prev,
			{
				id: generateId(),
				name: '',
				sets: [{ id: generateId(), weight: '', reps: '', completed: false }]
			}
		])
	}, [])

	// ── Удаляем упражнение ─────────────────────────────────────────
	const handleDeleteExercise = useCallback((id: string) => {
		setExercises(prev => {
			if (prev.length <= 1) return prev
			return prev.filter(ex => ex.id !== id)
		})
	}, [])

	// ── Обновляем данные упражнения из ExerciseCard ────────────────
	const handleUpdateExercise = useCallback(
		(id: string, name: string, sets: ILocalExercise['sets']) => {
			setExercises(prev =>
				prev.map(ex => (ex.id === id ? { ...ex, name, sets } : ex))
			)
		},
		[]
	)

	// ── Сброс формы ───────────────────────────────────────────────
	const handleReset = useCallback(() => {
		Alert.alert('Сбросить тренировку?', 'Все введённые данные будут удалены.', [
			{ text: 'Отмена', style: 'cancel' },
			{
				text: 'Сбросить',
				style: 'destructive',
				onPress: () => {
					;(setWorkoutType('strength'),
						setExercises([
							{
								id: generateId(),
								name: '',
								sets: [
									{ id: generateId(), weight: '', reps: '', completed: false }
								]
							}
						]))
				}
			}
		])
	}, [])

	// ── Сохраняем тренировку ───────────────────────────────────────
	const handleSave = useCallback(async () => {
		// Валидация: хотя бы одно упражнение с названием
		const validExercises = exercises.filter(ex => ex.name.trim().length > 0)
		if (validExercises.length === 0) {
			Alert.alert('Ошибка', 'Добавьте хотя бы одно упражнение с названием')
			return
		}

		setIsSaving(true)

		const result = await createSession({
			type: workoutType,
			title: '',
			notes: '',
			startedAt: new Date().toISOString(),
			exercises: validExercises.map(ex => ({
				name: ex.name.trim(),
				sort_order: 0,
				// Сохраняем только подходы с данными
				sets: ex.sets
					.filter(s => s.weight || s.reps)
					.map(s => ({
						weight: parseFloat(s.weight) || 0,
						reps: parseFloat(s.reps) || 0,
						completed: s.completed,
						createdAt: new Date().toISOString()
					}))
			}))
		})

		setIsSaving(false)

		if (result) {
			Alert.alert('Готово!', 'Тренировка сохранена ✓', [
				{
					text: 'OK',
					onPress: () => {
						// Сбрасываем форму после сохранения
						setExercises([
							{
								id: generateId(),
								name: '',
								sets: [
									{ id: generateId(), weight: '', reps: '', completed: false }
								]
							}
						])
					}
				}
			])
		}
	}, [exercises, workoutType, createSession])

	// ── Текущая дата/время ─────────────────────────────────────────
	const dateLabel = new Date().toLocaleDateString('ru-RU', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	})

	// Загружаем шаблон когда templateId меняется
	useEffect(() => {
		if (!templateId) return
		const template = templates.find(t => t.id === templateId)
		if (!template) return

		setWorkoutType(template.type) // ← не забываем тип

		setExercises(
			template.exercises.map(ex => ({
				id: generateId(),
				name: ex.name,
				sets:
					ex.sets.length > 0
						? ex.sets.map(s => ({
								id: generateId(),
								weight: s.weight ? String(s.weight) : '',
								reps: s.reps ? String(s.reps) : '',
								completed: false
							}))
						: [{ id: generateId(), weight: '', reps: '', completed: false }]
			}))
		)
	}, [templateId, templates])

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: Colors.background }}
			edges={['top']}
		>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={0}
			>
				<ScrollView
					contentContainerStyle={{
						paddingHorizontal: Spacing.lg,
						paddingTop: Spacing.xl,
						paddingBottom: 120,
						gap: Spacing.lg
					}}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					{/* ── Header ──────────────────────────────────────────── */}
					<View style={{ gap: Spacing.sm }}>
						<Text variant="h2">Новая тренировка</Text>
						<View style={{ flexDirection: 'row', gap: Spacing.md }}>
							<TouchableOpacity
								onPress={() => router.push('/workout-templates')}
								activeOpacity={0.7}
							>
								<Text
									variant="bodySmall"
									color={Colors.muted}
								>
									Шаблоны
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={() => router.push('/workout-history')}
								activeOpacity={0.7}
							>
								<Text
									variant="bodySmall"
									color={Colors.muted}
								>
									История
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								onPress={handleReset}
								activeOpacity={0.7}
							>
								<Text
									variant="bodySmall"
									color={Colors.muted}
								>
									Сбросить
								</Text>
							</TouchableOpacity>
						</View>
					</View>

					{/* ── Тип тренировки ──────────────────────────────────── */}
					<View style={{ gap: Spacing.sm }}>
						<Text variant="label">Тип тренировки</Text>
						<View style={{ flexDirection: 'row', gap: Spacing.sm }}>
							{WORKOUT_TYPES.map(({ key, label }) => {
								const Icon = TYPE_ICONS[key]
								const isActive = workoutType === key
								return (
									<TouchableOpacity
										key={key}
										onPress={() => setWorkoutType(key)}
										activeOpacity={0.7}
										style={{
											flex: 1,
											paddingVertical: Spacing.sm,
											paddingHorizontal: Spacing.sm,
											borderRadius: 8,
											borderWidth: 1,
											borderColor: isActive ? Colors.primary : Colors.border,
											backgroundColor: isActive
												? 'rgba(0,114,245,0.1)'
												: Colors.surface,
											alignItems: 'center',
											gap: 4
										}}
									>
										<Icon
											color={isActive ? Colors.primary : Colors.muted}
											size={16}
										/>
										<Text
											style={{ textAlign: 'center' }}
											variant="bodySmall"
											color={
												workoutType === key ? Colors.primary : Colors.muted
											}
										>
											{label}
										</Text>
									</TouchableOpacity>
								)
							})}
						</View>
					</View>

					{/* ── Дата ────────────────────────────────────────────── */}
					<Card
						variant="glass"
						padding={Spacing.md}
					>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								gap: Spacing.sm
							}}
						>
							<CalendarIcon
								color={Colors.muted}
								size={16}
							/>
							<Text variant="weekLabel">{dateLabel}</Text>
						</View>
					</Card>

					{/* ── Упражнения ──────────────────────────────────────── */}
					<View style={{ gap: Spacing.sm }}>
						<Text variant="label">Упражнения</Text>
						{exercises.map((ex, index) => (
							<ExerciseCard
								key={ex.id}
								index={index}
								initialName={ex.name}
								initialSets={ex.sets}
								onUpdate={(name, sets) =>
									handleUpdateExercise(ex.id, name, sets)
								}
								onDelete={() => handleDeleteExercise(ex.id)}
							/>
						))}
					</View>

					{/* ── Добавить упражнение ─────────────────────────────── */}
					<TouchableOpacity
						onPress={handleAddExercise}
						activeOpacity={0.7}
						style={{
							borderWidth: 1,
							borderColor: Colors.border,
							borderStyle: 'dashed',
							borderRadius: 12,
							paddingVertical: Spacing.lg,
							alignItems: 'center',
							gap: Spacing.xs
						}}
					>
						<Text
							variant="h3"
							color={Colors.muted}
						>
							+
						</Text>
						<Text
							variant="bodySmall"
							color={Colors.muted}
						>
							Добавить упражнение
						</Text>
					</TouchableOpacity>

					{/* ── Сохранить ───────────────────────────────────────── */}
					<Button
						label="Сохранить тренировку"
						variant="primary"
						size="lg"
						fullWidth
						isLoading={isSaving}
						onPress={handleSave}
					/>
				</ScrollView>
			</KeyboardAvoidingView>
			<RestTimer />
		</SafeAreaView>
	)
}

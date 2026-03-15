/**
 * @file app/workout-templates.tsx
 * @description Экран шаблонов тренировок.
 */

import { router } from 'expo-router'
import { useCallback, useState } from 'react'
import { Alert, ScrollView, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
	IWorkoutTemplate,
	TCreateTemplateDTO
} from '../src/entities/template/template.type'
import { generateId } from '../src/shared/hooks/useId.hook'
import { useTemplates } from '../src/shared/hooks/useTemplates'
import { useTemplateStore } from '../src/shared/store/template.store'
import { Colors, Spacing } from '../src/shared/theme/tokens.theme'
import { Button } from '../src/shared/ui/Button'
import { Card } from '../src/shared/ui/Card'
import { Input } from '../src/shared/ui/Input'
import { Text } from '../src/shared/ui/Text'
import { TemplateCard } from '../src/widgets/WorkoutTemplate/TemplateCard'

const WORKOUT_TYPES: { key: IWorkoutTemplate['type']; label: string }[] = [
	{ key: 'strength', label: 'Силовая' },
	{ key: 'cardio', label: 'Кардио' },
	{ key: 'stretching', label: 'Растяжка' }
]

interface LocalExercise {
	id: string
	name: string
	sets: { weight: string; reps: string }[]
}

export default function WorkoutTemplatesScreen() {
	const templates = useTemplateStore(s => s.templates)
	const { createTemplate, removeTemplate } = useTemplates()

	const [showForm, setShowForm] = useState(false)
	const [isSaving, setIsSaving] = useState(false)

	// Форма
	const [templateName, setTemplateName] = useState('')
	const [templateType, setTemplateType] =
		useState<IWorkoutTemplate['type']>('strength')
	const [exercises, setExercises] = useState<LocalExercise[]>([
		{ id: generateId(), name: '', sets: [{ weight: '', reps: '' }] }
	])

	const handleAddExercise = () => {
		setExercises(prev => [
			...prev,
			{ id: generateId(), name: '', sets: [{ weight: '', reps: '' }] }
		])
	}

	const handleAddSet = (exId: string) => {
		setExercises(prev =>
			prev.map(ex =>
				ex.id === exId
					? { ...ex, sets: [...ex.sets, { weight: '', reps: '' }] }
					: ex
			)
		)
	}

	const handleSave = useCallback(async () => {
		if (!templateName.trim()) {
			Alert.alert('Ошибка', 'Введите название шаблона')
			return
		}
		const validExercises = exercises.filter(ex => ex.name.trim())
		if (!validExercises.length) {
			Alert.alert('Ошибка', 'Добавьте хотя бы одно упражнение')
			return
		}

		setIsSaving(true)
		const dto: TCreateTemplateDTO = {
			name: templateName.trim(),
			type: templateType,
			exercises: validExercises.map((ex, i) => ({
				id: generateId(),
				name: ex.name.trim(),
				sort_order: i,
				sets: ex.sets
					.filter(s => s.weight || s.reps)
					.map(s => ({
						weight: parseFloat(s.weight) || 0,
						reps: parseInt(s.reps) || 0
					}))
			}))
		}

		const result = await createTemplate(dto)
		setIsSaving(false)

		if (result) {
			setShowForm(false)
			setTemplateName('')
			setExercises([
				{ id: generateId(), name: '', sets: [{ weight: '', reps: '' }] }
			])
			Alert.alert('Готово', 'Шаблон создан ✓')
		}
	}, [templateName, templateType, exercises, createTemplate])

	const handleDelete = useCallback(
		(id: string) => {
			Alert.alert('Удалить шаблон?', 'Это действие нельзя отменить.', [
				{ text: 'Отмена', style: 'cancel' },
				{
					text: 'Удалить',
					style: 'destructive',
					onPress: () => removeTemplate(id)
				}
			])
		},
		[removeTemplate]
	)

	// При нажатии "Использовать" — передаём шаблон в экран тренировки
	const handleUse = useCallback((template: IWorkoutTemplate) => {
		router.push({
			pathname: '/(tabs)/02_workout',
			params: { templateId: template.id }
		})
	}, [])

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: Colors.background }}
			edges={['top']}
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
				{/* Header */}

				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center'
					}}
				>
					<Text variant="h2">Шаблоны</Text>
					<TouchableOpacity
						onPress={() => router.back()}
						activeOpacity={0.7}
					>
						<Text
							variant="bodySmall"
							color={Colors.muted}
						>
							Закрыть
						</Text>
					</TouchableOpacity>
				</View>

				{/* Список шаблонов */}
				{templates.length === 0 && !showForm && (
					<View
						style={{
							paddingVertical: 40,
							alignItems: 'center',
							gap: Spacing.sm
						}}
					>
						<Text
							variant="h3"
							color={Colors.muted}
						>
							—
						</Text>
						<Text
							variant="bodySmall"
							color={Colors.muted}
						>
							Шаблонов пока нет
						</Text>
					</View>
				)}

				{templates.map(t => (
					<TemplateCard
						key={t.id}
						template={t}
						onUse={handleUse}
						onDelete={handleDelete}
					/>
				))}

				{/* Форма создания */}
				{showForm && (
					<Card style={{ gap: Spacing.md }}>
						<Text variant="label">Новый шаблон</Text>

						<Input
							label="Название"
							value={templateName}
							onChangeText={setTemplateName}
							placeholder="Например: Грудь и трицепс"
						/>

						<View style={{ gap: Spacing.xs }}>
							<Text variant="label">Тип</Text>
							<View>
								{WORKOUT_TYPES.map(({ key, label }) => (
									<TouchableOpacity
										key={key}
										onPress={() => setTemplateType(key)}
										style={{
											paddingVertical: Spacing.sm,
											paddingHorizontal: Spacing.md,
											paddingBottom: Spacing.md, // ← добавляем
											marginBottom: Spacing.sm,
											borderRadius: 8,
											borderWidth: 1,
											borderColor:
												templateType === key ? Colors.primary : Colors.border,
											backgroundColor:
												templateType === key
													? 'rgba(0,114,245,0.1)'
													: 'transparent',
											alignItems: 'center'
										}}
									>
										<Text
											variant="metricTiny"
											color={
												templateType === key ? Colors.primary : Colors.muted
											}
										>
											{label}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Упражнения */}
						<View style={{ gap: Spacing.sm }}>
							<Text variant="label">Упражнения</Text>
							{exercises.map((ex, exIdx) => (
								<View
									key={ex.id}
									style={{ gap: Spacing.xs }}
								>
									<View
										style={{
											flexDirection: 'row',
											alignItems: 'center',
											gap: Spacing.sm
										}}
									>
										<Input
											value={ex.name}
											onChangeText={v =>
												setExercises(prev =>
													prev.map(e =>
														e.id === ex.id ? { ...e, name: v } : e
													)
												)
											}
											placeholder={`Упражнение ${exIdx + 1}`}
											style={{ flex: 1 }}
										/>
										{exercises.length > 1 && (
											<TouchableOpacity
												onPress={() =>
													setExercises(prev => prev.filter(e => e.id !== ex.id))
												}
											>
												<Text
													variant="metricTiny"
													color={Colors.danger}
												>
													✕
												</Text>
											</TouchableOpacity>
										)}
									</View>

									{/* Подходы */}
									{ex.sets.map((set, setIdx) => (
										<View
											key={setIdx}
											style={{
												flexDirection: 'row',
												gap: Spacing.sm,
												paddingLeft: 8
											}}
										>
											<Input
												value={set.weight}
												onChangeText={v =>
													setExercises(prev =>
														prev.map(e =>
															e.id === ex.id
																? {
																		...e,
																		sets: e.sets.map((s, i) =>
																			i === setIdx ? { ...s, weight: v } : s
																		)
																	}
																: e
														)
													)
												}
												placeholder="кг"
												keyboardType="decimal-pad"
												style={{ flex: 1, textAlign: 'center' }}
											/>
											<Text
												variant="bodySmall"
												color={Colors.muted}
												style={{ alignSelf: 'center' }}
											>
												×
											</Text>
											<Input
												value={set.reps}
												onChangeText={v =>
													setExercises(prev =>
														prev.map(e =>
															e.id === ex.id
																? {
																		...e,
																		sets: e.sets.map((s, i) =>
																			i === setIdx ? { ...s, reps: v } : s
																		)
																	}
																: e
														)
													)
												}
												placeholder="повт"
												keyboardType="number-pad"
												style={{ flex: 1, textAlign: 'center' }}
											/>
										</View>
									))}
									<TouchableOpacity onPress={() => handleAddSet(ex.id)}>
										<Text
											variant="metricTiny"
											color={Colors.muted}
										>
											+ подход
										</Text>
									</TouchableOpacity>
								</View>
							))}

							<TouchableOpacity
								onPress={handleAddExercise}
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
									+ Упражнение
								</Text>
							</TouchableOpacity>
						</View>

						<View
							style={{
								flexDirection: 'row',
								gap: Spacing.sm,
								marginTop: Spacing.md, // ← добавляем отступ сверху
								alignItems: 'stretch' // ← растягиваем одинаково
							}}
						>
							<TouchableOpacity
								onPress={() => setShowForm(false)}
								style={{
									flex: 1,
									paddingVertical: Spacing.md, // ← одинаковый padding
									borderRadius: 8,
									borderWidth: 1,
									borderColor: Colors.border,
									alignItems: 'center',
									justifyContent: 'center'
								}}
							>
								<Text
									variant="bodySmall"
									color={Colors.muted}
								>
									Отмена
								</Text>
							</TouchableOpacity>
							<Button
								label="Сохранить"
								variant="primary"
								size="md"
								isLoading={isSaving}
								onPress={handleSave}
								style={{ flex: 2 }}
							/>
						</View>
					</Card>
				)}

				{/* Кнопка создать */}
				{!showForm && (
					<TouchableOpacity
						onPress={() => setShowForm(true)}
						activeOpacity={0.7}
						style={{
							borderWidth: 1,
							borderColor: Colors.border,
							borderStyle: 'dashed',
							borderRadius: 12,
							paddingVertical: Spacing.lg,
							alignItems: 'center'
						}}
					>
						<Text
							variant="bodySmall"
							color={Colors.muted}
						>
							+ Создать шаблон
						</Text>
					</TouchableOpacity>
				)}
			</ScrollView>
		</SafeAreaView>
	)
}

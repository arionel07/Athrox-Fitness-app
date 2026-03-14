/**
 * @file app/(tabs)/03_nutrition.tsx
 * @description Экран питания — дневник еды.
 */

import { useCallback, useEffect, useState } from 'react'
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	TouchableOpacity,
	View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { IMeal } from '../../src/entities/nutrition/nutrition.type'
import { useNutrition } from '../../src/shared/hooks/useNutrition.hook'
import { useProfile } from '../../src/shared/hooks/useProfile'
import { useNutritionStore } from '../../src/shared/store/nutrition.store'
import { Colors, Spacing } from '../../src/shared/theme/tokens.theme'
import { Card } from '../../src/shared/ui/Card'
import { Text } from '../../src/shared/ui/Text'
import { MacroRow } from '../../src/widgets/NutritionCard/MacroRow'
import { MealSection } from '../../src/widgets/NutritionCard/MealSection'

const MEAL_TYPES: IMeal['type'][] = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_LABELS: Record<string, string> = {
	breakfast: 'Завтрак',
	lunch: 'Обед',
	dinner: 'Ужин',
	snack: 'Перекус'
}

function formatDate(date: Date): string {
	return date.toISOString().slice(0, 10)
}

function displayDate(dateStr: string): string {
	const d = new Date(dateStr + 'T12:00:00')
	return d.toLocaleDateString('ru-RU', {
		weekday: 'long',
		day: 'numeric',
		month: 'long'
	})
}

export default function NutritionScreen() {
	const { profile } = useProfile()
	const { loadDays, addMealToDay, addFood, removeFood } = useNutrition()
	const activeDay = useNutritionStore(s => s.activeDay)

	const [currentDate, setCurrentDate] = useState(formatDate(new Date()))

	// Загружаем день при монтировании и смене даты
	useEffect(() => {
		loadDays(currentDate)
	}, [currentDate])

	// Навигация по дням
	const goToPrevDay = useCallback(() => {
		const d = new Date(currentDate + 'T12:00:00')
		d.setDate(d.getDate() - 1)
		setCurrentDate(formatDate(d))
	}, [currentDate])

	const gotToNextDay = useCallback(() => {
		const d = new Date(currentDate + 'T12:00:00')
		d.setDate(d.getDate() + 1)
		const today = formatDate(new Date())
		if (formatDate(d) <= today) setCurrentDate(formatDate(d))
	}, [currentDate])

	const isToday = currentDate === formatDate(new Date())

	// Добавляем приём пищи если его нет
	const handleAddMeal = useCallback(
		async (type: IMeal['type']) => {
			if (!activeDay) return

			const exists = activeDay.meals.find(m => m.type === type)
			if (!exists) {
				await addMealToDay(activeDay.id, currentDate, type)
			}
		},
		[activeDay, currentDate, addMealToDay]
	)

	const handleAddFood = useCallback(
		async (
			mealId: string,
			name: string,
			grams: number,
			calories: number,
			protein: number,
			fat: number,
			carbs: number
		) => {
			await addFood(mealId, name, grams, calories, protein, fat, carbs)
		},
		[addFood]
	)

	const handleRemoveFood = useCallback(
		async (mealId: string, itemId: string) => {
			await removeFood(mealId, itemId)
		},
		[removeFood]
	)

	// Итоги дня
	const totalCalories =
		activeDay?.meals.reduce(
			(sum, m) => sum + m.items.reduce((s, i) => s + i.calories, 0),
			0
		) ?? 0
	const totalProtein =
		activeDay?.meals.reduce(
			(sum, m) => sum + m.items.reduce((s, i) => s + i.protein, 0),
			0
		) ?? 0
	const totalFat =
		activeDay?.meals.reduce(
			(sum, m) => sum + m.items.reduce((s, i) => s + i.fat, 0),
			0
		) ?? 0
	const totalCarbs =
		activeDay?.meals.reduce(
			(sum, m) => sum + m.items.reduce((s, i) => s + i.carbs, 0),
			0
		) ?? 0

	const calorieGoal = profile?.calorieGoal ?? 2400
	const proteinGoal = profile?.proteinGoal ?? 120
	const fatGoal = Math.round((calorieGoal * 0.3) / 9)
	const carbGoal = Math.round((calorieGoal * 0.45) / 4)

	// Существующие типы приёмов пищи
	const existingTypes = new Set(activeDay?.meals.map(m => m.type) ?? [])

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: Colors.background }}
			edges={['top']}
		>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
					{/* ── Header ──────────────────────────────────────── */}
					<Text variant="h2">Питание</Text>

					{/* ── Навигация по дням ────────────────────────────── */}
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'space-between'
						}}
					>
						<TouchableOpacity
							onPress={goToPrevDay}
							style={{ padding: Spacing.sm }}
						>
							<Text
								variant="h3"
								color={Colors.muted}
							>
								‹
							</Text>
						</TouchableOpacity>
						<Text variant="weekLabel">{displayDate(currentDate)}</Text>
						<TouchableOpacity
							onPress={gotToNextDay}
							style={{ padding: Spacing.sm }}
							disabled={isToday}
						>
							<Text
								variant="h3"
								color={isToday ? Colors.border : Colors.muted}
							>
								›
							</Text>
						</TouchableOpacity>
					</View>

					{/* ── Итоги дня ────────────────────────────────────── */}
					<Card style={{ gap: Spacing.md }}>
						<Text variant="label">Итого за день</Text>
						<MacroRow
							label="Калории"
							current={Math.round(totalCalories)}
							goal={calorieGoal}
							unit="ккал"
							color={Colors.primary}
						/>
						<MacroRow
							label="Белок"
							current={Math.round(totalProtein)}
							goal={proteinGoal}
							unit="г"
							color={Colors.success}
						/>
						<MacroRow
							label="Жиры"
							current={Math.round(totalFat)}
							goal={fatGoal}
							unit="г"
							color={Colors.warning}
						/>
						<MacroRow
							label="Углеводы"
							current={Math.round(totalCarbs)}
							goal={carbGoal}
							unit="г"
							color="#a855f7"
						/>
					</Card>

					{/* ── Приёмы пищи ──────────────────────────────────── */}
					<View style={{ gap: Spacing.sm }}>
						<Text variant="label">Приёмы пищи</Text>

						{activeDay?.meals.map(meal => (
							<MealSection
								key={meal.id}
								meal={meal}
								onAddFood={handleAddFood}
								onRemoveFood={handleRemoveFood}
							/>
						))}

						{/* Кнопки добавления новых приёмов */}
						{MEAL_TYPES.filter(t => !existingTypes.has(t)).map(type => (
							<TouchableOpacity
								key={type}
								onPress={() => handleAddMeal(type)}
								activeOpacity={0.7}
								style={{
									borderWidth: 1,
									borderColor: Colors.border,
									borderStyle: 'dashed',
									borderRadius: 12,
									paddingVertical: Spacing.md,
									alignItems: 'center'
								}}
							>
								<Text
									variant="bodySmall"
									color={Colors.muted}
								>
									{' '}
									+ {MEAL_LABELS[type]}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

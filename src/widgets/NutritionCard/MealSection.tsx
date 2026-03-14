/**
 * @file widgets/NutritionCard/MealSection.tsx
 * @description Секция одного приёма пищи — завтрак/обед/ужин/перекус.
 */

import { memo, useState } from 'react'
import { Alert, TextInput, TouchableOpacity, View } from 'react-native'
import { IMeal } from '../../entities/nutrition/nutrition.type'
import { Colors, Radius, Spacing } from '../../shared/theme/tokens.theme'
import { Card } from '../../shared/ui/Card'
import { Text } from '../../shared/ui/Text'

const MEAL_LABELS: Record<string, string> = {
	breakfast: 'Завтрак',
	lunch: 'Обед',
	dinner: 'Ужин',
	snack: 'Перекус'
}

interface MealSectionProps {
	meal: IMeal
	onAddFood: (
		mealId: string,
		name: string,
		grams: number,
		calories: number,
		protein: number,
		fat: number,
		carbs: number
	) => void
	onRemoveFood: (mealId: string, itemId: string) => void
}

export const MealSection = memo(
	({ meal, onAddFood, onRemoveFood }: MealSectionProps) => {
		const [expanded, setExpanded] = useState(true)
		const [adding, setAdding] = useState(false)

		// Поля новой еды
		const [name, setName] = useState('')
		const [grams, setGrams] = useState('')
		const [calories, setCalories] = useState('')
		const [protein, setProtein] = useState('')
		const [fat, setFat] = useState('')
		const [carbs, setCarbs] = useState('')

		const totalCal = meal.items.reduce((s, i) => s + i.calories, 0)

		const handleAdd = () => {
			if (!name.trim()) {
				Alert.alert('Ошибка', 'Введите название продукта')
				return
			}

			onAddFood(
				meal.id,
				name.trim(),
				parseFloat(grams) || 0,
				parseFloat(calories) || 0,
				parseFloat(protein) || 0,
				parseFloat(fat) || 0,
				parseFloat(carbs) || 0
			)
			// Сброс формы
			setName('')
			setGrams('')
			setCalories('')
			setProtein('')
			setFat('')
			setCarbs('')
			setAdding(false)
		}

		const inputStyle = {
			flex: 1,
			backgroundColor: Colors.background,
			borderWidth: 1,
			borderColor: Colors.border,
			borderRadius: Radius.sm,
			paddingHorizontal: Spacing.sm,
			paddingVertical: 6,
			color: Colors.foreground,
			fontFamily: 'GeistMono',
			fontSize: 13,
			textAlign: 'center' as const
		}

		return (
			<Card style={{ gap: Spacing.sm }}>
				{/* Заголовок секции */}
				<TouchableOpacity
					onPress={() => setExpanded(v => !v)}
					activeOpacity={0.7}
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center'
					}}
				>
					<Text variant="body">{MEAL_LABELS[meal.type] ?? meal.type}</Text>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: Spacing.sm
						}}
					>
						{totalCal > 0 && (
							<Text
								variant="metricTiny"
								color={Colors.muted}
							>
								{Math.round(totalCal)} ккал
							</Text>
						)}
						<Text
							variant="metricTiny"
							color={Colors.muted}
						>
							{expanded ? '▲' : '▼'}
						</Text>
					</View>
				</TouchableOpacity>

				{expanded && (
					<>
						{/* Список продуктов */}
						{meal.items.length > 0 && (
							<View style={{ gap: 2 }}>
								{/* Заголовок колонок */}
								<View
									style={{
										flexDirection: 'row',
										gap: Spacing.sm,
										paddingBottom: 4
									}}
								>
									<Text
										variant="label"
										style={{ flex: 3 }}
									>
										Продукт
									</Text>
									<Text
										variant="label"
										style={{ flex: 1, textAlign: 'center' }}
									>
										г
									</Text>
									<Text
										variant="label"
										style={{ flex: 1, textAlign: 'center' }}
									>
										ккал
									</Text>
									<Text
										variant="label"
										style={{ flex: 1, textAlign: 'center' }}
									>
										б
									</Text>
									<Text style={{ width: 24 }} />
								</View>

								{meal.items.map(item => (
									<View
										key={item.id}
										style={{
											flexDirection: 'row',
											alignItems: 'center',
											gap: Spacing.sm,
											paddingVertical: 4,
											borderTopWidth: 1,
											borderTopColor: Colors.border
										}}
									>
										<Text
											variant="bodySmall"
											style={{ flex: 3 }}
											numberOfLines={1}
										>
											{item.name}
										</Text>
										<Text
											variant="metricTiny"
											style={{ flex: 1, textAlign: 'center' }}
										>
											{item.grams}
										</Text>
										<Text
											variant="metricTiny"
											style={{ flex: 1, textAlign: 'center' }}
										>
											{Math.round(item.calories)}
										</Text>
										<Text
											variant="metricTiny"
											style={{ flex: 1, textAlign: 'center' }}
										>
											{Math.round(item.protein)}
										</Text>
										<TouchableOpacity
											onPress={() => onRemoveFood(meal.id, item.id)}
											style={{ width: 24, alignItems: 'center' }}
										>
											<Text
												variant="metricTiny"
												color={Colors.danger}
											>
												✕
											</Text>
										</TouchableOpacity>
									</View>
								))}
							</View>
						)}

						{/* Форма добавления */}
						{adding ? (
							<View style={{ gap: Spacing.sm }}>
								<TextInput
									value={name}
									onChangeText={setName}
									placeholder="Название продукта"
									placeholderTextColor={Colors.muted}
									style={{
										backgroundColor: Colors.background,
										borderWidth: 1,
										borderColor: Colors.primary,
										borderRadius: Radius.sm,
										paddingHorizontal: Spacing.md,
										paddingVertical: Spacing.sm,
										color: Colors.foreground,
										fontFamily: 'Geist',
										fontSize: 14
									}}
								/>
								{/* Числовые поля */}
								<View style={{ flexDirection: 'row', gap: Spacing.xs }}>
									{[
										{ val: grams, set: setGrams, ph: 'г' },
										{ val: calories, set: setCalories, ph: 'ккал' },
										{ val: protein, set: setProtein, ph: 'белок' },
										{ val: fat, set: setFat, ph: 'жир' },
										{ val: carbs, set: setCarbs, ph: 'угл' }
									].map(({ val, set, ph }) => (
										<TextInput
											key={ph}
											value={val}
											onChangeText={set}
											placeholder={ph}
											placeholderTextColor={Colors.muted}
											keyboardType="decimal-pad"
											style={inputStyle}
										/>
									))}
								</View>

								<View style={{ flexDirection: 'row', gap: Spacing.sm }}>
									<TouchableOpacity
										onPress={() => setAdding(false)}
										style={{
											flex: 1,
											paddingVertical: Spacing.sm,
											borderRadius: Radius.sm,
											borderWidth: 1,
											borderColor: Colors.border,
											alignItems: 'center'
										}}
									>
										<Text
											variant="bodySmall"
											color={Colors.muted}
										>
											Отмена
										</Text>
									</TouchableOpacity>
									<TouchableOpacity
										onPress={handleAdd}
										style={{
											flex: 2,
											paddingVertical: Spacing.sm,
											borderRadius: Radius.sm,
											backgroundColor: Colors.primary,
											alignItems: 'center'
										}}
									>
										<Text
											variant="bodySmall"
											color={Colors.foreground}
										>
											Добавить
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						) : (
							<TouchableOpacity
								onPress={() => setAdding(true)}
								activeOpacity={0.7}
								style={{
									borderWidth: 1,
									borderColor: Colors.border,
									borderStyle: 'dashed',
									borderRadius: Radius.sm,
									paddingVertical: Spacing.sm,
									alignItems: 'center'
								}}
							>
								<Text
									variant="bodySmall"
									color={Colors.muted}
								>
									+ Добавить продукт
								</Text>
							</TouchableOpacity>
						)}
					</>
				)}
			</Card>
		)
	}
)

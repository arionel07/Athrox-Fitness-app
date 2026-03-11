/**
 * @file shared/hooks/useNutrition.ts
 * @description Хук для работы с питанием.
 *
 * Особенность работы с питанием:
 * — Данные загружаются по дате (один день за раз)
 * — При смене дня (← →) вызываем loadDay с новой датой
 * — Макросы считаются на лету в JS — не хранятся в БД
 */

import { useCallback } from 'react'
import {
	IFoodItem,
	IMeal,
	INutritionDay
} from '../../entities/nutrition/nutrition.type'
import { useDatabase } from '../db/useDatabase.hook'
import { useNutritionStore } from '../store/nutrition.store'
import { generateId } from './useId.hook'

// ─── Типы строк из БД ─────────────────────────────────────────────
interface DBNutritionDay {
	id: string
	date: string
	water_ml: number
}

interface DBMeal {
	id: string
	day_id: string
	type: string
}

interface DBFoodItem {
	id: string
	meal_id: string
	name: string
	grams: number
	calories: number
	protein: number
	fat: number
	carbs: number
}
// ─── Вспомогательная функция ──────────────────────────────────────

/**
 * Считает суммарные макросы для приёма пищи.
 * Вызывается после загрузки — не хранится в БД.
 */
const calcMealTotals = (meal: IMeal): IMeal => ({
	...meal,
	totalCalories: meal.items.reduce((sum, i) => sum + i.calories, 0),
	totalProtein: meal.items.reduce((sum, i) => sum + i.protein, 0)
})

export const useNutrition = () => {
	const db = useDatabase()
	const {
		setActiveDay,
		addMeal,
		addFoodItem,
		deleteFoodItem,
		updateWater,
		setLoading,
		setError
	} = useNutritionStore()

	/**
	 * Загружает день питания по дате.
	 * Если записи нет — создаёт пустой день в store (не в БД).
	 * В БД запись создаётся только когда добавляется первый продукт.
	 * @param date — "YYYY-MM-DD"
	 */
	const loadDay = useCallback(
		async (date: string): Promise<void> => {
			setLoading(true)
			setError(null)

			try {
				// Ищем день в БД
				const dbDay = await db.getFirstAsync<DBNutritionDay>(
					`SELECT * FROM nutrition_days WHERE date = ?`,
					[date]
				)
				// Если дня нет — создаём пустой в store
				if (!dbDay) {
					setActiveDay({
						id: generateId(),
						date,
						waterMl: 0,
						meals: []
					})
					return
				}
				// Загружаем приёмы пищи
				const dbMeals = await db.getAllAsync<DBMeal>(
					`SELECT * FROM meals WHERE day_id = ?`,
					[dbDay.id]
				)
				// Загружаем продукты для всех приёмов параллельно
				const meals: IMeal[] = await Promise.all(
					dbMeals.map(async m => {
						const dbItems = await db.getAllAsync<DBFoodItem>(
							`SELECT * FROM food_items WHERE meal_id = ?`,
							[m.id]
						)

						const items: IFoodItem[] = dbItems.map(item => ({
							id: item.id,
							mealId: item.meal_id,
							name: item.name,
							grams: item.grams,
							calories: item.calories,
							protein: item.protein,
							fat: item.fat,
							carbs: item.carbs
						}))

						// Считаем итого для приёма пищи
						return calcMealTotals({
							id: m.id,
							dayId: m.day_id,
							type: m.type as IMeal['type'],
							items
						})
					})
				)

				setActiveDay({
					id: dbDay.id,
					date: dbDay.date,
					waterMl: dbDay.water_ml,
					meals
				})
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error')
				console.error('[useNutrition] loadDay failed:', err)
			} finally {
				setLoading(false)
			}
		},
		[db]
	)

	/**
	 * Добавляет приём пищи в текущий день.
	 * Если дня ещё нет в БД — создаёт его тоже.
	 */
	const addMealToDay = useCallback(
		async (
			dayId: string,
			date: string,
			type: IMeal['type']
		): Promise<IMeal | null> => {
			const meal: IMeal = {
				id: generateId(),
				dayId,
				type,
				items: [],
				totalCalories: 0,
				totalProtein: 0
			}
			// Optimistic update
			addMeal(meal)

			try {
				await db.withTransactionAsync(async () => {
					// Создаём день если не существует
					await db.runAsync(
						`INSERT OR IGNORE INTO nutrition_days (id, date, water_ml)
             VALUES (?, ?, 0)`,
						[dayId, date]
					)

					// Создаём приём пищи
					await db.runAsync(
						`INSERT INTO meals (id, day_id, type) VALUES (?, ?, ?)`,
						[meal.id, dayId, type]
					)
				})

				return meal
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error')
				console.error('[useNutrition] addMealToDay failed:', err)
				return null
			}
		},
		[db]
	)

	/**
	 * Добавляет продукт в приём пищи.
	 */
	const addFood = useCallback(
		async (
			mealId: string,
			name: string,
			grams: number,
			calories: number,
			protein: number,
			fat: number,
			carbs: number
		): Promise<void> => {
			const item: IFoodItem = {
				id: generateId(),
				mealId,
				name,
				grams,
				calories,
				protein,
				fat,
				carbs
			}

			// Optimistic update
			addFoodItem(mealId, item)

			try {
				await db.runAsync(
					`INSERT INTO food_items
           (id, meal_id, name, grams, calories, protein, fat, carbs)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
					[item.id, mealId, name, grams, calories, protein, fat, carbs]
				)
			} catch (err) {
				// Откатываем если БД упала
				deleteFoodItem(mealId, item.id)
				setError(err instanceof Error ? err.message : 'Unknown error')
				console.error('[useNutrition] addFood failed:', err)
			}
		},
		[db]
	)

	/**
	 * Удаляет продукт из приёма пищи.
	 */
	const removeFood = useCallback(
		async (mealId: string, itemId: string): Promise<void> => {
			// Сохраняем для отката
			const activeDay = useNutritionStore.getState().activeDay
			const meal = activeDay?.meals.find(m => m.id === mealId)
			const item = meal?.items.find(i => i.id === itemId)

			// Optimistic update
			deleteFoodItem(mealId, itemId)

			try {
				await db.runAsync(`DELETE FROM food_items WHERE id = ?`, [itemId])
			} catch (err) {
				if (item) addFoodItem(mealId, item)
				setError(err instanceof Error ? err.message : 'Unknown error')
				console.error('[useNutrition] removeFood failed:', err)
			}
		},
		[db]
	)

	/**
	 * Обновляет количество воды за день.
	 */
	const logWater = useCallback(
		async (dayId: string, date: string, ml: number): Promise<void> => {
			// Optimistic update
			updateWater(ml)

			try {
				await db.runAsync(
					`INSERT INTO nutrition_days (id, date, water_ml)
           VALUES (?, ?, ?)
           ON CONFLICT(date) DO UPDATE SET water_ml = ?`,
					[dayId, date, ml, ml]
				)
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error')
				console.error('[useNutrition] logWater failed:', err)
			}
		},
		[db]
	)

	/**
	 * Загружает данные питания за диапазон дат.
	 * Используется в Weekly Report Engine для подсчёта средних калорий.
	 */
	const getByDateRange = useCallback(
		async (startDate: string, endDate: string): Promise<INutritionDay[]> => {
			try {
				const dbDays = await db.getAllAsync<DBNutritionDay>(
					`SELECT * FROM nutrition_days
           WHERE date BETWEEN ? AND ?
           ORDER BY date ASC`,
					[startDate, endDate]
				)
				return await Promise.all(
					dbDays.map(async d => {
						const dbMeals = await db.getAllAsync<DBMeal>(
							`SELECT * FROM meals WHERE day_id = ?`,
							[d.id]
						)

						const meals: IMeal[] = await Promise.all(
							dbMeals.map(async m => {
								const dbItems = await db.getAllAsync<DBFoodItem>(
									`SELECT * FROM food_items WHERE meal_id = ?`,
									[m.id]
								)

								return calcMealTotals({
									id: m.id,
									dayId: m.day_id,
									type: m.type as IMeal['type'],
									items: dbItems.map(i => ({
										id: i.id,
										mealId: i.meal_id,
										name: i.name,
										grams: i.grams,
										calories: i.calories,
										protein: i.protein,
										fat: i.fat,
										carbs: i.carbs
									}))
								})
							})
						)

						return {
							id: d.id,
							date: d.date,
							waterMl: d.water_ml,
							meals
						}
					})
				)
			} catch (err) {
				console.error('[useNutrition] getByDateRange failed:', err)
				return []
			}
		},
		[db]
	)

	return {
		loadDay,
		addMealToDay,
		addFood,
		removeFood,
		logWater,
		getByDateRange
	}
}

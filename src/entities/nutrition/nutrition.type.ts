/**
 * @file entities/nutrition/types.ts
 * @description Типы для отслеживания питания.
 *
 * Структура дня: NutritionDay → Meal → FoodItem
 * Макроэлементы считаются на уровне FoodItem и агрегируются вверх.
 */

// ─── Приём пищи ───────────────────────────────────────────────────
export type TMealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

// ─── Продукт ──────────────────────────────────────────────────────
export interface IFoodItem {
	id: string
	mealId: string
	name: string
	grams: number // вес порции в граммах
	calories: number // ккал на данную порцию
	protein: number // г белка
	fat: number // г жира
	carbs: number // г углеводов
}

// ─── Приём пищи ───────────────────────────────────────────────────
export interface IMeal {
	id: string
	dayId: string
	type: TMealType
	items: IFoodItem[]

	// Вычисляемые поля — считаются в JS, не хранятся в БД
	// Это экономит место и гарантирует актуальность данных
	totalCalories?: number
	totalProtein?: number
}

// ─── День питания ─────────────────────────────────────────────────
export interface INutritionDay {
	id: string
	date: string
	waterMl: number
	meals: IMeal[]
}

// ─── Дневные цели (из профиля пользователя) ───────────────────────
export interface INutritionGoals {
	calories: number
	protein: number
	fat: number
	carbs: number
	waterMl: number
}

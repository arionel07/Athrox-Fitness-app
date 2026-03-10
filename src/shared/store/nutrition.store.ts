/**
 * @file shared/store/nutrition.store.ts
 * @description Zustand store для питания.
 *
 * Особенность: activeDay — текущий просматриваемый день.
 * При переключении дат (← →) меняем activeDay,
 * хук подгружает данные из БД и обновляет store.
 */
import { create } from 'zustand'
import {
	IFoodItem,
	IMeal,
	INutritionDay,
	INutritionGoals
} from '../../entities/nutrition/nutrition.type'

interface INutritionState {
	// ── Данные ──────────────────────────────────────────────────────
	activeDay: INutritionDay | null // текущий день питания
	goals: INutritionGoals | null // цели пользователя

	isLoading: boolean
	error: string | null

	// ── Действия: день ──────────────────────────────────────────────
	setActiveDay: (day: INutritionDay | null) => void
	setGoals: (goals: INutritionGoals) => void
	updateWater: (ml: number) => void

	// ── Действия: приёмы пищи ───────────────────────────────────────
	addMeal: (meal: IMeal) => void

	// ── Действия: продукты ──────────────────────────────────────────
	addFoodItem: (mealId: string, item: IFoodItem) => void
	deleteFoodItem: (mealId: string, itemId: string) => void

	setLoading: (isLoading: boolean) => void
	setError: (error: string | null) => void
}

export const useNutritionStore = create<INutritionState>(set => ({
	activeDay: null,
	goals: null,
	isLoading: false,
	error: null,

	setActiveDay: day => set({ activeDay: day }),
	setGoals: goals => set({ goals }),

	// ── Обновляем воду не перезаписывая весь день ────────────────────
	updateWater: ml =>
		set(state => {
			if (!state.activeDay) return state
			return { activeDay: { ...state.activeDay, waterMl: ml } }
		}),

	// ── Добавляем приём пищи в текущий день ──────────────────────────
	addMeal: meal =>
		set(state => {
			if (!state.activeDay) return state
			return {
				activeDay: {
					...state.activeDay,
					meals: [...state.activeDay.meals, meal]
				}
			}
		}),

	// ── Добавляем продукт в конкретный приём пищи ────────────────────
	addFoodItem: (mealId, item) =>
		set(state => {
			if (!state.activeDay) return state
			return {
				activeDay: {
					...state.activeDay,
					meals: state.activeDay.meals.map(m =>
						m.id === mealId ? { ...m, items: [...m.items, item] } : m
					)
				}
			}
		}),

	// ── Удаляем продукт ──────────────────────────────────────────────
	deleteFoodItem: (mealId, itemId) =>
		set(state => {
			if (!state.activeDay) return state
			return {
				activeDay: {
					...state.activeDay,
					meals: state.activeDay.meals.map(m =>
						m.id === mealId
							? { ...m, items: m.items.filter(i => i.id !== itemId) }
							: m
					)
				}
			}
		}),

	setLoading: isLoading => set({ isLoading }),
	setError: error => set({ error })
}))

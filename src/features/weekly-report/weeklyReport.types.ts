/**
 * @file features/weekly-report/weeklyReport.types.ts
 * @description Типы для Weekly Report Engine.
 */

import { IBodyMetrics } from '../../entities/body/body.type'
import { INutritionDay } from '../../entities/nutrition/nutrition.type'
import { ISleepSession } from '../../entities/sleep/sleep.type'
import { IWorkoutSession } from '../../entities/workout/workout.type'

// ─── Входные данные для движка ────────────────────────────────────
export interface IWeeklyReportInput {
	weekNumber: number
	year: number
	startDate: string // "YYYY-MM-DD" — понедельник
	endDate: string // "YYYY-MM-DD" — воскресенье
	workouts: IWorkoutSession[]
	nutritionDays: INutritionDay[]
	sleepSessions: ISleepSession[]
	bodyMetrics: IBodyMetrics[]
	// Данные прошлой недели — для сравнения силовых показателей
	previousWeekWorkouts: IWorkoutSession[]
	previousWeekBodyMetrics: IBodyMetrics[]
}
// ─── Силовой анализ по упражнению ─────────────────────────────────
export interface IExerciseStrengthDelta {
	exerciseName: string
	previousMax: number // макс вес прошлой недели
	currentMax: number // макс вес этой недели
	deltaKg: number // разница в кг
	deltaPercent: number // разница в %
	improved: boolean
}
// ─── Результат работы движка ──────────────────────────────────────
export interface IWeeklyReportResult {
	weekNumber: number
	year: number
	startDate: string
	endDate: string

	// ── Тренировки ──────────────────────────────────────────────────
	totalWorkouts: number
	strengthDeltas: IExerciseStrengthDelta[]
	improvedExercisesCount: number
	overallStrengthDelta: number // средний % изменения силы

	// ── Тело ────────────────────────────────────────────────────────
	startWeight: number | null // вес в начале недели
	endWeight: number | null // вес в конце недели
	weightDelta: number // изменение в кг
	// ── Питание ─────────────────────────────────────────────────────
	avgDailyCalories: number
	avgDailyProtein: number
	avgDailyFat: number
	avgDailyCarbs: number
	trackedDays: number // сколько дней вёл дневник питания
	// ── Сон ─────────────────────────────────────────────────────────
	avgSleepMinutes: number
	avgSleepQuality: number // 1-5
	sleepTrackedDays: number

	// ── AI инсайты ──────────────────────────────────────────────────
	// Текстовые выводы — генерируются на основе данных
	insights: string[]
}

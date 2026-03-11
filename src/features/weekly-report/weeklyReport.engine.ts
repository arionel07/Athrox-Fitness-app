/**
 * @file features/weekly-report/weeklyReport.engine.ts
 * @description Движок Weekly Report — анализирует данные за неделю.
 *
 * Принципы:
 * — Чистая функция: те же входные данные = тот же результат
 * — Никакого React, никакой БД, никаких side effects
 * — Легко тестировать: просто передай данные и проверь результат
 *
 * Порядок анализа:
 * 1. Силовые показатели (сравнение с прошлой неделей)
 * 2. Изменение веса тела
 * 3. Среднее питание за неделю
 * 4. Средний сон за неделю
 * 5. Генерация инсайтов на основе всех данных
 */

import { INutritionDay } from '../../entities/nutrition/nutrition.type'
import { ISleepSession } from '../../entities/sleep/sleep.type'
import { IWorkoutSession } from '../../entities/workout/workout.type'
import {
	IExerciseStrengthDelta,
	IWeeklyReportInput,
	IWeeklyReportResult
} from './weeklyReport.types'

// ─── Вспомогательные функции ──────────────────────────────────────

/**
 * Считает среднее значение массива чисел.
 * Возвращает 0 если массив пустой — безопасно для отображения.
 */
const average = (values: number[]): number => {
	if (values.length === 0) return 0
	return values.reduce((sum, v) => sum + v, 0) / values.length
}

/**
 * Округляет число до одного знака после запятой.
 * Используем везде для читаемости в UI.
 */
const round1 = (n: number): number => Math.round(n * 10) / 10

/**
 * Получает максимальный вес по упражнению из списка тренировок.
 * Ищет по точному совпадению имени упражнения.
 *
 * @param workouts - список тренировок
 * @param exerciseName - имя упражнения
 * @returns максимальный вес или 0
 */
const getMaxWeightForExercise = (
	workouts: IWorkoutSession[],
	exerciseName: string
): number => {
	let max = 0

	for (const session of workouts) {
		for (const exercise of session.exercises) {
			// Сравниваем без учёта регистра — "Жим лёжа" = "жим лёжа"
			if (exercise.name.toLowerCase() !== exerciseName.toLowerCase()) continue

			for (const set of exercise.sets) {
				if (set.completed && set.weight > max) {
					max = set.weight
				}
			}
		}
	}
	return max
}

/**
 * Собирает все уникальные имена упражнений из списка тренировок.
 */
const getUniqueExerciseNames = (workouts: IWorkoutSession[]): string[] => {
	const names = new Set<string>()
	for (const session of workouts) {
		for (const exercise of session.exercises) {
			names.add(exercise.name.toLowerCase())
		}
	}
	return Array.from(names)
}

// ─── Анализ силы ──────────────────────────────────────────────────

/**
 * Сравнивает силовые показатели текущей и прошлой недели.
 * Анализирует только упражнения которые были в обеих неделях.
 */
const analyzeStrength = (
	currentWorkouts: IWorkoutSession[],
	previousWorkouts: IWorkoutSession[]
): IExerciseStrengthDelta[] => {
	// Берём упражнения только из текущей недели
	const currentExercises = getUniqueExerciseNames(currentWorkouts)

	return (
		currentExercises
			.map((name): IExerciseStrengthDelta => {
				const currentMax = getMaxWeightForExercise(currentWorkouts, name)
				const previousMax = getMaxWeightForExercise(previousWorkouts, name)

				const deltaKg = round1(currentMax - previousMax)

				// Процент считаем только если было предыдущее значение
				const deltaPercent =
					previousMax > 0 ? round1((deltaKg / previousMax) * 100) : 0

				return {
					exerciseName: name,
					previousMax,
					currentMax,
					deltaKg,
					deltaPercent,
					improved: deltaKg > 0
				}
			})
			// Показываем только упражнения у которых есть сравнение (было в прошлой неделе)
			.filter(d => d.previousMax > 0)
	)
}

// ─── Анализ питания ───────────────────────────────────────────────

/**
 * Считает средние макросы за неделю.
 * Делит на количество дней с записями — не на 7.
 * Если пользователь вёл дневник 4 дня — считаем среднее за 4 дня.
 */
const analyzeNutrition = (
	nutritionDays: INutritionDay[]
): {
	avgCalories: number
	avgProtein: number
	avgFat: number
	avgCarbs: number
	trackedDays: number
} => {
	if (nutritionDays.length === 0) {
		return {
			avgCalories: 0,
			avgProtein: 0,
			avgFat: 0,
			avgCarbs: 0,
			trackedDays: 0
		}
	}

	// Считаем итого за каждый день
	const dailyTotals = nutritionDays.map(day => {
		let calories = 0,
			protein = 0,
			fat = 0,
			carbs = 0

		for (const meal of day.meals) {
			for (const item of meal.items) {
				calories += item.calories
				protein += item.protein
				fat += item.fat
				carbs += item.carbs
			}
		}

		return { calories, protein, fat, carbs }
	})
	return {
		avgCalories: round1(average(dailyTotals.map(d => d.calories))),
		avgProtein: round1(average(dailyTotals.map(d => d.protein))),
		avgFat: round1(average(dailyTotals.map(d => d.fat))),
		avgCarbs: round1(average(dailyTotals.map(d => d.carbs))),
		trackedDays: nutritionDays.length
	}
}

// ─── Анализ сна ───────────────────────────────────────────────────

const analyzeSleep = (
	sleepSessions: ISleepSession[]
): {
	avgMinutes: number
	avgQuality: number
	trackedDays: number
} => {
	if (sleepSessions.length === 0) {
		return { avgMinutes: 0, avgQuality: 0, trackedDays: 0 }
	}

	return {
		avgMinutes: round1(average(sleepSessions.map(s => s.durationMinutes))),
		avgQuality: round1(average(sleepSessions.map(s => s.quality))),
		trackedDays: sleepSessions.length
	}
}

// ─── Генерация инсайтов ───────────────────────────────────────────
/**
 * Генерирует текстовые выводы на основе всех данных.
 * Каждый инсайт — короткое конкретное предложение.
 *
 * Пороговые значения:
 * — Сон: оптимально 7-9 часов (420-540 минут)
 * — Калории для роста мышц: >2200 ккал
 * — Калории для похудения: <1800 ккал
 * — Белок: оптимально >1.6г/кг (используем абсолютное >120г как ориентир)
 */
const generateInsights = (
	strengthDeltas: IExerciseStrengthDelta[],
	weightDelta: number,
	avgCalories: number,
	avgProtein: number,
	avgSleepMinutes: number,
	avgSleepQuality: number,
	totalWorkouts: number
): string[] => {
	const insights: string[] = []

	// ── Тренировки ──────────────────────────────────────────────────
	if (totalWorkouts === 0) {
		insights.push('На этой неделе не было тренировок')
	} else {
		insights.push(`Проведено тренировок: ${totalWorkouts}`)
	}
	// ── Сила ────────────────────────────────────────────────────────
	const improved = strengthDeltas.filter(d => d.improved)
	const declined = strengthDeltas.filter(d => d.deltaKg < 0)

	if (improved.length > 0) {
		insights.push(`Сила выросла в ${improved.length} упражнениях`)
	}
	if (declined.length > 0) {
		insights.push(`Сила снизилась в ${declined.length} упражнениях`)
	}
	// ── Вес тела ────────────────────────────────────────────────────
	if (weightDelta !== 0) {
		const direction = weightDelta > 0 ? 'вырос' : 'снизился'
		insights.push(`Вес тела ${direction} на ${Math.abs(weightDelta)} кг`)
	}
	// ── Питание ─────────────────────────────────────────────────────
	if (avgCalories > 0) {
		if (avgCalories < 1800) {
			insights.push('Калорийность слишком низкая — риск потери мышц')
		} else if (avgCalories > 3000) {
			insights.push('Калорийность выше нормы — профицит для набора')
		} else {
			insights.push(`Средняя калорийность в норме: ${avgCalories} ккал`)
		}

		if (avgProtein < 120) {
			insights.push('Недостаточно белка — цель минимум 120г в день')
		} else {
			insights.push(`Белок в норме: ${avgProtein}г в день`)
		}
	} else {
		insights.push('Питание не отслеживалось на этой неделе')
	}
	// ── Сон ─────────────────────────────────────────────────────────
	if (avgSleepMinutes > 0) {
		const hours = round1(avgSleepMinutes / 60)

		if (avgSleepMinutes < 360) {
			insights.push(`Сон ниже нормы: ${hours}ч — восстановление под угрозой`)
		} else if (avgSleepMinutes > 540) {
			insights.push(`Сон выше нормы: ${hours}ч`)
		} else {
			insights.push(`Средний сон в норме: ${hours}ч`)
		}

		if (avgSleepQuality < 3) {
			insights.push('Качество сна низкое — влияет на восстановление')
		}
	} else {
		insights.push('Сон не отслеживался на этой неделе')
	}

	return insights
}

// ─── Главная функция движка ───────────────────────────────────────
/**
 * Анализирует данные за неделю и возвращает отчёт.
 * Это единственная публичная функция модуля.
 *
 * @param input - все данные за текущую и прошлую неделю
 * @returns готовый отчёт для отображения и сохранения в БД
 */
export const generateWeeklyReport = (
	input: IWeeklyReportInput
): IWeeklyReportResult => {
	// ── 1. Силовые показатели ────────────────────────────────────────
	const strengthDeltas = analyzeStrength(
		input.workouts,
		input.previousWeekWorkouts
	)
	const improvedExercisesCount = strengthDeltas.filter(d => d.improved).length
	const overallStrengthDelta =
		strengthDeltas.length > 0
			? round1(average(strengthDeltas.map(d => d.deltaPercent)))
			: 0
	// ── 2. Вес тела ──────────────────────────────────────────────────
	// Берём первый и последний замер недели для сравнения
	const sortedMetrics = [...input.bodyMetrics].sort((a, b) =>
		a.date.localeCompare(b.date)
	)
	const startWeight = sortedMetrics[0]?.weightKg ?? null
	const endWeight = sortedMetrics[sortedMetrics.length - 1]?.weightKg ?? null
	const weightDelta =
		startWeight !== null && endWeight !== null
			? round1(endWeight - startWeight)
			: 0

	// ── 3. Питание ───────────────────────────────────────────────────
	const nutrition = analyzeNutrition(input.nutritionDays)
	// ── 4. Сон ───────────────────────────────────────────────────────
	const sleep = analyzeSleep(input.sleepSessions)
	// ── 5. Инсайты ───────────────────────────────────────────────────
	const insights = generateInsights(
		strengthDeltas,
		weightDelta,
		nutrition.avgCalories,
		nutrition.avgProtein,
		sleep.avgMinutes,
		sleep.avgQuality,
		input.workouts.length
	)

	return {
		weekNumber: input.weekNumber,
		year: input.year,
		startDate: input.startDate,
		endDate: input.endDate,

		totalWorkouts: input.workouts.length,
		strengthDeltas,
		improvedExercisesCount,
		overallStrengthDelta,

		startWeight,
		endWeight,
		weightDelta,

		avgDailyCalories: nutrition.avgCalories,
		avgDailyProtein: nutrition.avgProtein,
		avgDailyFat: nutrition.avgFat,
		avgDailyCarbs: nutrition.avgCarbs,
		trackedDays: nutrition.trackedDays,

		avgSleepMinutes: sleep.avgMinutes,
		avgSleepQuality: sleep.avgQuality,
		sleepTrackedDays: sleep.trackedDays,

		insights
	}
}

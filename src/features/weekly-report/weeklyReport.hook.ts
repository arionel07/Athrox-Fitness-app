import {
	endOfISOWeek,
	format,
	getISOWeek,
	startOfISOWeek,
	subWeeks
} from 'date-fns'
import { useCallback, useState } from 'react'
import { useDatabase } from '../../shared/db/useDatabase.hook'
import { useBody } from '../../shared/hooks/useBody.hook'
import { generateId } from '../../shared/hooks/useId.hook'
import { useNutrition } from '../../shared/hooks/useNutrition.hook'
import { useSleep } from '../../shared/hooks/useSleep.hook'
import { useWorkouts } from '../../shared/hooks/useWorkouts.hook'
import { generateWeeklyReport } from './weeklyReport.engine'
import { IWeeklyReportResult } from './weeklyReport.types'

/**
 * @file features/weekly-report/weeklyReport.hook.ts
 * @description Хук для генерации и сохранения Weekly Report.
 *
 * Соединяет движок с реальными данными из БД.
 * Использует date-fns для работы с неделями.
 */
export const useWeeklyReport = () => {
	const db = useDatabase()
	const { getSessionsByDateRange } = useWorkouts()
	const { getByDateRange: getNutritionByRange } = useNutrition()
	const { getByDateRange: getSleepByRange } = useSleep()
	const { getMetricsByDateRange } = useBody()

	const [isGenerating, setIsGenerating] = useState(false)
	const [error, setError] = useState<string | null>(null)

	/**
	 * Генерирует отчёт за указанную неделю.
	 * По умолчанию — текущая неделя.
	 *
	 * @param date - любая дата внутри нужной недели (default: сегодня)
	 * @returns WeeklyReportResult или null при ошибке
	 */
	const generateReport = useCallback(
		async (date: Date = new Date()): Promise<IWeeklyReportResult | null> => {
			setIsGenerating(true)
			setError(null)

			try {
				// ── Определяем границы текущей и прошлой недели ─────────────
				const weekStart = startOfISOWeek(date)
				const weekEnd = endOfISOWeek(date)
				const prevWeekStart = startOfISOWeek(subWeeks(date, 1))
				const prevWeekEnd = endOfISOWeek(subWeeks(date, 1))
				// Форматируем в "YYYY-MM-DD" для SQL запросов
				const fmt = (d: Date) => format(d, 'yyyy-MM-dd')
				// ── Загружаем все данные параллельно ────────────────────────
				const [
					workouts,
					previousWorkouts,
					nutritionDays,
					sleepSessions,
					bodyMetrics,
					previousBodyMetrics
				] = await Promise.all([
					getSessionsByDateRange(fmt(weekStart), fmt(weekEnd)),
					getSessionsByDateRange(fmt(prevWeekStart), fmt(prevWeekEnd)),
					getNutritionByRange(fmt(weekStart), fmt(weekEnd)),
					getSleepByRange(fmt(weekStart), fmt(weekEnd)),
					getMetricsByDateRange(fmt(weekStart), fmt(weekEnd)),
					getMetricsByDateRange(fmt(prevWeekStart), fmt(prevWeekEnd))
				])
				// ── Запускаем движок ─────────────────────────────────────────
				const result = generateWeeklyReport({
					weekNumber: getISOWeek(date),
					year: date.getFullYear(),
					startDate: fmt(weekStart),
					endDate: fmt(weekEnd),
					workouts,
					nutritionDays,
					sleepSessions,
					bodyMetrics,
					previousWeekWorkouts: previousWorkouts,
					previousWeekBodyMetrics: previousBodyMetrics
				})
				// ── Сохраняем отчёт в БД ─────────────────────────────────────
				await db.runAsync(
					`INSERT OR REPLACE INTO weekly_reports (
            id, week_number, year, start_date, end_date,
            strength_delta, improved_exercises_count, weight_delta,
            avg_daily_calories, avg_daily_protein,
            avg_sleep_minutes, avg_sleep_quality,
            insights, generated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						generateId(),
						result.weekNumber,
						result.year,
						result.startDate,
						result.endDate,
						result.overallStrengthDelta,
						result.improvedExercisesCount,
						result.weightDelta,
						result.avgDailyCalories,
						result.avgDailyProtein,
						result.avgSleepMinutes,
						result.avgSleepQuality,
						// Сериализуем массив инсайтов в JSON строку для SQLite
						JSON.stringify(result.insights),
						new Date().toISOString()
					]
				)
				return result
			} catch (err) {
				const message = err instanceof Error ? err.message : 'Unknown error'
				setError(message)
				console.error('[useWeeklyReport] generateReport failed:', err)
				return null
			} finally {
				setIsGenerating(false)
			}
		},
		[
			db,
			getSessionsByDateRange,
			getNutritionByRange,
			getSleepByRange,
			getMetricsByDateRange
		]
	)
	return { generateReport, isGenerating, error }
}

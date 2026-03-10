/**
 * @file entities/body/types.ts
 * @description Типы для метрик тела и фото прогресса.
 *
 * BodyMetrics — числовые данные (вес, % жира).
 * ProgressPhoto — путь к локальному файлу на устройстве.
 */

// ─── Замер тела ───────────────────────────────────────────────────
export interface IBodyMetrics {
	id: string
	date: string // "YYYY-MM-DD"
	weightKg: number
	bodyFatPercent: number | null // опционально — не все замеряют
	notes: string
}

// ─── Ракурс фото ──────────────────────────────────────────────────
export type TPhotoAngle = 'front' | 'side' | 'back'

// ─── Фото прогресса ───────────────────────────────────────────────
export interface IProgressPhoto {
	id: string
	date: string // "YYYY-MM-DD"
	angle: TPhotoAngle
	// Локальный URI файла на устройстве (expo-media-library)
	// Пример: "file:///var/mobile/.../.jpg"
	localUri: string
	notes: string
}

// ─── Недельный отчёт (результат Core Engine) ──────────────────────
export interface IWeeklyReport {
	id: string
	weekDate: number // номер недели в году (1-52)
	year: number
	startDate: string // "YYYY-MM-DD"
	endDate: string

	// Силовые показатели
	strengthDelta: number // % изменения силы
	improvedExercisesCount: number // сколько упражнений выросли

	// Тело
	weightDelta: number // кг изменения веса

	// Питание
	avgDailyCalories: number
	avgDailyProtein: number

	// Сон
	avgSleepMinutes: number
	avgSleepQuality: number // 1-5

	// Текстовые выводы — генерируются Core Engine
	insights: string[] // ["Сила выросла в 3 упражнениях", ...]

	generatedAt: string // ISO — когда был создан отчёт
}

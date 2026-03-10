/**
 * @file entities/sleep/types.ts
 * @description Тип для записи сна.
 *
 * Качество сна влияет на Weekly Report — низкое качество
 * при хорошем питании может объяснять отсутствие прогресса.
 */

// ─── Качество сна ─────────────────────────────────────────────────
// Числовая шкала — удобно для агрегации и построения графиков
export type TSleepQuality = 1 | 2 | 3 | 4 | 5

// ─── Сессия сна ───────────────────────────────────────────────────
export interface ISleepSession {
	id: string
	date: string // "YYYY-MM-DD" — дата пробуждения
	bedtime: string // ISO — время отхода ко сну
	wakeTime: string // ISO — время подъёма
	durationMinutes: number // считается автоматически из bedtime/wakeTime
	quality: TSleepQuality
	notes: string
}

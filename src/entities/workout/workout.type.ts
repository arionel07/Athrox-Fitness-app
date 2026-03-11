/**
 * @file entities/workout/types.ts
 * @description Типы для тренировочных сущностей.
 *
 * Иерархия: WorkoutSession → Exercise → Set
 * Одна тренировка содержит упражнения, каждое упражнение — подходы.
 */

// ─── Тип тренировки ───────────────────────────────────────────────
export type TWorkoutType = 'strength' | 'cardio' | 'stretching'

// ─── Один подход (сет) ────────────────────────────────────────────
export interface IWorkoutSet {
	id: string
	exerciseId: string // связь с упражнением
	weight: number // вес в кг (0 если упражнение с весом тела)
	reps: number // количество повторений
	completed: boolean // отмечен ли подход выполненным
	createdAt: string // ISO строка — легко сортировать и хранить в SQLite
}

// ─── Упражнение ───────────────────────────────────────────────────
export interface IExercise {
	id: string
	sessionId: string // связь с тренировкой
	name: string // "Жим лёжа", "Приседания" и т.д.
	sort_order: number // порядок в тренировке для правильного отображения
	sets: IWorkoutSet[] // подходы (загружаются JOIN-ом из БД)
}

// ─── Тренировочная сессия ─────────────────────────────────────────
export interface IWorkoutSession {
	id: string
	type: TWorkoutType
	title: string // опциональное название ("Грудь + трицепс")
	notes: string // заметки после тренировки
	startedAt: string // ISO — когда началась
	finishedAt: string // ISO — когда закончилась
	exercises: IExercise[]
}

// ─── DTO для создания (без id и дат — они генерируются автоматически) ──
export type TCreateWorkoutDTO = Omit<
	IWorkoutSession,
	'id' | 'finishedAt' | 'exercises'
> & {
	exercises: (Omit<IExercise, 'id' | 'sessionId' | 'sets'> & {
		sets: Omit<IWorkoutSet, 'id' | 'exerciseId'>[]
	})[]
}

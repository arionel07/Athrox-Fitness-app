/**
 * @file shared/store/workout.store.ts
 * @description Zustand store для тренировок.
 *
 * Архитектурное решение:
 * — Store НЕ обращается к БД напрямую — только хранит состояние
 * — БД-операции живут в хуках (src/shared/hooks/)
 * — Это разделение позволяет тестировать store без БД
 *
 * Оптимизация:
 * — Используй селекторы при подписке: useWorkoutStore(s => s.sessions)
 * — Не подписывайся на весь store — будет лишний ре-рендер
 */

import { create } from 'zustand'
import {
	IExercise,
	IWorkoutSession,
	IWorkoutSet
} from '../../entities/workout/workout.type'

// ─── Типы состояния ───────────────────────────────────────────────

interface IWorkoutState {
	// ── Данные ──────────────────────────────────────────────────────
	sessions: IWorkoutSession[] // все тренировки
	activeSession: IWorkoutSession | null // текущая активная тренировка

	// ── Флаги загрузки ──────────────────────────────────────────────
	isLoading: boolean
	error: string | null

	// ── Действия: сессии ────────────────────────────────────────────
	setSessions: (session: IWorkoutSession[]) => void
	addSession: (session: IWorkoutSession) => void
	updateSession: (id: string, updates: Partial<IWorkoutSession>) => void
	deleteSession: (id: string) => void

	// ── Действия: активная тренировка ───────────────────────────────
	setActiveSession: (exercise: IWorkoutSession | null) => void
	addExerciseToActive: (exercise: IExercise) => void
	addSetToExercise: (exerciseId: string, set: IWorkoutSet) => void
	updateSet: (exerciseId: string, setId: string, updates: IWorkoutSet) => void
	deleteSet: (exerciseId: string, setId: string) => void

	// ── Вспомогательные ─────────────────────────────────────────────

	setLoading: (isLoading: boolean) => void
	setError: (error: string | null) => void
	reset: () => void
}

// ─── Начальное состояние ──────────────────────────────────────────
const initialState = {
	sessions: [],
	activeSession: null,
	isLoading: false,
	error: null
}

// ─── Store ────────────────────────────────────────────────────────
export const useWorkoutStore = create<IWorkoutState>(set => ({
	...initialState,

	// ── Загружаем все сессии из БД в store ──────────────────────────
	setSessions: sessions => set({ sessions }),
	// ── Добавляем новую сессию в начало массива (новые сверху) ───────
	addSession: session =>
		set(state => ({
			sessions: [session, ...state.sessions]
		})),
	// ── Обновляем конкретную сессию по id ───────────────────────────
	updateSession: (id, updates) =>
		set(state => ({
			sessions: state.sessions.map(s =>
				s.id === id ? { ...s, ...updates } : s
			)
		})),

	// ── Удаляем сессию из store (БД удаляется в хуке) ───────────────
	deleteSession: id =>
		set(state => ({
			sessions: state.sessions.filter(s => s.id !== id)
		})),
	// ── Активная тренировка (запись в реальном времени) ──────────────
	setActiveSession: session => set({ activeSession: session }),
	// ── Добавляем упражнение в активную тренировку ──────────────────
	addExerciseToActive: exercise =>
		set(state => {
			if (!state.activeSession) return state
			return {
				activeSession: {
					...state.activeSession,
					exercises: [...state.activeSession.exercises, exercise]
				}
			}
		}),
	// ── Добавляем подход к упражнению ───────────────────────────────
	addSetToExercise: (exerciseId, newSet) =>
		set(state => {
			if (!state.activeSession) return state
			return {
				activeSession: {
					...state.activeSession,
					exercises: state.activeSession.exercises.map(ex =>
						ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex
					)
				}
			}
		}),
	// ── Обновляем конкретный подход ──────────────────────────────────
	updateSet: (exerciseId, setId, updates) =>
		set(state => {
			if (!state.activeSession) return state
			return {
				activeSession: {
					...state.activeSession,
					exercises: state.activeSession.exercises.map(ex =>
						ex.id === exerciseId
							? {
									...ex,
									sets: ex.sets.map(s =>
										s.id === setId ? { ...s, ...updates } : s
									)
								}
							: ex
					)
				}
			}
		}),
	// ── Удаляем подход ───────────────────────────────────────────────
	deleteSet: (exerciseId, setId) =>
		set(state => {
			if (!state.activeSession) return state
			return {
				activeSession: {
					...state.activeSession,
					exercises: state.activeSession.exercises.map(ex =>
						ex.id === exerciseId
							? { ...ex, sets: ex.sets.filter(s => s.id !== setId) }
							: ex
					)
				}
			}
		}),

	setLoading: isLoading => set({ isLoading }),
	setError: error => set({ error }),

	// ── Полный сброс store (например при logout) ─────────────────────
	reset: () => set(initialState)
}))

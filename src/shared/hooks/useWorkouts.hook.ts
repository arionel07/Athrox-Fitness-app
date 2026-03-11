/**
 * @file shared/hooks/useWorkouts.ts
 * @description Хук для работы с тренировками.
 *
 * Responsibilities:
 * — Загрузка тренировок из БД → store
 * — CRUD операции (create, delete)
 * — Запросы для Weekly Report (getSessionsByDateRange)
 *
 * Паттерн каждой операции:
 * 1. Обновляем store сразу (optimistic update) — UI отзывчивый
 * 2. Пишем в БД асинхронно
 * 3. Если БД упала — откатываем store и показываем ошибку
 */

import { useCallback } from 'react'
import {
	type IExercise,
	type IWorkoutSession,
	TCreateWorkoutDTO
} from '../../entities/workout/workout.type'
import { useDatabase } from '../db/useDatabase.hook'
import { useWorkoutStore } from '../store/workout.store'
import { generateId } from './useId.hook'

// ─── Типы строк из БД ─────────────────────────────────────────────
// SQLite возвращает plain объекты — мапим в наши типы
interface DBWorkoutSession {
	id: string
	type: string
	title: string
	notes: string
	started_at: string
	finished_at: string
}

interface DBExercise {
	id: string
	session_id: string
	name: string
	sort_order: number
}

interface DBWorkoutSet {
	id: string
	exercise_id: string
	weight: number
	reps: number
	completed: number // SQLite хранит 0/1
	created_at: string
}

export const useWorkouts = () => {
	const db = useDatabase()

	const { setSessions, addSession, deleteSession, setLoading, setError } =
		useWorkoutStore()

	/**
	 * Загружает все тренировки из БД в store.
	 * Вызывается при монтировании экрана тренировок.
	 * JOIN подгружает упражнения и сеты за один проход.
	 */
	const loadSessions = useCallback(async (): Promise<void> => {
		setLoading(true)
		setError(null)

		try {
			// Шаг 1: загружаем все сессии
			const dbSession = await db.getAllAsync<DBWorkoutSession>(
				`SELECT * FROM workout_sessions ORDER BY started_at DESC`
			)

			// Шаг 2: для каждой сессии загружаем упражнения и сеты
			// Делаем это параллельно через Promise.all для скорости
			const sessions: IWorkoutSession[] = await Promise.all(
				dbSession.map(async s => {
					const dbExercise = await db.getAllAsync<DBExercise>(
						`SELECT * FROM exercises WHERE session_id = ? ORDER BY sort_order ASC`,
						[s.id]
					)

					const exercises: IExercise[] = await Promise.all(
						dbExercise.map(async ex => {
							const dbSets = await db.getAllAsync<DBWorkoutSet>(
								`SELECT * FROM workout_sets WHERE exercise_id = ? ORDER BY created_at ASC`,
								[ex.id]
							)

							return {
								id: ex.id,
								sessionId: ex.session_id,
								name: ex.name,
								sort_order: ex.sort_order,
								// Конвертируем 0/1 → boolean
								sets: dbSets.map(set => ({
									id: set.id,
									exerciseId: set.exercise_id,
									weight: set.weight,
									reps: set.reps,
									completed: set.completed === 1,
									createdAt: set.created_at
								}))
							}
						})
					)

					return {
						id: s.id,
						type: s.type as IWorkoutSession['type'],
						title: s.title,
						notes: s.notes,
						startedAt: s.started_at,
						finishedAt: s.finished_at,
						exercises
					}
				})
			)

			setSessions(sessions)
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unknown error'
			setError(message)
			console.error('[useWorkouts] loadSessions failed:', err)
		} finally {
			setLoading(false)
		}
	}, [db])

	/**
	 * Создаёт новую тренировку.
	 * Сохраняет сессию, упражнения и сеты в одной транзакции.
	 * @param dto - данные новой тренировки
	 * @returns созданная сессия или null при ошибке
	 */
	const createSession = useCallback(
		async (dto: TCreateWorkoutDTO): Promise<IWorkoutSession | null> => {
			const sessionId = generateId()
			const now = new Date().toISOString()

			// Собираем полный объект сессии
			type DTOExercise = TCreateWorkoutDTO['exercises'][number]
			type DTOSet = DTOExercise['sets'][number]
			const newSession: IWorkoutSession = {
				id: sessionId,
				type: dto.type,
				title: dto.title,
				notes: dto.notes,
				startedAt: dto.startedAt,
				finishedAt: now,
				exercises: dto.exercises.map((ex: DTOExercise, exIndex: number) => ({
					id: generateId(),
					sessionId,
					name: ex.name,
					sort_order: exIndex,
					sets: ex.sets.map((s: DTOSet) => ({
						id: generateId(),
						exerciseId: '',
						weight: s.weight,
						reps: s.reps,
						completed: s.completed,
						createdAt: now
					}))
				}))
			}

			// Исправляем exerciseId в сетах
			newSession.exercises = newSession.exercises.map(ex => ({
				...ex,
				sets: ex.sets.map(s => ({ ...s, exerciseId: ex.id }))
			}))

			// Optimistic update — сразу показываем в UI
			addSession(newSession)

			try {
				// Сохраняем в БД в транзакции — всё или ничего
				await db.withTransactionAsync(async () => {
					// Сессия
					await db.runAsync(
						`INSERT INTO workout_sessions (id, type, title, notes, started_at, finished_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
						[
							sessionId,
							newSession.type,
							newSession.title,
							newSession.notes,
							newSession.startedAt,
							newSession.finishedAt
						]
					)

					// Упражнения и сеты
					for (const ex of newSession.exercises) {
						await db.runAsync(
							`INSERT INTO exercises (id, session_id, name, sort_order)
               VALUES (?, ?, ?, ?)`,
							[ex.id, sessionId, ex.name, ex.sort_order]
						)

						for (const s of ex.sets) {
							await db.runAsync(
								`INSERT INTO workout_sets (id, exercise_id, weight, reps, completed, created_at)
                 VALUES (?, ?, ?, ?, ?, ?)`,
								[
									s.id,
									ex.id,
									s.weight,
									s.reps,
									s.completed ? 1 : 0,
									s.createdAt
								]
							)
						}
					}
				})

				return newSession
			} catch (err) {
				// Откатываем optimistic update если БД упала
				deleteSession(sessionId)
				const message = err instanceof Error ? err.message : 'Unknown error'
				setError(message)
				console.error('[useWorkouts] createSession failed:', err)
				return null
			}
		},
		[db]
	)

	/**
	 * Удаляет тренировку.
	 * ON DELETE CASCADE в схеме удалит упражнения и сеты автоматически.
	 */
	const removeSession = useCallback(
		async (id: string): Promise<void> => {
			// Сохраняем для отката
			const sessions = useWorkoutStore.getState().sessions
			const sessionToDelete = sessions.find(s => s.id === id)
			// Optimistic update
			deleteSession(id)

			try {
				await db.runAsync(`DELETE FROM workout_sessions WHERE id = ?`, [id])
			} catch (err) {
				// Откатываем если БД упала
				if (sessionToDelete) {
					addSession(sessionToDelete)
				}
				const message = err instanceof Error ? err.message : 'Unknown error'
				setError(message)
				console.error('[useWorkouts] removeSession failed:', err)
			}
		},
		[db]
	)

	/**
	 * Загружает тренировки за диапазон дат.
	 * Используется в Weekly Report Engine.
	 * @param startDate - "YYYY-MM-DD"
	 * @param endDate - "YYYY-MM-DD"
	 */
	const getSessionsByDateRange = useCallback(
		async (startDate: string, endDate: string): Promise<IWorkoutSession[]> => {
			try {
				const dbSessions = await db.getAllAsync<DBWorkoutSession>(
					`SELECT * FROM workout_sessions
           WHERE date(started_at) BETWEEN ? AND ?
           ORDER BY started_at ASC`,
					[startDate, endDate]
				)

				// Загружаем упражнения и сеты параллельно
				return await Promise.all(
					dbSessions.map(async s => {
						const dbExercises = await db.getAllAsync<DBExercise>(
							`SELECT * FROM exercises WHERE session_id = ? ORDER BY sort_order ASC`,
							[s.id]
						)

						const exercises: IExercise[] = await Promise.all(
							dbExercises.map(async ex => {
								const dbSets = await db.getAllAsync<DBWorkoutSet>(
									`SELECT * FROM workout_sets WHERE exercise_id = ? ORDER BY created_at ASC`,
									[ex.id]
								)

								return {
									id: ex.id,
									sessionId: ex.session_id,
									name: ex.name,
									sort_order: ex.sort_order,
									sets: dbSets.map(set => ({
										id: set.id,
										exerciseId: set.exercise_id,
										weight: set.weight,
										reps: set.reps,
										completed: set.completed === 1,
										createdAt: set.created_at
									}))
								}
							})
						)

						return {
							id: s.id,
							type: s.type as IWorkoutSession['type'],
							title: s.title,
							notes: s.notes,
							startedAt: s.started_at,
							finishedAt: s.finished_at,
							exercises
						}
					})
				)
			} catch (err) {
				console.error('[useWorkouts] getSessionsByDateRange failed:', err)
				return []
			}
		},
		[db]
	)

	return {
		loadSessions,
		createSession,
		removeSession,
		getSessionsByDateRange
	}
}

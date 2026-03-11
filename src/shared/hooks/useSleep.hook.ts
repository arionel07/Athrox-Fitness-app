/**
 * @file shared/hooks/useSleep.ts
 * @description Хук для работы с данными сна.
 */

import { useCallback } from 'react'
import { ISleepSession } from '../../entities/sleep/sleep.type'
import { useDatabase } from '../db/useDatabase.hook'
import { useSleepStore } from '../store/sleep.store'
import { generateId } from './useId.hook'

interface DBSleepSession {
	id: string
	date: string
	bedtime: string
	wake_time: string
	duration_minutes: number
	quality: number
	notes: string
}

// Маппинг DB строки → тип приложения
const mapDBToSleep = (row: DBSleepSession): ISleepSession => ({
	id: row.id,
	date: row.date,
	bedtime: row.bedtime,
	wakeTime: row.wake_time,
	durationMinutes: row.duration_minutes,
	quality: row.quality as ISleepSession['quality'],
	notes: row.notes
})

export const useSleep = () => {
	const db = useDatabase()

	const {
		setSessions,
		addSession,
		updateSession,
		deleteSession,
		setLoading,
		setError
	} = useSleepStore()

	/**
	 * Загружает записи сна за последние N дней.
	 * По умолчанию 30 — достаточно для графиков и отчётов.
	 */
	const loadSessions = useCallback(
		async (daysBack: number = 30): Promise<void> => {
			setLoading(true)
			try {
				const rows = await db.getAllAsync<DBSleepSession>(
					`SELECT * FROM sleep_sessions
           WHERE date >= date('now', ?)
           ORDER BY date DESC`,
					[`-${daysBack} days`]
				)
				setSessions(rows.map(mapDBToSleep))
			} catch (err) {
				setError(err instanceof Error ? err.message : 'Unknown error')
				console.error('[useSleep] loadSessions failed:', err)
			} finally {
				setLoading(false)
			}
		},
		[db]
	)

	/**
	 * Логирует сон.
	 * durationMinutes считается автоматически из bedtime и wakeTime.
	 */
	const logSleep = useCallback(
		async (
			date: string,
			bedtime: string,
			wakeTime: string,
			quality: ISleepSession['quality'],
			notes: string = ''
		): Promise<void> => {
			// Считаем продолжительность в минутах
			const bed = new Date(bedtime).getTime()
			const wake = new Date(wakeTime).getTime()
			// Если лёг до полуночи а встал после — добавляем сутки
			const durationMinutes = Math.floor(
				(wake > bed ? wake - bed : wake + 86400000 - bed) / 60000
			)

			const session: ISleepSession = {
				id: generateId(),
				date,
				bedtime,
				wakeTime,
				durationMinutes,
				quality,
				notes
			}
			// Optimistic update
			addSession(session)

			try {
				await db.runAsync(
					`INSERT OR REPLACE INTO sleep_sessions
           (id, date, bedtime, wake_time, duration_minutes, quality, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
					[session.id, date, bedtime, wakeTime, durationMinutes, quality, notes]
				)
			} catch (err) {
				deleteSession(session.id)
				setError(err instanceof Error ? err.message : 'Unknown error')
				console.error('[useSleep] logSleep failed:', err)
			}
		},
		[db]
	)

	/**
	 * Загружает записи сна за диапазон дат.
	 * Используется в Weekly Report Engine.
	 */
	const getByDateRange = useCallback(
		async (startDate: string, endDate: string): Promise<ISleepSession[]> => {
			try {
				const rows = await db.getAllAsync<DBSleepSession>(
					`SELECT * FROM sleep_sessions
           WHERE date BETWEEN ? AND ?
           ORDER BY date ASC`,
					[startDate, endDate]
				)
				return rows.map(mapDBToSleep)
			} catch (err) {
				console.error('[useSleep] getByDateRange failed:', err)
				return []
			}
		},
		[db]
	)

	return { loadSessions, logSleep, getByDateRange }
}

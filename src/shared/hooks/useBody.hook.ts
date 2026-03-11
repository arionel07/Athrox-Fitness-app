/**
 * @file shared/hooks/useBody.ts
 * @description Хук для метрик тела и фото прогресса.
 */

import { useCallback } from 'react'
import { IBodyMetrics, IProgressPhoto } from '../../entities/body/body.type'
import { useDatabase } from '../db/useDatabase.hook'
import { useBodyStore } from '../store/body.store'
import { generateId } from './useId.hook'

interface DBBodyMetrics {
	id: string
	date: string
	weight_kg: number
	body_fat_percent: number | null
	notes: string
}

interface DBProgressPhoto {
	id: string
	date: string
	angle: string
	local_uri: string
	notes: string
}

export const useBody = () => {
	const db = useDatabase()

	const {
		setMetrics,
		addMetrics,
		deleteMetrics,
		setPhotos,
		addPhoto,
		deletePhoto,
		setLoading,
		setError
	} = useBodyStore()

	/**
	 * Загружает все замеры тела.
	 */
	const logMetrics = useCallback(async (): Promise<void> => {
		setLoading(true)
		try {
			const rows = await db.getAllAsync<DBBodyMetrics>(
				`SELECT * FROM body_metrics ORDER BY date DESC`
			)
			setMetrics(
				rows.map(r => ({
					id: r.id,
					date: r.date,
					weightKg: r.weight_kg,
					bodyFatPercent: r.body_fat_percent,
					notes: r.notes
				}))
			)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Unknown error')
		} finally {
			setLoading(false)
		}
	}, [db])

	/**
	 * Логирует замер тела.
	 * INSERT OR REPLACE — если в этот день уже есть запись, перезаписываем.
	 */
	const loadMetrics = useCallback(
		async (
			weightKg: number,
			bodyFatPercent: number | null = null,
			notes: string = '',
			date: string = new Date().toISOString().slice(0, 10)
		): Promise<void> => {
			const metrics: IBodyMetrics = {
				id: generateId(),
				date,
				weightKg,
				bodyFatPercent,
				notes
			}

			addMetrics(metrics)

			try {
				await db.runAsync(
					`INSERT OR REPLACE INTO body_metrics
           (id, date, weight_kg, body_fat_percent, notes)
           VALUES (?, ?, ?, ?, ?)`,
					[metrics.id, date, weightKg, bodyFatPercent, notes]
				)
			} catch (err) {
				deleteMetrics(metrics.id)
				setError(err instanceof Error ? err.message : 'Unknown error')
				console.error('[useBody] logMetrics failed:', err)
			}
		},
		[db]
	)

	/**
	 * Загружает замеры за диапазон дат (для Weekly Report).
	 */
	const getMetricsByDateRange = useCallback(
		async (startDate: string, endDate: string): Promise<IBodyMetrics[]> => {
			try {
				const rows = await db.getAllAsync<DBBodyMetrics>(
					`SELECT * FROM body_metrics
           WHERE date BETWEEN ? AND ?
           ORDER BY date ASC`,
					[startDate, endDate]
				)
				return rows.map(r => ({
					id: r.id,
					date: r.date,
					weightKg: r.weight_kg,
					bodyFatPercent: r.body_fat_percent,
					notes: r.notes
				}))
			} catch (err) {
				console.error('[useBody] getMetricsByDateRange failed:', err)
				return []
			}
		},
		[db]
	)

	/**
	 * Сохраняет фото прогресса.
	 * localUri — путь к файлу от expo-image-picker.
	 */
	const savePhoto = useCallback(
		async (
			localUri: string,
			angle: IProgressPhoto['angle'],
			notes: string = '',
			date: string = new Date().toISOString().slice(0, 10)
		): Promise<void> => {
			const photo: IProgressPhoto = {
				id: generateId(),
				date,
				angle,
				localUri,
				notes
			}

			addPhoto(photo)
			try {
				await db.runAsync(
					`INSERT INTO progress_photos (id, date, angle, local_uri, notes)
           VALUES (?, ?, ?, ?, ?)`,
					[photo.id, date, angle, localUri, notes]
				)
			} catch (err) {
				deletePhoto(photo.id)
				setError(err instanceof Error ? err.message : 'Unknown error')
				console.error('[useBody] savePhoto failed:', err)
			}
		},
		[db]
	)

	const loadPhotos = useCallback(async (): Promise<void> => {
		try {
			const rows = await db.getAllAsync<DBProgressPhoto>(
				`SELECT * FROM progress_photos ORDER BY date DESC`
			)
			setPhotos(
				rows.map(r => ({
					id: r.id,
					date: r.date,
					angle: r.angle as IProgressPhoto['angle'],
					localUri: r.local_uri,
					notes: r.notes
				}))
			)
		} catch (err) {
			console.error('[useBody] loadPhotos failed:', err)
		}
	}, [db])

	return {
		loadMetrics,
		logMetrics,
		getMetricsByDateRange,
		savePhoto,
		loadPhotos
	}
}

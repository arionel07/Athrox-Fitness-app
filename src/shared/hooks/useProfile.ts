/**
 * @file shared/hooks/useProfile.ts
 * @description Хук для работы с профилем пользователя.
 *
 * Профиль — единственная запись в таблице user_profile.
 * При первом запуске создаём дефолтный профиль.
 */

import { useCallback, useEffect } from 'react'
import { TUserProfileInput } from '../../entities/user/user.type'
import { useDatabase } from '../db/useDatabase.hook'
import { useProfileStore } from '../store/profile.store'
import { generateId } from './useId.hook'

const DEFAULT_PROFILE: TUserProfileInput = {
	name: 'Arionel',
	weightGoal: 80,
	calorieGoal: 2600,
	proteinGoal: 130,
	workoutsPerWeekGoal: 3
}

export function useProfile() {
	const db = useDatabase()
	const profile = useProfileStore(s => s.profile)
	const isLoading = useProfileStore(s => s.isLoading)
	const setProfile = useProfileStore(s => s.setProfile)
	const setLoading = useProfileStore(s => s.setLoading)
	const setError = useProfileStore(s => s.setError)

	// ── Загружаем профиль при монтировании ─────────────────────────
	const loadProfile = useCallback(async () => {
		if (!db) return

		setLoading(true)

		try {
			const row = await db.getFirstAsync<any>(
				'SELECT * FROM user_profile LIMIT 1'
			)

			if (row) {
				setProfile({
					id: row.id,
					name: row.name,
					weightGoal: row.weight_goal,
					calorieGoal: row.calorie_goal,
					proteinGoal: row.protein_goal,
					workoutsPerWeekGoal: row.workouts_per_week_goal,
					createdAt: row.created_at,
					updatedAt: row.updated_at
				})
			} else {
				// Первый запуск — создаём дефолтный профиль
				await createProfile(DEFAULT_PROFILE)
			}
		} catch (e) {
			setError(String(e))
		} finally {
			setLoading(false)
		}
	}, [db])

	useEffect(() => {
		loadProfile()
	}, [loadProfile])

	const createProfile = useCallback(
		async (input: TUserProfileInput) => {
			if (!db) return null

			const id = generateId()
			const now = new Date().toISOString()

			try {
				await db.runAsync(
					`INSERT INTO user_profile 
           (id, name, weight_goal, calorie_goal, protein_goal, workouts_per_week_goal, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						id,
						input.name,
						input.weightGoal,
						input.calorieGoal,
						input.proteinGoal,
						input.workoutsPerWeekGoal,
						now,
						now
					]
				)
				const newProfile = { id, ...input, createdAt: now, updatedAt: now }
				setProfile(newProfile)
			} catch (e) {
				setError(String(e))
				return null
			}
		},
		[db]
	)

	// ── Обновляем профиль ───────────────────────────────────────────
	const updateProfile = useCallback(
		async (input: Partial<TUserProfileInput>) => {
			if (!db || !profile) return null

			const now = new Date().toISOString()
			const updated = { ...profile, ...input, updatedAt: now }
			// Оптимистично обновляем store
			setProfile(updated)

			try {
				await db.runAsync(
					`UPDATE user_profile SET
           name = ?, weight_goal = ?, calorie_goal = ?,
           protein_goal = ?, workouts_per_week_goal = ?, updated_at = ?
           WHERE id = ?`,
					[
						updated.name,
						updated.weightGoal,
						updated.calorieGoal,
						updated.proteinGoal,
						updated.workoutsPerWeekGoal,
						now,
						profile.id
					]
				)
			} catch (e) {
				// Откат при ошибке
				setProfile(profile)
				setError(String(e))
				return null
			}
		},
		[db, profile]
	)

	return { profile, isLoading, updateProfile }
}

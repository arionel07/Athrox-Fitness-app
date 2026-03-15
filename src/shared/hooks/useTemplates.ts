/**
 * @file shared/hooks/useTemplates.ts
 * @description Хук для работы с шаблонами тренировок.
 */

import { useCallback, useEffect } from 'react'
import {
	ITemplateExercise,
	IWorkoutTemplate,
	TCreateTemplateDTO
} from '../../entities/template/template.type'
import { useDatabase } from '../db/useDatabase.hook'
import { useTemplateStore } from '../store/template.store'
import { generateId } from './useId.hook'

interface DBTemplate {
	id: string
	name: string
	type: string
	created_at: string
	updated_at: string
}
interface DBTemplateExercise {
	id: string
	template_id: string
	name: string
	sort_order: number
}
interface DBTemplateSet {
	id: string
	exercise_id: string
	weight: number
	reps: number
}

export function useTemplates() {
	const db = useDatabase()
	const {
		templates,
		setTemplates,
		addTemplate,
		deleteTemplate,
		setLoading,
		setError
	} = useTemplateStore()

	// ── Загружаем все шаблоны ─────────────────────────────────────
	const loadTemplates = useCallback(async () => {
		if (!db) return
		setLoading(true)
		try {
			const dbTemplates = await db.getAllAsync<DBTemplate>(
				'SELECT * FROM workout_templates ORDER BY created_at DESC'
			)
			const templates: IWorkoutTemplate[] = await Promise.all(
				dbTemplates.map(async t => {
					const dbExercise = await db.getAllAsync<DBTemplateExercise>(
						'SELECT * FROM template_exercises WHERE template_id = ? ORDER BY sort_order ASC',
						[t.id]
					)
					const exercises: ITemplateExercise[] = await Promise.all(
						dbExercise.map(async ex => {
							const dbSets = await db.getAllAsync<DBTemplateSet>(
								'SELECT * FROM template_sets WHERE exercise_id = ?',
								[ex.id]
							)
							return {
								id: ex.id,
								name: ex.name,
								sort_order: ex.sort_order,
								sets: dbSets.map(s => ({ weight: s.weight, reps: s.reps }))
							}
						})
					)
					return {
						id: t.id,
						name: t.name,
						type: t.type as IWorkoutTemplate['type'],
						exercises,
						createdAt: t.created_at,
						updatedAt: t.updated_at
					}
				})
			)
			setTemplates(templates)
		} catch (e) {
			setError(String(e))
		} finally {
			setLoading(false)
		}
	}, [db])

	useEffect(() => {
		loadTemplates()
	}, [loadTemplates])

	// ── Создаём шаблон ────────────────────────────────────────────
	const createTemplate = useCallback(
		async (dto: TCreateTemplateDTO) => {
			if (!db) return null
			const id = generateId()
			const now = new Date().toISOString()
			const template: IWorkoutTemplate = {
				id,
				...dto,
				createdAt: now,
				updatedAt: now
			}

			addTemplate(template)
			try {
				await db.withTransactionAsync(async () => {
					await db.runAsync(
						'INSERT INTO workout_templates (id, name, type, created_at, updated_at) VALUES (?,?,?,?,?)',
						[id, dto.name, dto.type, now, now]
					)
					for (const ex of dto.exercises) {
						const exId = generateId()
						await db.runAsync(
							'INSERT INTO template_exercises (id, template_id, name, sort_order) VALUES (?,?,?,?)',
							[exId, id, ex.name, ex.sort_order]
						)

						for (const s of ex.sets) {
							await db.runAsync(
								'INSERT INTO template_sets (id, exercise_id, weight, reps) VALUES (?,?,?,?)',
								[generateId(), exId, s.weight, s.reps]
							)
						}
					}
				})

				return template
			} catch (e) {
				deleteTemplate(id)
				setError(String(e))
				return null
			}
		},
		[db]
	)
	// ── Удаляем шаблон ────────────────────────────────────────────
	const removeTemplate = useCallback(
		async (id: string) => {
			if (!db) return
			deleteTemplate(id)
			try {
				await db.runAsync('DELETE FROM workout_templates WHERE id = ?', [id])
			} catch (e) {
				setError(String(e))
			}
		},
		[db]
	)
	return { templates, loadTemplates, createTemplate, removeTemplate }
}

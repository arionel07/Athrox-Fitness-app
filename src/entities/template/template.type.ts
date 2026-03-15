/**
 * @file entities/template/template.type.ts
 * @description Шаблон тренировки.
 */

export interface ITemplateSet {
	weight: number
	reps: number
}
export interface ITemplateExercise {
	id: string
	name: string
	sort_order: number
	sets: ITemplateSet[]
}
export interface IWorkoutTemplate {
	id: string
	name: string
	type: 'strength' | 'cardio' | 'stretching'
	exercises: ITemplateExercise[]
	createdAt: string
	updatedAt: string
}

export type TCreateTemplateDTO = Omit<
	IWorkoutTemplate,
	'id' | 'createdAt' | 'updatedAt'
>

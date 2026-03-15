/**
 * @file shared/store/template.store.ts
 * @description Zustand store шаблонов тренировок.
 */

import { create } from 'zustand'
import { IWorkoutTemplate } from '../../entities/template/template.type'

interface ITemplateState {
	templates: IWorkoutTemplate[]
	isLoading: boolean
	error: string | null
	setTemplates: (templates: IWorkoutTemplate[]) => void
	addTemplate: (template: IWorkoutTemplate) => void
	deleteTemplate: (id: string) => void
	setLoading: (loading: boolean) => void
	setError: (error: string | null) => void
}

export const useTemplateStore = create<ITemplateState>(set => ({
	templates: [],
	isLoading: false,
	error: null,
	setTemplates: templates => set({ templates }),
	addTemplate: template =>
		set(s => ({ templates: [template, ...s.templates] })),
	deleteTemplate: id =>
		set(s => ({ templates: s.templates.filter(t => t.id !== id) })),
	setLoading: isLoading => set({ isLoading }),
	setError: error => set({ error })
}))

/**
 * @file shared/store/sleep.store.ts
 * @description Zustand store для сна.
 * Простой store — одна запись в день.
 */

import { ISleepSession } from '../../entities/sleep/sleep.type'

import { create } from 'zustand'

interface ISleepState {
	sessions: ISleepSession[]
	isLoading: boolean
	error: string | null

	setSessions: (sessions: ISleepSession[]) => void
	addSession: (session: ISleepSession) => void
	updateSession: (id: string, updates: Partial<ISleepSession>) => void
	deleteSession: (id: string) => void
	setLoading: (isLoading: boolean) => void
	setError: (error: string | null) => void
}

export const useSleepStore = create<ISleepState>(set => ({
	sessions: [],
	isLoading: false,
	error: null,

	setSessions: sessions => set({ sessions }),

	addSession: session =>
		set(state => ({ sessions: [session, ...state.sessions] })),

	updateSession: (id, updates) =>
		set(state => ({
			sessions: state.sessions.map(s =>
				s.id === id ? { ...s, ...updates } : s
			)
		})),

	deleteSession: id =>
		set(state => ({
			sessions: state.sessions.filter(s => s.id !== id)
		})),

	setLoading: isLoading => set({ isLoading }),
	setError: error => set({ error })
}))

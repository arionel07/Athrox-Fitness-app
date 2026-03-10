/**
 * @file shared/store/body.store.ts
 * @description Zustand store для метрик тела и фото прогресса.
 */

import { IBodyMetrics, IProgressPhoto } from '../../entities/body/body.type'

import { create } from 'zustand'

interface IBodyState {
	metrics: IBodyMetrics[]
	photos: IProgressPhoto[]
	isLoading: boolean
	error: string | null

	//metrics
	setMetrics: (metrics: IBodyMetrics[]) => void
	addMetrics: (metrics: IBodyMetrics) => void
	deleteMetrics: (id: string) => void

	//photo
	setPhotos: (photos: IProgressPhoto[]) => void
	addPhoto: (photo: IProgressPhoto) => void
	deletePhoto: (id: string) => void

	setLoading: (isLoading: boolean) => void
	setError: (error: string | null) => void
}

export const useBodyStore = create<IBodyState>(set => ({
	metrics: [],
	photos: [],
	isLoading: false,
	error: null,

	setMetrics: metrics => set({ metrics }),

	// ── Новые замеры сверху — актуальные данные видны первыми ─────────
	addMetrics: metrics =>
		set(state => ({
			metrics: [metrics, ...state.metrics]
		})),

	deleteMetrics: id =>
		set(state => ({
			metrics: state.metrics.filter(m => m.id !== id)
		})),

	setPhotos: photos => set({ photos }),

	addPhoto: photo => set(state => ({ photos: [photo, ...state.photos] })),

	deletePhoto: id =>
		set(state => ({
			photos: state.photos.filter(p => p.id !== id)
		})),

	setLoading: isLoading => set({ isLoading }),
	setError: error => set({ error })
}))

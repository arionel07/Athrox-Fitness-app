/**
 * @file shared/store/timer.store.ts
 * @description Zustand store для таймера отдыха.
 */

import { create } from 'zustand'

interface ITimerState {
	isVisible: boolean
	isRunning: boolean
	duration: number // выбранная длительность в секундах
	remaining: number // оставшееся время
	show: (duration: number) => void
	hide: () => void
	setRemaining: (remaining: number) => void
	setRunning: (running: boolean) => void
}

export const useTimerStore = create<ITimerState>(set => ({
	isVisible: false,
	isRunning: false,
	duration: 90,
	remaining: 90,
	show: duration =>
		set({ isVisible: true, isRunning: true, duration, remaining: duration }),
	hide: () => set({ isVisible: false, isRunning: false }),
	setRemaining: remaining => set({ remaining }),
	setRunning: isRunning => set({ isRunning })
}))

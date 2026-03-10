/**
 * @file shared/store/ui.store.ts
 * @description Store для UI состояния — тема, активный таб, модалки.
 *
 * Отделяем UI-state от данных — это важно:
 * — Тема не должна жить рядом с тренировками
 * — Легко найти откуда управляется любой UI элемент
 */

import { create } from 'zustand'

type TTheme = 'dark' | 'light'
type TActiveTab = 'dashboard' | 'workout' | 'nutrition' | 'progress' | 'profile'

interface IUIState {
	// ── Тема ────────────────────────────────────────────────────────
	theme: TTheme
	toggleTheme: () => void
	// ── Навигация ────────────────────────────────────────────────────
	activeTab: TActiveTab
	setActiveTab: (tab: TActiveTab) => void

	// ── Модальные окна ───────────────────────────────────────────────
	// Флаги открытия — конкретные данные передаются через пропсы
	isAddWorkoutModalOpen: boolean
	isAddFoodModalOpen: boolean
	isAddSleepModalOpen: boolean
	isAddWeightModalOpen: boolean

	setAddWorkoutModal: (open: boolean) => void
	setAddFoodModal: (open: boolean) => void
	setAddSleepModal: (open: boolean) => void
	setAddWeightModal: (open: boolean) => void
}

export const useUIStore = create<IUIState>(set => ({
	theme: 'dark',
	activeTab: 'dashboard',

	isAddWorkoutModalOpen: false,
	isAddFoodModalOpen: false,
	isAddSleepModalOpen: false,
	isAddWeightModalOpen: false,

	// ── Переключаем тему dark ↔ light ────────────────────────────────
	toggleTheme: () =>
		set(state => ({
			theme: state.theme === 'dark' ? 'light' : 'dark'
		})),

	setActiveTab: tab => set({ activeTab: tab }),

	setAddWorkoutModal: open => set({ isAddWorkoutModalOpen: open }),
	setAddFoodModal: open => set({ isAddFoodModalOpen: open }),
	setAddSleepModal: open => set({ isAddSleepModalOpen: open }),
	setAddWeightModal: open => set({ isAddWeightModalOpen: open })
}))

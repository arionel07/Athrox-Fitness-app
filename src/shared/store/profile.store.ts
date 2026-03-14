/**
 * @file shared/store/profile.store.ts
 * @description Zustand store профиля пользователя.
 */
import { create } from 'zustand'
import { IUserProfile } from '../../entities/user/user.type'

interface IProfileState {
	profile: IUserProfile | null
	isLoading: boolean
	error: string | null
	setProfile: (profile: IUserProfile | null) => void
	setLoading: (isLoading: boolean) => void
	setError: (error: string | null) => void
}

export const useProfileStore = create<IProfileState>(set => ({
	profile: null,
	isLoading: false,
	error: null,
	setProfile: profile => set({ profile }),
	setLoading: isLoading => set({ isLoading }),
	setError: error => set({ error })
}))

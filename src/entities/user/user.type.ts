/**
 * @file entities/user/user.type.ts
 * @description Профиль пользователя.
 */

export interface IUserProfile {
	id: string
	name: string
	weightGoal: number // целевой вес кг
	calorieGoal: number // целевые ккал в день
	proteinGoal: number // целевой белок г в день
	workoutsPerWeekGoal: number // тренировок в неделю
	createdAt: string
	updatedAt: string
}

export type TUserProfileInput = Omit<
	IUserProfile,
	'id' | 'createdAt' | 'updatedAt'
>

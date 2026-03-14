/**
 * @file app/(tabs)/index.tsx
 * @description Dashboard — главный экран аналитики недели.
 *
 * Структура (сверху вниз):
 * 1. DashboardHeader — приветствие + неделя
 * 2. ActivityCard — прогресс-бары
 * 3. MiniStatsGrid — 2x2 мини-карточки
 * 4. Insights — текстовые выводы из Weekly Report
 *
 * Данные: пока mock — подключим реальные после тестирования UI.
 */
//как можно поменьять логотип приложения на homescreen и названия
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBody } from '../../src/shared/hooks/useBody.hook'
import { useNutrition } from '../../src/shared/hooks/useNutrition.hook'
import { useProfile } from '../../src/shared/hooks/useProfile'
import { useSleep } from '../../src/shared/hooks/useSleep.hook'
import { useWorkouts } from '../../src/shared/hooks/useWorkouts.hook'
import { useBodyStore } from '../../src/shared/store/body.store'
import { useNutritionStore } from '../../src/shared/store/nutrition.store'
import { useSleepStore } from '../../src/shared/store/sleep.store'
import { useWorkoutStore } from '../../src/shared/store/workout.store'
import { Colors, Spacing } from '../../src/shared/theme/tokens.theme'
import { Card } from '../../src/shared/ui/Card'
import { Text } from '../../src/shared/ui/Text'
import { DashboardHeader } from '../../src/widgets/DashboardHeader/DashboardHeader'
import { ActivityCard } from '../../src/widgets/WeeklyStats/ActivityCard'
import { MiniStatsGrid } from '../../src/widgets/WeeklyStats/MiniStatsGrid'

// ─── Helpers ──────────────────────────────────────────────────────
function getWeekStartISO(): string {
	const now = new Date()
	const day = now.getDay()
	const diff = day === 0 ? -6 : 1 - day
	const monday = new Date(now)
	monday.setDate(now.getDate() + diff)
	monday.setHours(0, 0, 0, 0)
	return monday.toISOString()
}

function todayStr(): string {
	return new Date().toISOString().slice(0, 10)
}

function avg(arr: number[]): number {
	if (!arr.length) return 0
	return arr.reduce((a, b) => a + b, 0) / arr.length
}

export default function HomeScreen() {
	const { profile } = useProfile()

	// ── Данные из stores ───────────────────────────────────────────
	const sessions = useWorkoutStore(s => s.sessions)
	const metrics = useBodyStore(s => s.metrics)
	const sleepSessions = useSleepStore(s => s.sessions)
	// Питание: только активный день (сегодня)
	const activeDay = useNutritionStore(s => s.activeDay)

	// ── Функции загрузки из хуков ──────────────────────────────────
	// logMetrics = загрузить все метрики из БД в store
	const { loadSessions, getSessionsByDateRange } = useWorkouts()
	const { logMetrics } = useBody()
	const { loadSessions: loadSleep } = useSleep()
	const { loadDays } = useNutrition()

	const [refreshing, setRefreshing] = useState(false)

	// ── Начальная загрузка ─────────────────────────────────────────
	useEffect(() => {
		loadSessions()
		logMetrics() // загружает ВСЕ метрики в store
		loadSleep(30) // последние 30 дней
		loadDays(todayStr()) // сегодняшний день питания
	}, [])

	// ── Pull-to-refresh ────────────────────────────────────────────
	const onRefresh = useCallback(async () => {
		setRefreshing(true)
		await Promise.all([
			loadSessions(),
			logMetrics(),
			loadSleep(30),
			loadDays(todayStr())
		])
		setRefreshing(false)
	}, [loadSessions, logMetrics, loadSleep, loadDays])

	const weekStartISO = useMemo(() => getWeekStartISO(), [])
	const weekStartDate = weekStartISO.slice(0, 10)

	// ── Тренировки недели ──────────────────────────────────────────
	const workoutsThisWeek = useMemo(
		() => sessions.filter(s => s.startedAt >= weekStartISO).length,
		[sessions, weekStartISO]
	)
	// ── Вес ───────────────────────────────────────────────────────
	const sortedMetrics = useMemo(
		() => [...metrics].sort((a, b) => b.date.localeCompare(a.date)),
		[metrics]
	)
	const latestWeight = sortedMetrics[0]?.weightKg ?? null
	const prevWeight = sortedMetrics[1]?.weightKg ?? null
	const weightDelta =
		latestWeight != null && prevWeight != null
			? Math.round((latestWeight - prevWeight) * 10) / 10
			: null

	// ── Сон недели ────────────────────────────────────────────────
	const sleepThisWeek = useMemo(
		() => sleepSessions.filter(s => s.date >= weekStartDate),
		[sleepSessions, weekStartDate]
	)
	const avgSleepHours = useMemo(() => {
		const mins = sleepThisWeek.map(s => s.durationMinutes)
		if (!mins.length) return 0
		return Math.round(avg(mins) / 6) / 10
	}, [sleepThisWeek])

	// ── Питание — только сегодня ───────────────────────────────────
	const todayCalories = useMemo(() => {
		if (!activeDay) return 0

		return Math.round(
			activeDay.meals.reduce(
				(sum, m) => sum + m.items.reduce((s, i) => s + i.calories, 0),
				0
			)
		)
	}, [activeDay])
	const todayProtein = useMemo(() => {
		if (!activeDay) return 0

		return Math.round(
			activeDay.meals.reduce(
				(sum, m) => sum + m.items.reduce((s, i) => s + i.protein, 0),
				0
			)
		)
	}, [activeDay])

	// ── Инсайты ───────────────────────────────────────────────────
	const insights = useMemo(() => {
		const list: string[] = []

		list.push(
			workoutsThisWeek > 0
				? `Проведено тренировок: ${workoutsThisWeek}`
				: 'Тренировок на этой неделе пока нет'
		)

		if (latestWeight != null) {
			if (weightDelta != null && weightDelta !== 0) {
				list.push(
					weightDelta < 0
						? `Вес снизился на ${Math.abs(weightDelta)} кг`
						: `Вес вырос на ${weightDelta} кг`
				)
			} else {
				list.push(`Текущий вес: ${latestWeight} кг`)
			}
		}

		if (todayProtein > 0) {
			const goal = profile?.proteinGoal ?? 120
			list.push(
				todayProtein >= goal
					? `Белок в норме: ${todayProtein}г сегодня`
					: `Белок ниже нормы: ${todayProtein}г из ${goal}г`
			)
		}

		if (avgSleepHours > 0) {
			list.push(
				avgSleepHours >= 7
					? `Средний сон в норме: ${avgSleepHours}ч`
					: `Сон меньше нормы: ${avgSleepHours}ч`
			)
		}

		if (list.length === 1) {
			list.push('Начни вводить данные — здесь появится анализ')
		}

		return list
	}, [
		[
			workoutsThisWeek,
			latestWeight,
			weightDelta,
			todayProtein,
			avgSleepHours,
			profile
		]
	])

	// ── Форматирование ─────────────────────────────────────────────
	const weightDeltaLabel =
		weightDelta != null
			? weightDelta > 0
				? `+${weightDelta} кг`
				: `${weightDelta} кг`
			: undefined
	const weightDeltaVariant =
		weightDelta != null
			? ((weightDelta <= 0 ? 'success' : 'warning') as 'success' | 'warning')
			: undefined

	const workoutsGoal = profile?.workoutsPerWeekGoal ?? 3
	const caloriesGoal = profile?.calorieGoal ?? 2400

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: Colors.background }}
			edges={['top', 'bottom']}
		>
			<ScrollView
				contentContainerStyle={{
					paddingHorizontal: Spacing.lg,
					paddingTop: Spacing.xl,
					paddingBottom: 120,
					gap: Spacing.lg
				}}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={Colors.primary}
					/>
				}
			>
				{/* 1. Шапка */}
				<DashboardHeader userName={profile?.name} />

				{/* 2. Активность недели */}
				<ActivityCard
					workoutsThisWeek={workoutsThisWeek}
					workoutsGoal={workoutsGoal}
					avgCalories={todayCalories}
					caloriesGoal={caloriesGoal}
					avgSleepHours={avgSleepHours}
					sleepGoal={8}
				/>

				{/* 3. Секция восстановление */}
				<View style={{ gap: Spacing.sm }}>
					<Text variant="label">Восстановление</Text>
					<MiniStatsGrid
						sleep={{
							label: 'Сон',
							value: avgSleepHours ? String(avgSleepHours) : '—',
							unit: 'ч'
						}}
						protein={{
							label: 'Белок',
							value: todayProtein ? String(todayProtein) : '—',
							unit: 'г'
						}}
						weight={{
							label: 'Вес',
							value: latestWeight != null ? String(latestWeight) : '—',
							unit: 'кг',
							delta: weightDeltaLabel,
							deltaVariant: weightDeltaVariant
						}}
						calories={{
							label: 'Ккал',
							value: todayCalories ? String(todayCalories) : '—',
							unit: 'ккал'
						}}
					/>
				</View>

				{/* 4. AI инсайты */}
				<View style={{ gap: Spacing.sm }}>
					<Text variant="label">Анализ недели</Text>
					<Card variant="glass">
						<View style={{ gap: Spacing.md }}>
							{insights.map((insight, index) => (
								<View
									key={index}
									style={{
										flexDirection: 'row',
										alignItems: 'flex-start',
										gap: Spacing.sm
									}}
								>
									{/* Точка-маркер */}
									<View
										style={{
											width: 6,
											height: 6,
											borderRadius: 3,
											backgroundColor: Colors.primary,
											marginTop: 6
										}}
									/>
									<Text
										variant="body"
										style={{ flex: 1 }}
									>
										{insight}
									</Text>
								</View>
							))}
						</View>
					</Card>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

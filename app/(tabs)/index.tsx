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
import { useCallback, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Spacing } from '../../src/shared/theme/tokens.theme'
import { Card } from '../../src/shared/ui/Card'
import { Text } from '../../src/shared/ui/Text'
import { DashboardHeader } from '../../src/widgets/DashboardHeader/DashboardHeader'
import { ActivityCard } from '../../src/widgets/WeeklyStats/ActivityCard'
import { MiniStatsGrid } from '../../src/widgets/WeeklyStats/MiniStatsGrid'

// ─── Mock данные — заменим на реальные в следующем шаге ──────────
const MOCK_DATA = {
	workoutsThisWeek: 3,
	workoutsGoal: 4,
	avgCalories: 2100,
	caloriesGoal: 2400,
	avgSleepHours: 7.2,
	sleepGoal: 8,
	avgProtein: 145,
	currentWeight: 82.4,
	weightDelta: -0.6,
	insights: [
		'Проведено тренировок: 3',
		'Сила выросла в 2 упражнениях',
		'Вес тела снизился на 0.6 кг',
		'Белок в норме: 145г в день',
		'Средний сон в норме: 7.2ч'
	]
}

export default function HomeScreen() {
	const [refreshing, setRefreshing] = useState(false)

	const onRefresh = useCallback(async () => {
		setRefreshing(true)
		// TODO: подключим реальные данные
		await new Promise(r => setTimeout(r, 500))
		setRefreshing(false)
	}, [])

	// Форматируем delta веса для Badge
	const weightDeltaLabel = useMemo(() => {
		const d = MOCK_DATA.weightDelta
		return d > 0 ? `+${d} KG` : `${d} кг`
	}, [])

	const weightDeltaVariant = useMemo(() => {
		// Для похудения: снижение = хорошо
		return MOCK_DATA.weightDelta <= 0 ? 'success' : 'warning'
	}, [])

	// // Если этот хук не бросает ошибку — БД готова
	// const db = useDatabase()

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: Colors.background }}
			edges={['top', 'bottom']}
		>
			<ScrollView
				contentContainerStyle={{
					paddingHorizontal: Spacing.lg,
					paddingTop: Spacing.xl,
					paddingBottom: Spacing.xxxl,
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
				<DashboardHeader />

				{/* 2. Активность недели */}
				<ActivityCard
					workoutsThisWeek={MOCK_DATA.workoutsThisWeek}
					workoutsGoal={MOCK_DATA.workoutsGoal}
					avgCalories={MOCK_DATA.avgCalories}
					caloriesGoal={MOCK_DATA.caloriesGoal}
					avgSleepHours={MOCK_DATA.avgSleepHours}
					sleepGoal={MOCK_DATA.sleepGoal}
				/>

				{/* 3. Секция восстановление */}
				<View style={{ gap: Spacing.sm }}>
					<Text variant="label">Восстановление</Text>
					<MiniStatsGrid
						sleep={{
							label: 'Сон',
							value: String(MOCK_DATA.avgSleepHours),
							unit: 'ч'
						}}
						protein={{
							label: 'Белок',
							value: String(MOCK_DATA.avgProtein),
							unit: 'г'
						}}
						weight={{
							label: 'Вес',
							value: String(MOCK_DATA.currentWeight),
							unit: 'кг',
							delta: weightDeltaLabel,
							deltaVariant: weightDeltaVariant
						}}
						calories={{
							label: 'Ккал',
							value: String(MOCK_DATA.avgCalories),
							unit: 'ккал'
						}}
					/>
				</View>

				{/* 4. AI инсайты */}
				<View style={{ gap: Spacing.sm }}>
					<Text variant="label">Анализ недели</Text>
					<Card variant="glass">
						<View style={{ gap: Spacing.md }}>
							{MOCK_DATA.insights.map((insight, index) => (
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

/**
 * @file app/workout-history.tsx
 * @description Экран истории тренировок.
 * Открывается поверх табов — отдельный Stack экран.
 */

import { router } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	Alert,
	RefreshControl,
	ScrollView,
	TouchableOpacity,
	View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useWorkouts } from '../src/shared/hooks/useWorkouts.hook'
import { useWorkoutStore } from '../src/shared/store/workout.store'
import { Colors, Spacing } from '../src/shared/theme/tokens.theme'
import { Text } from '../src/shared/ui/Text'
import { WorkoutHistoryCard } from '../src/widgets/WorkoutHistory/WorkoutHistoryCard'

const FILTERS = [
	{ key: 'all', label: 'Все' },
	{ key: 'strength', label: 'Силовые' },
	{ key: 'cardio', label: 'Кардио' },
	{ key: 'stretching', label: 'Растяжка' }
] as const

type FilterKey = (typeof FILTERS)[number]['key']

export default function WorkoutHistoryScreen() {
	const sessions = useWorkoutStore(s => s.sessions)
	const { loadSessions, removeSession } = useWorkouts()

	const [refreshing, setRefreshing] = useState(false)
	const [filter, setFilter] = useState<FilterKey>('all')

	useEffect(() => {
		loadSessions()
	}, [])

	const onRefresh = useCallback(async () => {
		setRefreshing(true)
		await loadSessions()
		setRefreshing(false)
	}, [loadSessions])

	// Фильтрация
	const filtered = useMemo(() => {
		const sorted = [...sessions].sort((a, b) =>
			b.startedAt.localeCompare(a.startedAt)
		)
		if (filter === 'all') return sorted
		return sorted.filter(s => s.type === filter)
	}, [sessions, filter])

	const handleDelete = useCallback(
		(id: string) => {
			Alert.alert('Удалить тренировку?', 'Это действие нельзя отменить.', [
				{ text: 'Отмена', style: 'cancel' },
				{
					text: 'Удалить',
					style: 'destructive',
					onPress: () => removeSession(id)
				}
			])
		},
		[removeSession]
	)

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: Colors.background }}
			edges={['top']}
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
				{/* ── Header ──────────────────────────────────────── */}
				<View
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between'
					}}
				>
					<Text variant="h2">История</Text>
					<TouchableOpacity
						onPress={() => router.back()}
						activeOpacity={0.7}
					>
						<Text
							variant="bodySmall"
							color={Colors.muted}
						>
							Закрыть
						</Text>
					</TouchableOpacity>
				</View>

				{/* ── Счётчик ─────────────────────────────────────── */}
				<Text style={{ flexDirection: 'row', gap: Spacing.sm }}>
					{filtered.length}{' '}
					{filtered.length === 1 ? 'тренировка' : 'тренировка'}
				</Text>

				{/* ── Фильтры ─────────────────────────────────────── */}
				<View style={{ flexDirection: 'row', gap: Spacing.sm }}>
					{FILTERS.map(({ key, label }) => (
						<TouchableOpacity
							key={key}
							onPress={() => setFilter(key)}
							activeOpacity={0.7}
							style={{
								paddingHorizontal: Spacing.md,
								paddingVertical: Spacing.xs,
								borderRadius: 20,
								borderWidth: 1,
								borderColor: filter === key ? Colors.primary : Colors.border,
								backgroundColor:
									filter === key ? 'rgba(0,114,245,0.1)' : 'transparent'
							}}
						>
							<Text
								variant="metricTiny"
								color={filter === key ? Colors.primary : Colors.muted}
							>
								{label}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* ── Список ──────────────────────────────────────── */}
				{filtered.length === 0 ? (
					<View
						style={{
							paddingVertical: 60,
							alignItems: 'center',
							gap: Spacing.sm
						}}
					>
						<Text
							variant="h3"
							color={Colors.muted}
						>
							—
						</Text>
						<Text
							variant="bodySmall"
							color={Colors.muted}
						>
							Тренировок пока нет
						</Text>
					</View>
				) : (
					filtered.map(session => (
						<WorkoutHistoryCard
							key={session.id}
							session={session}
							onDelete={handleDelete}
						/>
					))
				)}
			</ScrollView>
		</SafeAreaView>
	)
}

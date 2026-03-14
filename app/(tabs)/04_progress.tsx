/**
 * @file app/(tabs)/04_progress.tsx
 * @description Экран прогресса — вес, сон, фото.
 */

import * as ImagePicker from 'expo-image-picker'
import { useCallback, useEffect, useState } from 'react'
import { Alert, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { IProgressPhoto } from '../../src/entities/body/body.type'
import { useBody } from '../../src/shared/hooks/useBody.hook'
import { useSleep } from '../../src/shared/hooks/useSleep.hook'
import { useBodyStore } from '../../src/shared/store/body.store'
import { useSleepStore } from '../../src/shared/store/sleep.store'
import { Colors, Spacing } from '../../src/shared/theme/tokens.theme'
import { Text } from '../../src/shared/ui/Text'

const ANGLES: { key: IProgressPhoto['angle']; label: string }[] = [
	{ key: 'front', label: 'Спереди' },
	{ key: 'side', label: 'Сбоку' },
	{ key: 'back', label: 'Сзади' }
]

export default function ProgressScreen() {
	const { logMetrics, loadMetrics, savePhoto, loadPhotos } = useBody()
	const { loadSessions: loadSleep, logSleep } = useSleep()

	const metrics = useBodyStore(s => s.metrics)
	const photos = useBodyStore(s => s.photos)
	const sleepSessions = useSleepStore(s => s.sessions)

	const [isSavingWeight, setIsSavingWeight] = useState(false)
	const [isSavingSleep, setIsSavingSleep] = useState(false)

	// Загружаем данные при монтировании
	useEffect(() => {
		logMetrics() // загружает метрики в store
		loadPhotos()
		loadSleep(30)
	}, [])

	// ── Данные для графика веса ────────────────────────────────────
	const weightData = [...metrics]
		.sort((a, b) => a.date.localeCompare(b.date))
		.slice(-30)
		.map(m => ({
			label: m.date.slice(5), // MM-DD
			value: m.weightKg
		}))

	// ── Сохраняем замер веса ───────────────────────────────────────
	const handleSaveWeight = useCallback(
		async (weightKg: number, bodyFatPercent: number | null, notes: string) => {
			setIsSavingWeight(true)
			await loadMetrics(weightKg, bodyFatPercent, notes)
			setIsSavingWeight(false)
			Alert.alert('Сохранено', `Вес ${weightKg} кг записан ✓`)
		},
		[loadMetrics]
	)

	// ── Сохраняем сон ──────────────────────────────────────────────
	const handleSaveSleep = useCallback(
		async (bedtime: string, wakeTime: string, quality: number) => {
			setIsSavingSleep(true)
			const date = new Date().toISOString().slice(0, 10)
			await logSleep(date, bedtime, wakeTime, quality as any)
			await loadSleep(30)
			setIsSavingSleep(false)
			Alert.alert('Сохранено', 'Сон записан ✓')
		},
		[logSleep, loadSleep]
	)

	// ── Фото ───────────────────────────────────────────────────────
	const handlePickPhoto = useCallback(
		async (angle: IProgressPhoto['angle']) => {
			const status = await ImagePicker.requestMediaLibraryPermissionsAsync()
			if (status !== 'granted') {
				Alert.alert('Нет доступа', 'Разрешите доступ к фото в настройках')
				return
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				quality: 0.8,
				allowsEditing: true,
				aspect: [3, 4]
			})

			if (!result.canceled && result.assets[0]) {
				await savePhoto(result.assets[0].uri, angle)
				Alert.alert('Сохранено', 'Фото добавлено ✓')
			}
		},
		[savePhoto]
	)

	// Последнее фото по углу

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: Colors.background }}
			edges={['top']}
		>
			<View style={{ padding: Spacing.lg }}>
				<Text variant="h2">Прогресс</Text>
				<Text
					variant="bodySmall"
					style={{ marginTop: Spacing.sm }}
				>
					В разработке
				</Text>
			</View>
		</SafeAreaView>
	)
}

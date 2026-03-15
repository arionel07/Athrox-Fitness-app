/**
 * @file app/(tabs)/04_progress.tsx
 * @description Экран прогресса — вес, сон, фото.
 */

import * as ImagePicker from 'expo-image-picker'
import { useCallback, useEffect, useState } from 'react'
import { Alert, Image, ScrollView, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { IProgressPhoto } from '../../src/entities/body/body.type'
import { useBody } from '../../src/shared/hooks/useBody.hook'
import { useSleep } from '../../src/shared/hooks/useSleep.hook'
import { useBodyStore } from '../../src/shared/store/body.store'
import { useSleepStore } from '../../src/shared/store/sleep.store'
import { Colors, Radius, Spacing } from '../../src/shared/theme/tokens.theme'
import { Card } from '../../src/shared/ui/Card'
import { CameraIcon, GalleryIcon } from '../../src/shared/ui/Icons'
import { Text } from '../../src/shared/ui/Text'
import { LineChart } from '../../src/widgets/ProgressChart/LineChart'
import { SleepChart } from '../../src/widgets/ProgressChart/SleepChart'
import { SleepLogger } from '../../src/widgets/ProgressChart/SleepLogger'
import { WeightLogger } from '../../src/widgets/ProgressChart/WeightLogger'

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
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
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

	const handleTakePhoto = useCallback(
		async (angle: IProgressPhoto['angle']) => {
			const { status } = await ImagePicker.requestCameraPermissionsAsync()
			if (status !== 'granted') {
				Alert.alert('Нет доступа', 'Разрешите доступ к камере в настройках')
				return
			}
			try {
				const result = await ImagePicker.launchCameraAsync({
					quality: 0.8,
					allowsEditing: true,
					aspect: [3, 4]
				})
				if (!result.canceled && result.assets[0]) {
					await savePhoto(result.assets[0].uri, angle)
					Alert.alert('Сохранено', 'Фото добавлено ✓')
				}
			} catch (e) {
				// Камера недоступна на симуляторе — предлагаем галерею
				Alert.alert(
					'Камера недоступна',
					'На симуляторе камера не работает. Выбрать фото из галереи?',
					[
						{ text: 'Отмена', style: 'cancel' },
						{ text: 'Галерея', onPress: () => handlePickPhoto(angle) }
					]
				)
			}
		},
		[savePhoto, handlePickPhoto]
	)

	// Последнее фото по углу

	const latestPhoto = (angle: IProgressPhoto['angle']) =>
		[...photos]
			.filter(p => p.angle === angle)
			.sort((a, b) => b.date.localeCompare(a.date))[0]

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
					gap: Spacing.xl
				}}
				showsVerticalScrollIndicator={false}
			>
				<Text variant="h2">Прогресс</Text>

				{/* ── Вес ───────────────────────────────────────────── */}
				<View style={{ gap: Spacing.sm }}>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							alignItems: 'center'
						}}
					>
						<Text variant="label">Вес</Text>
						{metrics.length > 0 && (
							<Text
								variant="metricTiny"
								color={Colors.muted}
							>
								{' '}
								{metrics[0]?.weightKg} кг
							</Text>
						)}
					</View>
					<Card style={{ gap: Spacing.sm }}>
						{weightData.length >= 2 ? (
							<LineChart
								data={weightData}
								color={Colors.primary}
								unit="кг"
							/>
						) : (
							<View
								style={{ paddingVertical: Spacing.lg, alignItems: 'center' }}
							>
								<Text
									variant="bodySmall"
									color={Colors.muted}
								>
									Добавь 2+ замера для графика
								</Text>
							</View>
						)}
					</Card>

					<WeightLogger
						onSave={handleSaveWeight}
						isSaving={isSavingWeight}
					/>
				</View>

				{/* ── Сон ───────────────────────────────────────────── */}
				<View style={{ gap: Spacing.sm }}>
					<Text variant="label">Сон</Text>

					<Card style={{ gap: Spacing.sm }}>
						<SleepChart sessions={sleepSessions} />
					</Card>

					<SleepLogger
						onSave={handleSaveSleep}
						isSaving={isSavingSleep}
					/>
				</View>

				{/* ── Фото прогресса ────────────────────────────────── */}
				<View style={{ gap: Spacing.sm }}>
					<Text variant="label">Фото прогресса</Text>

					<View style={{ flexDirection: 'row', gap: Spacing.sm }}>
						{ANGLES.map(({ key, label }) => {
							const photo = latestPhoto(key)
							return (
								<View
									key={key}
									style={{ flex: 1, gap: Spacing.xs }}
								>
									<Text
										variant="label"
										style={{ textAlign: 'center' }}
									>
										{label}
									</Text>
									{/* Превью или плейсхолдер */}
									<View
										style={{
											aspectRatio: 3 / 4,
											backgroundColor: Colors.surface,
											borderRadius: Radius.md,
											borderWidth: 1,
											borderColor: Colors.border,
											overflow: 'hidden'
										}}
									>
										{photo ? (
											<Image
												source={{ uri: photo.localUri }}
												style={{ width: '100%', height: '100%' }}
												resizeMode="cover"
											/>
										) : (
											<View
												style={{
													flex: 1,
													alignItems: 'center',
													justifyContent: 'center'
												}}
											>
												<Text
													variant="metricTiny"
													color={Colors.muted}
												>
													нет фото
												</Text>
											</View>
										)}
									</View>

									{/* Кнопки */}
									<View style={{ flexDirection: 'row', gap: 4 }}>
										<TouchableOpacity
											onPress={() => handleTakePhoto(key)}
											style={{
												flex: 1,
												paddingVertical: 8,
												backgroundColor: Colors.primary,
												borderRadius: Radius.sm,
												alignItems: 'center'
											}}
										>
											<CameraIcon
												color={Colors.foreground}
												size={15}
											/>
										</TouchableOpacity>
										<TouchableOpacity
											onPress={() => handlePickPhoto(key)}
											style={{
												flex: 1,
												paddingVertical: 8,
												backgroundColor: Colors.surface,
												borderRadius: Radius.sm,
												alignItems: 'center',
												borderWidth: 1,
												borderColor: Colors.border
											}}
										>
											<GalleryIcon
												color={Colors.muted}
												size={15}
											/>
										</TouchableOpacity>
									</View>
								</View>
							)
						})}
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

/**
 * @file app/(tabs)/05_profile.tsx
 * @description Экран профиля — имя и цели пользователя.
 */

import { useCallback, useEffect, useState } from 'react'
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useProfile } from '../../src/shared/hooks/useProfile'
import { Colors, Radius, Spacing } from '../../src/shared/theme/tokens.theme'
import { Button } from '../../src/shared/ui/Button'
import { Card } from '../../src/shared/ui/Card'
import { Input } from '../../src/shared/ui/Input'
import { Text } from '../../src/shared/ui/Text'

// ─── Секция настроек ──────────────────────────────────────────────
function SettingsSection({
	title,
	children
}: {
	title: string
	children: React.ReactNode
}) {
	return (
		<View style={{ gap: Spacing.sm }}>
			<Text variant="label">{title}</Text>
			<Card style={{ gap: Spacing.md }}>{children}</Card>
		</View>
	)
}

// ─── Строка метрики ───────────────────────────────────────────────

function MetricRow({
	label,
	value,
	unit,
	onChangeText,
	keyboardType = 'decimal-pad'
}: {
	label: string
	value: string
	unit: string
	onChangeText: (v: string) => void
	keyboardType?: 'decimal-pad' | 'number-pad'
}) {
	return (
		<View
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: Spacing.md
			}}
		>
			<Text
				variant="body"
				style={{ flex: 1 }}
			>
				{label}
			</Text>
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					gap: Spacing.xs
				}}
			>
				<View
					style={{
						backgroundColor: Colors.surface,
						borderWidth: 1,
						borderColor: Colors.border,
						borderRadius: Radius.sm,
						paddingHorizontal: Spacing.md,
						paddingVertical: Spacing.xs,
						minWidth: 80,
						alignItems: 'center'
					}}
				>
					<Input
						value={value}
						onChangeText={onChangeText}
						keyboardType={keyboardType}
						style={{
							backgroundColor: 'transparent',
							borderWidth: 0,
							padding: 0,
							textAlign: 'center',
							fontFamily: 'GeistMono',
							fontSize: 16,
							minWidth: 60
						}}
					/>
				</View>
				<Text
					variant="bodySmall"
					color={Colors.muted}
					style={{ width: 40 }}
				>
					{unit}
				</Text>
			</View>
		</View>
	)
}

export default function ProfileScreen() {
	const { profile, isLoading, updateProfile } = useProfile()
	const [isSaving, setIsSaving] = useState(false)

	// ── Локальный state для формы ──────────────────────────────────
	const [name, setName] = useState('')
	const [weightGoal, setWeightGoal] = useState('')
	const [calorieGoal, setCalorieGoal] = useState('')
	const [proteinGoal, setProteinGoal] = useState('')
	const [workoutsGoal, setWorkoutsGoal] = useState('')

	useEffect(() => {
		if (profile) {
			setName(profile.name)
			setWeightGoal(String(profile.weightGoal))
			setCalorieGoal(String(profile.calorieGoal))
			setProteinGoal(String(profile.proteinGoal))
			setWorkoutsGoal(String(profile.workoutsPerWeekGoal))
		}
	}, [profile])

	// ── Сохранение ─────────────────────────────────────────────────
	const handleSave = useCallback(async () => {
		if (!name.trim()) {
			Alert.alert('Ошибка', 'Введите имя')
			return
		}

		setIsSaving(true)
		const result = await updateProfile({
			name: name.trim(),
			weightGoal: parseFloat(weightGoal) || 80,
			calorieGoal: parseInt(calorieGoal) || 2400,
			proteinGoal: parseInt(proteinGoal) || 160,
			workoutsPerWeekGoal: parseInt(workoutsGoal) || 4
		})
		setIsSaving(false)

		if (result) {
			Alert.alert('Сохранено', 'Профиль обновлён ✓')
		}
	}, [name, weightGoal, calorieGoal, proteinGoal, workoutsGoal, updateProfile])

	// ── Аватар — первая буква имени ────────────────────────────────
	const avatarLetter = (name || profile?.name || 'A')[0].toUpperCase()

	if (isLoading) {
		return (
			<SafeAreaView
				style={{
					flex: 1,
					backgroundColor: Colors.background,
					alignItems: 'center',
					justifyContent: 'center'
				}}
				edges={['top']}
			>
				<Text color={Colors.muted}>Загрузка...</Text>
			</SafeAreaView>
		)
	}

	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: Colors.background }}
			edges={['top']}
		>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<ScrollView
					contentContainerStyle={{
						paddingHorizontal: Spacing.lg,
						paddingTop: Spacing.xl,
						paddingBottom: 120,
						gap: Spacing.xl
					}}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					{/* ── Header ────────────────────────────────────────── */}
					<Text variant="h2">Профиль</Text>
					{/* ── Аватар ────────────────────────────────────────── */}
					<View style={{ alignItems: 'center', gap: Spacing.md }}>
						<View
							style={{
								width: 80,
								height: 80,
								borderRadius: 40,
								backgroundColor: Colors.primary,
								alignItems: 'center',
								justifyContent: 'center'
							}}
						>
							<Text
								variant="h2"
								style={{ color: Colors.foreground, fontSize: 32 }}
							>
								{avatarLetter}
							</Text>
						</View>
						<Text color={Colors.muted}>Атлет {name}</Text>
					</View>
					{/* ── Личные данные ──────────────────────────────────── */}
					<SettingsSection title="Личные данные">
						<Input
							label="Имя"
							value={name}
							onChangeText={setName}
							placeholder="Твоё имя"
							returnKeyType="done"
						/>
					</SettingsSection>
					{/* ── Цели ──────────────────────────────────────────── */}
					<SettingsSection title="Цели">
						<MetricRow
							label="Целевой вес"
							value={weightGoal}
							unit="кг"
							onChangeText={setWeightGoal}
						/>
						<View style={{ height: 1, backgroundColor: Colors.border }} />
						<MetricRow
							label="Калории в день"
							value={calorieGoal}
							unit="ккал"
							onChangeText={setCalorieGoal}
							keyboardType="number-pad"
						/>
						<View style={{ height: 1, backgroundColor: Colors.border }} />

						<MetricRow
							label="Белок в день"
							value={proteinGoal}
							unit="г"
							onChangeText={setProteinGoal}
							keyboardType="number-pad"
						/>
						<View style={{ height: 1, backgroundColor: Colors.border }} />
						<MetricRow
							label="Тренировок в неделю"
							value={workoutsGoal}
							unit="раз"
							onChangeText={setWorkoutsGoal}
							keyboardType="number-pad"
						/>
					</SettingsSection>
					{/* ── Сохранить ─────────────────────────────────────── */}

					<Button
						label="Сохранить"
						variant="primary"
						size="lg"
						fullWidth
						isLoading={isSaving}
						onPress={handleSave}
					/>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	)
}

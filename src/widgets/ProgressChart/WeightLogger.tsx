/**
 * @file widgets/ProgressChart/WeightLogger.tsx
 * @description Форма записи замера веса.
 */

import { memo, useState } from 'react'
import { Alert, TextInput, TouchableOpacity, View } from 'react-native'
import { Colors, Radius, Spacing } from '../../shared/theme/tokens.theme'
import { Text } from '../../shared/ui/Text'

interface WeightLoggerProps {
	onSave: (
		weightKg: number,
		bodyFatPercent: number | null,
		notes: string
	) => void
	isSaving?: boolean
}

export const WeightLogger = memo(({ onSave, isSaving }: WeightLoggerProps) => {
	const [weight, setWeight] = useState('')
	const [fat, setFat] = useState('')
	const [expanded, setExpanded] = useState(false)

	const handleSave = () => {
		const w = parseFloat(weight)
		if (!weight || isNaN(w)) {
			Alert.alert('Ошибка', 'Введите вес')
			return
		}

		const f = fat ? parseFloat(fat) : null
		onSave(w, f, '')
		setWeight('')
		setFat('')
		setExpanded(false)
	}

	if (!expanded) {
		return (
			<TouchableOpacity
				onPress={() => setExpanded(true)}
				activeOpacity={0.7}
				style={{
					borderWidth: 1,
					borderColor: Colors.border,
					borderStyle: 'dashed',
					borderRadius: Radius.md,
					paddingVertical: Spacing.md,
					alignItems: 'center'
				}}
			>
				<Text
					variant="bodySmall"
					color={Colors.muted}
				>
					+ Записать замер
				</Text>
			</TouchableOpacity>
		)
	}

	return (
		<View
			style={{
				backgroundColor: Colors.surface,
				borderRadius: Radius.md,
				padding: Spacing.md,
				gap: Spacing.sm
			}}
		>
			<View style={{ flexDirection: 'row', gap: Spacing.sm }}>
				<View style={{ flex: 1, gap: 4 }}>
					<Text variant="label">Вес *</Text>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: Spacing.xs
						}}
					>
						<TextInput
							value={weight}
							onChangeText={setWeight}
							placeholder="82.5"
							placeholderTextColor={Colors.muted}
							keyboardType="decimal-pad"
							style={{
								flex: 1,
								backgroundColor: Colors.background,
								borderWidth: 1,
								borderColor: Colors.border,
								borderRadius: Radius.sm,
								paddingHorizontal: Spacing.md,
								paddingVertical: Spacing.sm,
								color: Colors.foreground,
								fontFamily: 'GeistMono',
								fontSize: 16,
								textAlign: 'center'
							}}
						/>
						<Text
							variant="bodySmall"
							color={Colors.muted}
						>
							кг
						</Text>
					</View>
				</View>

				<View style={{ flex: 1, gap: 4 }}>
					<Text variant="label">% жира</Text>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: Spacing.xs
						}}
					>
						<TextInput
							value={fat}
							onChangeText={setFat}
							placeholder="18.0"
							placeholderTextColor={Colors.muted}
							keyboardType="decimal-pad"
							style={{
								flex: 1,
								backgroundColor: Colors.background,
								borderWidth: 1,
								borderColor: Colors.border,
								borderRadius: Radius.sm,
								paddingHorizontal: Spacing.md,
								paddingVertical: Spacing.sm,
								color: Colors.foreground,
								fontFamily: 'GeistMono',
								fontSize: 16,
								textAlign: 'center'
							}}
						/>
						<Text
							variant="bodySmall"
							color={Colors.muted}
						>
							%
						</Text>
					</View>
				</View>
			</View>

			<View style={{ flexDirection: 'row', gap: Spacing.sm }}>
				<TouchableOpacity
					onPress={() => setExpanded(false)}
					style={{
						flex: 1,
						paddingVertical: Spacing.sm,
						borderRadius: Radius.sm,
						borderWidth: 1,
						borderColor: Colors.border,
						alignItems: 'center'
					}}
				>
					<Text
						variant="bodySmall"
						color={Colors.muted}
					>
						Отмена
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={handleSave}
					disabled={isSaving}
					style={{
						flex: 2,
						paddingVertical: Spacing.sm,
						borderRadius: Radius.sm,
						backgroundColor: Colors.primary,
						alignItems: 'center'
					}}
				>
					<Text
						variant="bodySmall"
						color={Colors.foreground}
					>
						{isSaving ? 'Сохраняем...' : 'Сохранить'}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
})

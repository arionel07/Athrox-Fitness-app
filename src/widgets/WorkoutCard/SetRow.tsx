/**
 * @file widgets/WorkoutCard/SetRow.tsx
 * @description Одна строка подхода — вес × повторения + чекбокс.
 *
 * Оптимизация:
 * — memo: не ре-рендерится если пропсы не изменились
 * — onChangeWeight/onChangeReps — стабильные коллбэки из родителя
 */

import { memo } from 'react'
import { TextInput, TouchableOpacity, View } from 'react-native'
import { Colors, Radius, Spacing } from '../../shared/theme/tokens.theme'
import { Text } from '../../shared/ui/Text'

interface ISetRowProps {
	index: number // номер подхода (1, 2, 3...)
	weight: string // строка для TextInput
	reps: string
	completed: boolean

	onChangeWeight: (value: string) => void
	onChangeReps: (value: string) => void
	onToggleCompleted: () => void
	onDelete: () => void
}

export const SetRow = memo(
	({
		index,
		weight,
		reps,
		completed,
		onChangeWeight,
		onChangeReps,
		onToggleCompleted,
		onDelete
	}: ISetRowProps) => {
		return (
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					gap: Spacing.sm,
					paddingVertical: Spacing.xs
				}}
			>
				{/* Номер подхода */}
				<Text
					variant="metricTiny"
					color={Colors.muted}
					style={{ width: 20, textAlign: 'center' }}
				>
					{' '}
					{index}
				</Text>
				{/* Вес (кг) */}
				<View style={{ flex: 1, alignItems: 'center' }}>
					<TextInput
						value={weight}
						onChangeText={onChangeWeight}
						keyboardType="decimal-pad"
						placeholder="0"
						placeholderTextColor={Colors.muted}
						style={{
							backgroundColor: Colors.surface,
							borderWidth: 1,
							borderColor: completed ? Colors.primary : Colors.border,
							borderRadius: Radius.sm,
							paddingHorizontal: Spacing.sm,
							paddingVertical: Spacing.xs,
							color: Colors.foreground,
							fontFamily: 'GeistMono',
							fontSize: 15,
							textAlign: 'center',
							width: '100%'
						}}
					/>
					<Text
						variant="metricTiny"
						style={{ marginTop: 2 }}
					>
						KG
					</Text>
				</View>

				{/* Разделитель */}
				<Text color={Colors.muted}>×</Text>
				{/* Повторения */}
				<View style={{ flex: 1, alignItems: 'center' }}>
					<TextInput
						value={reps}
						onChangeText={onChangeReps}
						keyboardType="number-pad"
						placeholder="0"
						placeholderTextColor={Colors.muted}
						style={{
							backgroundColor: Colors.surface,
							borderWidth: 1,
							borderColor: completed ? Colors.primary : Colors.border,
							borderRadius: Radius.sm,
							paddingHorizontal: Spacing.sm,
							paddingVertical: Spacing.xs,
							color: Colors.foreground,
							fontFamily: 'GeistMono',
							fontSize: 15,
							textAlign: 'center',
							width: '100%'
						}}
					/>
					<Text
						variant="metricTiny"
						style={{ marginTop: 2 }}
					>
						Reps
					</Text>
				</View>
				{/* Чекбокс выполнения */}
				<TouchableOpacity
					onPress={onToggleCompleted}
					activeOpacity={0.7}
					style={{
						width: 28,
						height: 28,
						borderRadius: Radius.sm,
						borderWidth: 1.5,
						borderColor: completed ? Colors.primary : Colors.border,
						backgroundColor: completed ? Colors.primary : 'transparent',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					{completed && (
						<Text
							variant="metricTiny"
							color={Colors.foreground}
						>
							✓
						</Text>
					)}
				</TouchableOpacity>
				{/* Удалить подход */}
				<TouchableOpacity
					onPress={onDelete}
					activeOpacity={0.7}
					style={{ padding: Spacing.xs }}
				>
					<Text
						variant="metricTiny"
						color={Colors.muted}
					>
						✕
					</Text>
				</TouchableOpacity>
			</View>
		)
	}
)

/**
 * @file widgets/ProgressChart/SleepLogger.tsx
 * @description Форма записи сна.
 */

import { memo, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Colors, Radius, Spacing } from '../../shared/theme/tokens.theme'
import { Text } from '../../shared/ui/Text'

interface SleepLoggerProps {
	onSave: (bedtime: string, wakeTime: string, quality: number) => void
	isSaving?: boolean
}
// Простой выбор времени — часы и минуты
function TimeSelector({
	label,
	value,
	onChange
}: {
	label: string
	value: string
	onChange: (v: string) => void
}) {
	const [hours, minutes] = value.split(':').map(Number)

	const changeHours = (delta: number) => {
		const h = (hours + delta + 24) % 24
		onChange(
			`${String(h).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
		)
	}
	const changeMinutes = (delta: number) => {
		const m = (minutes + delta + 60) % 60
		onChange(`${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
	}

	const btnStyle = {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: Colors.surface,
		alignItems: 'center' as const,
		justifyContent: 'center' as const
	}
	return (
		<View style={{ flex: 1, gap: 6, alignItems: 'center' }}>
			<Text variant="label">{label}</Text>
			<View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
				{/* Часы */}
				<View style={{ alignItems: 'center', gap: 4 }}>
					<TouchableOpacity
						style={btnStyle}
						onPress={() => changeHours(1)}
					>
						<Text
							variant="metricTiny"
							color={Colors.muted}
						>
							▲
						</Text>
					</TouchableOpacity>
					<Text
						variant="metric"
						style={{ fontFamily: 'GeistMono', fontSize: 22 }}
					>
						{String(hours).padStart(2, '0')}
					</Text>
					<TouchableOpacity
						style={btnStyle}
						onPress={() => changeHours(-1)}
					>
						<Text
							variant="metricTiny"
							color={Colors.muted}
						>
							▼
						</Text>
					</TouchableOpacity>
				</View>

				<Text
					variant="h3"
					color={Colors.muted}
				>
					:
				</Text>

				{/* Минуты */}
				<View style={{ alignItems: 'center', gap: 4 }}>
					<TouchableOpacity
						style={btnStyle}
						onPress={() => changeMinutes(15)}
					>
						<Text
							variant="metricTiny"
							color={Colors.muted}
						>
							▲
						</Text>
					</TouchableOpacity>
					<Text
						variant="metric"
						style={{ fontFamily: 'GeistMono', fontSize: 22 }}
					>
						{String(minutes).padStart(2, '0')}
					</Text>
					<TouchableOpacity
						style={btnStyle}
						onPress={() => changeMinutes(-15)}
					>
						<Text
							variant="metricTiny"
							color={Colors.muted}
						>
							▼
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}

export const SleepLogger = memo(({ onSave, isSaving }: SleepLoggerProps) => {
	const [expanded, setExpanded] = useState(false)
	const [bedtime, setBedtime] = useState('23:00')
	const [wakeTime, setWakeTime] = useState('07:00')
	const [quality, setQuality] = useState(3)

	const handleSave = () => {
		const today = new Date().toISOString().slice(0, 10)
		const bed = new Date(`${today}T${bedtime}:00`).toISOString()
		const wake = new Date(`${today}T${wakeTime}:00`).toISOString()
		onSave(bed, wake, quality)
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
					+ Записать сон
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
				gap: Spacing.md
			}}
		>
			{/* Время */}

			<View style={{ flexDirection: 'row', gap: Spacing.md }}>
				<TimeSelector
					label="Отбой"
					value={bedtime}
					onChange={setBedtime}
				/>
				<View style={{ width: 1, backgroundColor: Colors.border }} />
				<TimeSelector
					label="Подъём"
					value={wakeTime}
					onChange={setWakeTime}
				/>
			</View>
			{/* Качество сна */}
			<View style={{ gap: Spacing.xs }}>
				<Text variant="label">Качество сна</Text>
				<View style={{ flexDirection: 'row', gap: Spacing.sm }}>
					{[1, 2, 3, 4, 5].map(q => {
						const isActive = quality >= q
						const dotColor =
							q <= 2 ? Colors.danger : q === 3 ? Colors.warning : Colors.success
						return (
							<TouchableOpacity
								key={q}
								onPress={() => setQuality(q)}
								style={{
									flex: 1,
									paddingVertical: Spacing.sm,
									borderRadius: Radius.sm,
									borderWidth: 1,
									borderColor: isActive ? dotColor : Colors.border,
									backgroundColor: isActive ? `${dotColor}22` : 'transparent',
									alignItems: 'center',
									gap: 4
								}}
							>
								<View
									style={{
										width: 8,
										height: 8,
										borderRadius: 4,
										backgroundColor: isActive ? dotColor : Colors.border
									}}
								>
									<Text
										variant="metricTiny"
										color={isActive ? dotColor : Colors.muted}
									>
										{q}
									</Text>
								</View>
							</TouchableOpacity>
						)
					})}
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

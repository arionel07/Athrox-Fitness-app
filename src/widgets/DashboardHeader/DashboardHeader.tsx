/**
 * @file widgets/DashboardHeader/DashboardHeader.tsx
 * @description Шапка Dashboard — приветствие + неделя + дата.
 *
 * Из дизайн-системы:
 * — Header: приветствие + имя + avatar кнопка
 * — Week label: Geist Mono, "Неделя N · дата"
 */

import { getISOWeek } from 'date-fns'
import { memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { Colors, Spacing } from '../../shared/theme/tokens.theme'
import { Text } from '../../shared/ui/Text'

interface IDashboardHeaderProps {
	userName?: string
	onAvatarPress?: () => void
}

export const DashboardHeader = memo(
	({ userName = 'Arionel', onAvatarPress }: IDashboardHeaderProps) => {
		const now = new Date()
		const weekNumber = getISOWeek(now)

		// Форматируем дату: "12 мар 2026"
		const dataLabel = now.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		})

		return (
			<View style={{ gap: Spacing.xs }}>
				{/* Приветствие + аватар */}
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center'
					}}
				>
					<View>
						<Text variant="bodySmall">Добро пожаловать</Text>
						<Text variant="h2">{userName}</Text>
					</View>

					{/* Avatar кнопка — переход в профиль */}
					<TouchableOpacity
						onPress={onAvatarPress}
						activeOpacity={0.7}
						style={{
							width: 40,
							height: 40,
							borderRadius: 20,
							backgroundColor: Colors.primary,
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<Text
							variant="body"
							color={Colors.foreground}
							style={{ fontWeight: '700' }}
						>
							{/* Первая буква имени */}
							{userName.charAt(0).toUpperCase()}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Week label — Geist Mono из дизайн-системы */}
				<Text variant="weekLabel">
					Неделя {weekNumber} · {dataLabel}
				</Text>
			</View>
		)
	}
)

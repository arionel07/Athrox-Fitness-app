/**
 * @file shared/ui/TabBar.tsx
 * @description Кастомный Bottom Tab Bar из дизайн-системы.
 *
 * Из дизайн-документа:
 * — Все иконки inline SVG (никаких библиотек)
 * — Активный таб: primary цвет (#0072f5)
 * — Неактивный: muted (#71717a)
 * — Фон: surface (#141414) + border сверху
 */

import { type BottomTabBarProps } from '@react-navigation/bottom-tabs'
import React, { memo } from 'react'
import { TouchableOpacity, View } from 'react-native'
import Svg, { Circle, Path, Rect } from 'react-native-svg'
import { Colors, Spacing } from '../theme/tokens.theme'
import { Text } from './Text'

// ─── SVG Иконки (inline, из дизайн-системы) ──────────────────────

interface IIconProps {
	color: string
	size?: number
}

// Dashboard — 4 прямоугольника 2×2 (Grid)
const DashboardIcon = memo(({ color, size = 22 }: IIconProps) => (
	<Svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
	>
		<Rect
			x="3"
			y="3"
			width="8"
			height="8"
			rx="2"
			stroke={color}
			strokeWidth="1.8"
		/>
		<Rect
			x="13"
			y="3"
			width="8"
			height="8"
			rx="2"
			stroke={color}
			strokeWidth="1.8"
		/>
		<Rect
			x="3"
			y="13"
			width="8"
			height="8"
			rx="2"
			stroke={color}
			strokeWidth="1.8"
		/>
		<Rect
			x="13"
			y="13"
			width="8"
			height="8"
			rx="2"
			stroke={color}
			strokeWidth="1.8"
		/>
	</Svg>
))

// Тренировка — плюс (+)
const WorkoutIcon = memo(({ color, size = 22 }: IIconProps) => (
	<Svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
	>
		<Path
			d="M12 5v14M5 12h14"
			stroke={color}
			strokeWidth="2"
			strokeLinecap="round"
		/>
	</Svg>
))

// Питание — три горизонтальные линии разной длины
const NutritionIcon = memo(({ color, size = 22 }: IIconProps) => (
	<Svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
	>
		<Path
			d="M4 6h16"
			stroke={color}
			strokeWidth="1.8"
			strokeLinecap="round"
		/>
		<Path
			d="M4 12h10"
			stroke={color}
			strokeWidth="1.8"
			strokeLinecap="round"
		/>
		<Path
			d="M4 18h13"
			stroke={color}
			strokeWidth="1.8"
			strokeLinecap="round"
		/>
	</Svg>
))

// Прогресс — часы (circle + стрелки)
const ProgressIcon = memo(({ color, size = 22 }: IIconProps) => (
	<Svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
	>
		<Circle
			cx="12"
			cy="12"
			r="9"
			stroke={color}
			strokeWidth="1.8"
		/>
		<Path
			d="M12 7v5l3 3"
			stroke={color}
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</Svg>
))

// Профиль — circle (голова) + path (плечи)
const ProfileIcon = memo(({ color, size = 22 }: IIconProps) => (
	<Svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
	>
		<Circle
			cx="12"
			cy="8"
			r="4"
			stroke={color}
			strokeWidth="1.8"
		/>
		<Path
			d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
			stroke={color}
			strokeWidth="1.8"
			strokeLinecap="round"
		/>
	</Svg>
))

// ─── Маппинг роута → иконка ───────────────────────────────────────
const ICONS: Record<string, React.ComponentType<IIconProps>> = {
	index: DashboardIcon,
	'02_workout': WorkoutIcon,
	'03_nutrition': NutritionIcon,
	'04_progress': ProgressIcon,
	'05_profile': ProfileIcon
}

const LABELS: Record<string, string> = {
	index: 'Главная',
	'02_workout': 'Тренировка',
	'03_nutrition': 'Питание',
	'04_progress': 'Прогресс',
	'05_profile': 'Профиль'
}

// ─── Кастомный Tab Bar ────────────────────────────────────────────
export const TabBar = memo(
	({ state, descriptors, navigation }: BottomTabBarProps) => {
		return (
			<View
				style={{
					flexDirection: 'row',
					backgroundColor: Colors.surface,
					borderTopWidth: 1,
					borderTopColor: Colors.border,
					paddingBottom: 28, // отступ для home indicator iPhone
					paddingTop: Spacing.sm
				}}
			>
				{state.routes.map((route, index) => {
					const isFocused = state.index === index
					const color = isFocused ? Colors.primary : Colors.muted

					const IconComponent = ICONS[route.name]
					const label = LABELS[route.name] ?? route.name

					const onPress = () => {
						const event = navigation.emit({
							type: 'tabPress',
							target: route.key,
							canPreventDefault: true
						})

						if (!isFocused && !event.defaultPrevented) {
							navigation.navigate(route.name)
						}
					}
					return (
						<TouchableOpacity
							style={{
								flex: 1,
								alignItems: 'center',
								gap: 4,
								paddingTop: Spacing.xs
							}}
							onPress={onPress}
							key={route.key}
							activeOpacity={0.7}
						>
							{IconComponent && <IconComponent color={color} />}
							<Text
								variant="metricTiny"
								color={color}
								style={{ fontSize: 10 }}
							>
								{label}
							</Text>
						</TouchableOpacity>
					)
				})}
			</View>
		)
	}
)

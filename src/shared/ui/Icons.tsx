/**
 * @file shared/ui/Icons.tsx
 * @description Все иконки приложения — inline SVG через react-native-svg.
 *
 * Из дизайн-системы: все иконки нарисованы вручную, никаких библиотек.
 * Цвет передаётся через пропс color — легко менять тему.
 */

import React, { memo } from 'react'
import Svg, { Circle, Path, Rect } from 'react-native-svg'

interface IconProps {
	color?: string
	size?: number
}

// ─── Календарь ────────────────────────────────────────────────────
export const CalendarIcon = memo(
	({ color = '#f4f4f5', size = 18 }: IconProps) => (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
		>
			<Rect
				x="3"
				y="5"
				width="18"
				height="16"
				rx="2"
				stroke={color}
				strokeWidth="1.8"
			/>
			<Path
				d="M3 9H21"
				stroke={color}
				strokeWidth="1.8"
				strokeLinecap="round"
			/>
			<Path
				d="M7 3V6"
				stroke={color}
				strokeWidth="1.8"
				strokeLinecap="round"
			/>
			<Path
				d="M17 3V6"
				stroke={color}
				strokeWidth="1.8"
				strokeLinecap="round"
			/>
			<Path
				d="M7 13H8"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<Path
				d="M11 13H12"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<Path
				d="M15 13H16"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<Path
				d="M7 17H8"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<Path
				d="M11 17H12"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<Path
				d="M15 17H16"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</Svg>
	)
)

// ─── Силовая (гантеля) ────────────────────────────────────────────
export const StrengthIcon = memo(
	({ color = '#f4f4f5', size = 16 }: IconProps) => (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
		>
			<Path
				d="M6 12H18"
				stroke={color}
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<Rect
				x="2"
				y="9"
				width="4"
				height="6"
				rx="1.5"
				stroke={color}
				strokeWidth="1.8"
			/>
			<Rect
				x="18"
				y="9"
				width="4"
				height="6"
				rx="1.5"
				stroke={color}
				strokeWidth="1.8"
			/>
			<Rect
				x="5"
				y="7"
				width="3"
				height="10"
				rx="1"
				stroke={color}
				strokeWidth="1.8"
			/>
			<Rect
				x="16"
				y="7"
				width="3"
				height="10"
				rx="1"
				stroke={color}
				strokeWidth="1.8"
			/>
		</Svg>
	)
)

// ─── Кардио (бегущий) ─────────────────────────────────────────────
export const CardioIcon = memo(
	({ color = '#f4f4f5', size = 16 }: IconProps) => (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
		>
			{/* Голова */}
			<Circle
				cx="15"
				cy="4"
				r="1.8"
				stroke={color}
				strokeWidth="1.6"
			/>
			{/* Тело */}
			<Path
				d="M12 8l3-1 2 4-3 1"
				stroke={color}
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{/* Ноги */}
			<Path
				d="M11 13l-2 4M14 12l1 4"
				stroke={color}
				strokeWidth="1.6"
				strokeLinecap="round"
			/>
			{/* Руки */}
			<Path
				d="M9 10l3-1M15 11l3-2"
				stroke={color}
				strokeWidth="1.6"
				strokeLinecap="round"
			/>
		</Svg>
	)
)

// ─── Растяжка (человек в позе) ────────────────────────────────────
export const StretchingIcon = memo(
	({ color = '#f4f4f5', size = 16 }: IconProps) => (
		<Svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
		>
			{/* Голова */}
			<Circle
				cx="12"
				cy="4"
				r="2"
				stroke={color}
				strokeWidth="1.6"
			/>
			{/* Тело */}
			<Path
				d="M12 6v6"
				stroke={color}
				strokeWidth="1.6"
				strokeLinecap="round"
			/>
			{/* Руки раскинуты */}
			<Path
				d="M4 10l8-2 8 2"
				stroke={color}
				strokeWidth="1.6"
				strokeLinecap="round"
			/>
			{/* Ноги */}
			<Path
				d="M12 12l-4 6M12 12l4 6"
				stroke={color}
				strokeWidth="1.6"
				strokeLinecap="round"
			/>
		</Svg>
	)
)

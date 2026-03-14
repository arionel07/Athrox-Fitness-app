/**
 * @file widgets/ProgressChart/SleepChart.tsx
 * @description График сна — столбцы за последние 7 дней.
 */

import React, { memo } from 'react'
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg'
import { ISleepSession } from '../../entities/sleep/sleep.type'
import { Colors } from '../../shared/theme/tokens.theme'

interface SleepChartProps {
	sessions: ISleepSession[]
}

export const SleepChart = memo(({ sessions }: SleepChartProps) => {
	const width = 320
	const height = 120
	const paddingLeft = 36
	const paddingRight = 8
	const paddingTop = 8
	const paddingBottom = 24

	const chartW = width - paddingLeft - paddingRight
	const chartH = height - paddingTop - paddingBottom

	// Последние 7 дней
	const days = Array.from({ length: 7 }, (_, i) => {
		const d = new Date()
		d.setDate(d.getDate() - (6 - i))
		return d.toISOString().slice(0, 10)
	})

	const maxHours = 10
	const barW = chartW / 7 - 4

	return (
		<Svg
			width={width}
			height={height}
			viewBox={`0 0 ${width} ${height}`}
		>
			{/* Линия 8 часов — цель */}
			{(() => {
				const targetY = paddingTop + chartH - (8 / maxHours) * chartH
				return (
					<Line
						x1={paddingLeft}
						y1={targetY}
						x2={width - paddingRight}
						y2={targetY}
						stroke={Colors.primary}
						strokeWidth="1"
						strokeDasharray="4 4"
					/>
				)
			})()}

			{/* Y метки */}
			{[0, 4, 8].map(h => {
				const yPos = paddingTop + chartH - (h / maxHours) * chartH
				return (
					<SvgText
						key={h}
						x={paddingLeft - 4}
						y={yPos + 4}
						fontSize="9"
						fill={Colors.muted}
						textAnchor="end"
					>
						{h}ч
					</SvgText>
				)
			})}

			{/* Столбцы */}
			{days.map((date, i) => {
				const session = sessions.find(s => s.date === date)
				const hours = session ? session.durationMinutes / 60 : 0
				const barH = (hours / maxHours) * chartH
				const barX = paddingLeft + i * (chartW / 7) + 2
				const barY = paddingTop + chartH - barH

				const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString(
					'ru-RU',
					{ weekday: 'narrow' }
				)
				const color =
					hours >= 7
						? Colors.primary
						: hours > 0
							? Colors.warning
							: Colors.border

				return (
					<React.Fragment key={date}>
						{hours > 0 && (
							<Rect
								x={barX}
								y={barY}
								width={barW}
								height={barH}
								rx="3"
								fill={color}
								opacity="0.8"
							/>
						)}
						<Rect
							x={barX}
							y={paddingTop}
							width={barW}
							height={chartH}
							rx="3"
							fill={Colors.border}
							opacity="0.2"
						/>
						<SvgText
							x={barX + barW / 2}
							y={height - 4}
							fontSize="9"
							fill={Colors.muted}
							textAnchor="middle"
						>
							{dayLabel}
						</SvgText>
					</React.Fragment>
				)
			})}
		</Svg>
	)
})

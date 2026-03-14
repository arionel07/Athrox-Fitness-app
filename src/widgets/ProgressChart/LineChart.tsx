/**
 * @file widgets/ProgressChart/LineChart.tsx
 * @description Универсальный линейный график на react-native-svg.
 * Без внешних библиотек — только SVG примитивы.
 */

import React, { memo } from 'react'
import { View } from 'react-native'
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg'
import { Colors } from '../../shared/theme/tokens.theme'

interface DataPoint {
	label: string // подпись по X (дата)
	value: number
}

interface LineChartProps {
	data: DataPoint[]
	color?: string
	unit?: string
	height?: number
}

export const LineChart = memo(
	({
		data,
		color = Colors.primary,
		unit = '',
		height = 140
	}: LineChartProps) => {
		if (data.length < 2) {
			return (
				<View
					style={{ height, alignItems: 'center', justifyContent: 'center' }}
				>
					{/* Нужно минимум 2 точки для графика */}
				</View>
			)
		}

		const width = 320
		const paddingLeft = 40
		const paddingRight = 16
		const paddingTop = 16
		const paddingBottom = 28

		const chartW = width - paddingLeft - paddingRight
		const chartH = height - paddingTop - paddingBottom

		const values = data.map(d => d.value)
		const minVal = Math.min(...values)
		const maxVal = Math.max(...values)
		const range = maxVal - minVal || 1

		// Координата X для точки i
		const x = (i: number) => paddingLeft + (i / (data.length - 1)) * chartW
		// Координата Y для значения v
		const y = (v: number) =>
			paddingTop + chartH - ((v - minVal) / range) * chartH
		// Строим path через все точки
		const pathD = data
			.map(
				(d, i) =>
					`${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`
			)
			.join(' ')
		// Показываем только первую, последнюю и каждую 3-ю метку
		const showLabel = (i: number) =>
			i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 4) === 0

		return (
			<Svg
				width={width}
				height={height}
				viewBox={`0 0 ${width} ${height}`}
			>
				{/* Горизонтальные линии сетки */}
				{[0, 0.5, 1].map(t => {
					const yPos = paddingTop + chartH * (1 - t)
					const val = minVal + range * t
					return (
						<React.Fragment key={t}>
							<Line
								x1={paddingLeft}
								y1={yPos}
								x2={width - paddingRight}
								y2={yPos}
								stroke={Colors.border}
								strokeWidth="1"
							/>
							<SvgText
								x={paddingLeft - 4}
								y={yPos + 4}
								fontSize="9"
								fill={Colors.muted}
								textAnchor="end"
							>
								{val.toFixed(1)}
							</SvgText>
						</React.Fragment>
					)
				})}
				{/* Линия графика */}
				<Path
					d={pathD}
					stroke={color}
					strokeWidth="2"
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>

				{/* Точки и подписи X */}
				{data.map((d, i) => (
					<React.Fragment key={i}>
						<Circle
							cx={x(i)}
							cy={y(d.value)}
							r="3"
							fill={color}
						/>
						{showLabel(i) && (
							<SvgText
								x={x(i)}
								y={height - 4}
								fontSize="9"
								fill={Colors.muted}
								textAnchor="middle"
							>
								{d.label}
							</SvgText>
						)}
					</React.Fragment>
				))}
			</Svg>
		)
	}
)

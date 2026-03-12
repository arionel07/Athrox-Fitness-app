/**
 * @file shared/ui/Text.tsx
 * @description Типографика компонент — обёртка над RN Text.
 *
 * Зачем: чтобы не писать fontFamily в каждом компоненте.
 * Используй этот компонент везде вместо import Text from RN.
 */

import { memo } from 'react'
import { Text as RNText, type TextProps } from 'react-native'
import { Typography } from '../theme/typography.theme'

type TTextVariant =
	| 'h1'
	| 'h2'
	| 'h3'
	| 'body'
	| 'bodySmall'
	| 'label'
	| 'metric'
	| 'metricSmall'
	| 'metricTiny'
	| 'weekLabel'

interface IAppTextProps extends TextProps {
	variant?: TTextVariant
	color?: string
}

export const Text = memo(
	({ variant = 'body', color, style, ...props }: IAppTextProps) => {
		return (
			<RNText
				style={[Typography[variant], color ? { color } : null, style]}
				{...props}
			/>
		)
	}
)

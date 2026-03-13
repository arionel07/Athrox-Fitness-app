/**
 * @file shared/ui/Input.tsx
 * @description Текстовый инпут из дизайн-системы.
 *
 * Особенности:
 * — Тёмный фон surface (#141414)
 * — Граница подсвечивается при фокусе (primary цвет)
 * — Поддержка label и errorText
 */

import { memo, useState } from 'react'
import { TextInput, View, type TextInputProps } from 'react-native'
import { Colors, Radius, Spacing } from '../theme/tokens.theme'
import { Text } from './Text'

interface IInputProps extends TextInputProps {
	label?: string
	errorText?: string
}

export const Input = memo(
	({ label, errorText, style, ...props }: IInputProps) => {
		const [isFocused, setIsFocused] = useState(false)

		return (
			<View style={{ gap: Spacing.xs }}>
				{label && <Text variant="label">{label}</Text>}

				<TextInput
					style={[
						{
							backgroundColor: Colors.surface,
							borderWidth: 1,
							borderColor: isFocused ? Colors.primary : Colors.border,
							borderRadius: Radius.md,
							paddingHorizontal: Spacing.md,
							paddingVertical: Spacing.md,
							color: Colors.foreground,
							fontFamily: 'Geist',
							fontSize: 15
						},
						style
					]}
					placeholderTextColor={Colors.muted}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					{...props}
				/>
				{errorText && (
					<Text
						variant="bodySmall"
						color={Colors.danger}
					>
						{errorText}
					</Text>
				)}
			</View>
		)
	}
)

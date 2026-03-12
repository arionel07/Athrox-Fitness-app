/**
 * @file shared/ui/Button.tsx
 * @description Primary кнопка из дизайн-системы.
 *
 * Варианты:
 * — primary: синяя заливка (#0072f5) — главные действия
 * — secondary: серая заливка — второстепенные
 * — ghost: без фона, только текст — тихие действия
 * — danger: красный — деструктивные действия
 */

import { memo } from 'react'
import {
	ActivityIndicator,
	TouchableOpacity,
	type TouchableOpacityProps,
	type ViewStyle
} from 'react-native'
import { Colors, Radius, Spacing } from '../theme/tokens.theme'
import { Text } from './Text'

type TButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type TButtonSize = 'sm' | 'md' | 'lg'

interface IButtonProps extends TouchableOpacityProps {
	variant?: TButtonVariant
	size?: TButtonSize
	label: string
	isLoading?: boolean
	fullWidth?: boolean
}

// Стили по варианту — вне компонента, не пересоздаются
const variantStyles: Record<TButtonVariant, ViewStyle> = {
	primary: { backgroundColor: Colors.primary },
	secondary: {
		backgroundColor: Colors.surface,
		borderWidth: 1,
		borderColor: Colors.border
	},
	ghost: { backgroundColor: 'transparent' },
	danger: {
		backgroundColor: 'rgba(243, 18, 96, 0.12)',
		borderWidth: 1,
		borderColor: Colors.danger
	}
}
const textColors: Record<TButtonVariant, string> = {
	primary: Colors.foreground,
	secondary: Colors.foreground,
	ghost: Colors.muted,
	danger: Colors.danger
}
const sizeStyles: Record<
	TButtonSize,
	{ paddingVertical: number; paddingHorizontal: number }
> = {
	sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
	md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
	lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl }
}

export const Button = memo(
	({
		label,
		isLoading = false,
		fullWidth = false,
		variant = 'primary',
		size = 'md',
		style,
		disabled,
		...props
	}: IButtonProps) => {
		const isDisabled = disabled || isLoading

		return (
			<TouchableOpacity
				activeOpacity={0.75}
				disabled={isDisabled}
				style={[
					{
						borderRadius: Radius.md,
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'row',
						gap: Spacing.sm,
						// Полная ширина если нужно (CTA кнопки)
						...(fullWidth && { width: '100%' }),
						// Визуальный feedback для disabled
						opacity: isDisabled ? 0.5 : 1
					},
					variantStyles[variant],
					sizeStyles[size],
					style
				]}
				{...props}
			>
				{isLoading ? (
					<ActivityIndicator
						size={'small'}
						color={textColors[variant]}
					/>
				) : (
					<Text
						variant="body"
						color={textColors[variant]}
						style={{ fontWeight: '600' }}
					>
						{label}
					</Text>
				)}
			</TouchableOpacity>
		)
	}
)

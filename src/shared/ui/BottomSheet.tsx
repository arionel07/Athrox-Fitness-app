/**
 * @file shared/ui/BottomSheet.tsx
 * @description Универсальная всплывающая панель снизу.
 * Анимация slide-up + backdrop.
 */

import { memo, ReactNode, useEffect, useRef } from 'react'
import {
	Animated,
	Dimensions,
	StyleSheet,
	TouchableWithoutFeedback,
	View
} from 'react-native'
import { Colors, Radius } from '../theme/tokens.theme'

const { height } = Dimensions.get('window')

interface BottomSheetProps {
	visible: boolean
	onClose: () => void
	children: ReactNode
	sheetHeight?: number
}

export const BottomSheet = memo(
	({ visible, onClose, children, sheetHeight = 320 }: BottomSheetProps) => {
		const translateY = useRef(new Animated.Value(sheetHeight)).current
		const opacity = useRef(new Animated.Value(0)).current

		useEffect(() => {
			if (visible) {
				Animated.parallel([
					Animated.timing(translateY, {
						toValue: 0,
						duration: 300,
						useNativeDriver: true
					}),
					Animated.timing(opacity, {
						toValue: 1,
						duration: 300,
						useNativeDriver: true
					})
				]).start()
			} else {
				Animated.parallel([
					Animated.timing(translateY, {
						toValue: sheetHeight,
						duration: 250,
						useNativeDriver: true
					}),
					Animated.timing(opacity, {
						toValue: 0,
						duration: 250,
						useNativeDriver: true
					})
				]).start()
			}
		}, [visible])

		if (!visible) return null

		return (
			<View
				style={StyleSheet.absoluteFill}
				pointerEvents="box-none"
			>
				{/* Backdrop */}
				<TouchableWithoutFeedback onPress={onClose}>
					<Animated.View
						style={[
							StyleSheet.absoluteFill,
							{ backgroundColor: 'rgba(0,0,0,0.6)', opacity }
						]}
					/>
				</TouchableWithoutFeedback>

				{/* Sheet */}
				<Animated.View
					style={{
						position: 'absolute',
						bottom: 0,
						left: 0,
						right: 0,
						height: sheetHeight,
						backgroundColor: Colors.surface,
						borderTopLeftRadius: Radius.xl,
						borderTopRightRadius: Radius.xl,
						transform: [{ translateY }],
						paddingBottom: 34 // safe area
					}}
				>
					{/* Ручка */}
					<View
						style={{
							width: 36,
							height: 4,
							borderRadius: 2,
							backgroundColor: Colors.border,
							alignSelf: 'center',
							marginTop: 12,
							marginBottom: 8
						}}
					/>
					{children}
				</Animated.View>
			</View>
		)
	}
)

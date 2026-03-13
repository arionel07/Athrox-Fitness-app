/**
 * @file app/(tabs)/nutrition.tsx
 * @description Экран питания — в разработке.
 */

import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors, Spacing } from '../../src/shared/theme/tokens.theme'
import { Text } from '../../src/shared/ui/Text'

export default function NutritionScreen() {
	return (
		<SafeAreaView
			style={{ flex: 1, backgroundColor: Colors.background }}
			edges={['top']}
		>
			<View style={{ padding: Spacing.lg }}>
				<Text variant="h2">Питание</Text>
				<Text
					variant="bodySmall"
					style={{ marginTop: Spacing.sm }}
				>
					В разработке
				</Text>
			</View>
		</SafeAreaView>
	)
}

/**
 * @file app/(tabs)/index.tsx
 * @description Временный экран — только для проверки что БД инициализируется.
 * Заменим на реальный Dashboard позже.
 */

import { Text, View } from 'react-native'
import { useDatabase } from '../../src/shared/db/useDatabase.hook'

export default function HomeScreen() {
	// Если этот хук не бросает ошибку — БД готова
	const db = useDatabase()

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: '#0a0a0a',
				justifyContent: 'center',
				alignItems: 'center'
			}}
		>
			<Text style={{ color: '#f4f4f5', fontSize: 18 }}>
				{db ? '✅ Database ready' : '⏳ Loading...'}
			</Text>
		</View>
	)
}

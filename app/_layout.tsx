/**
 * @file app/_layout.tsx
 * @description Корневой layout приложения.
 * DatabaseProvider оборачивает всё — БД доступна везде.
 */

import { Stack } from 'expo-router'
import { DatabaseProvider } from '../src/shared/db/DatabaseProvider'

export default function RootLayout() {
	return (
		<DatabaseProvider>
			<Stack screenOptions={{ headerShown: false }} />
		</DatabaseProvider>
	)
}

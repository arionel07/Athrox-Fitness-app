/**
 * @file app/(tabs)/_layout.tsx
 * @description Layout для tab-навигации.
 * Пока минимальный — расширим когда дойдём до UI.
 */

import { Tabs } from 'expo-router'
import { TabBar } from '../../src/shared/ui/TabBar'

export default function TabsLayout() {
	return (
		<Tabs
			tabBar={props => <TabBar {...props} />}
			screenOptions={{ headerShown: false }}
		>
			{/* Порядок здесь определяет порядок в TabBar */}
			<Tabs.Screen name="index" />
			<Tabs.Screen name="02_workout" />
			<Tabs.Screen name="03_nutrition" />
			<Tabs.Screen name="04_progress" />
			<Tabs.Screen name="05_profile" />
		</Tabs>
	)
}

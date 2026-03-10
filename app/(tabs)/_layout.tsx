/**
 * @file app/(tabs)/_layout.tsx
 * @description Layout для tab-навигации.
 * Пока минимальный — расширим когда дойдём до UI.
 */

import { Tabs } from 'expo-router'

export default function TabsLayout() {
	return <Tabs screenOptions={{ headerShown: false }} />
}

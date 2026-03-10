/**
 * @file shared/db/DatabaseProvider.tsx
 * @description React контекст для доступа к БД из любого компонента.
 *
 * Почему контекст а не глобальная переменная:
 * — Инициализация БД асинхронная — нужно ждать до рендера
 * — Контекст гарантирует что db готова до рендера дочерних компонентов
 * — Легко мокать в тестах
 */

import { type SQLiteDatabase } from 'expo-sqlite'
import React, {
	createContext,
	JSX,
	useEffect,
	useState,
	type ReactNode
} from 'react'
import { Text, View } from 'react-native'
import { initDatabase } from './database'

// ─── Контекст ─────────────────────────────────────────────────────
export const DatabaseContext = createContext<SQLiteDatabase | null>(null)

// ─── Провайдер ────────────────────────────────────────────────────
interface IDatabaseProviderProps {
	children: ReactNode
}

export const DatabaseProvider = ({
	children
}: IDatabaseProviderProps): JSX.Element => {
	const [db, setDb] = useState<SQLiteDatabase | null>(null)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		// Инициализируем БД при монтировании провайдера
		initDatabase()
			.then(setDb)
			.catch(err => {
				console.log('[DB] Init failed:', err)
				setError(err.message)
			})
	}, [])

	// Показываем ошибку если БД не открылась
	if (error) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center',
					backgroundColor: '#0a0a0a'
				}}
			>
				<Text style={{ color: '#ef4444', fontFamily: 'monospace' }}>
					DB Error: {error}
				</Text>
			</View>
		)
	}

	// Ждём инициализации — children не рендерятся пока БД не готова

	if (!db) return <View style={{ flex: 1, backgroundColor: '#0a0a0a' }} />

	return (
		<DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>
	)
}

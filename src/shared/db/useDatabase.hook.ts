// ─── Хук для использования БД в компонентах ───────────────────────

import { type SQLiteDatabase } from 'expo-sqlite'
import { useContext } from 'react'
import { DatabaseContext } from './DatabaseProvider'

export const useDatabase = (): SQLiteDatabase => {
	const db = useContext(DatabaseContext)

	if (!db) {
		throw new Error('useDatabase must be used within DatabaseProvider')
	}

	return db
}

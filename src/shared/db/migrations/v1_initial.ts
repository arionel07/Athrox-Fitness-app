/**
 * @file shared/db/migrations/v1_initial.ts
 * @description Первая миграция — создаёт все таблицы и индексы.
 *
 * Паттерн миграций:
 * — Каждая миграция имеет версию (version) и функцию up()
 * — up() выполняется только один раз при первом запуске
 * — Версия записывается в таблицу _migrations чтобы не выполнять повторно
 */

import { type SQLiteDatabase } from 'expo-sqlite'
import { ALL_TABLES } from '../schema'

export const v1_initial = {
	version: 1,

	up: async (db: SQLiteDatabase): Promise<void> => {
		for (const statement of ALL_TABLES) {
			await db.execAsync(statement)
		}
	}
}

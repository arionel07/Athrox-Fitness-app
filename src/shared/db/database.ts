/**
 * @file shared/db/database.ts
 * @description Инициализация SQLite базы данных.
 *
 * Отвечает за:
 * — Открытие/создание файла БД на устройстве
 * — Включение WAL режима (Write-Ahead Logging) для производительности
 * — Включение Foreign Keys (по умолчанию SQLite их не проверяет!)
 * — Запуск системы миграций
 *
 * Использование:
 *   const db = await initDatabase();
 */
import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite'
import { v1_initial } from './migrations/v1_initial'

// ─── Список всех миграций в порядке выполнения ────────────────────
// Добавляй новые миграции только в конец массива
const MIGRATIONS = [v1_initial]

// ─── Таблица для отслеживания выполненных миграций ────────────────
const CREATE_MIGRATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS _migrations (
    version     INTEGER PRIMARY KEY,
    executed_at TEXT NOT NULL
	)
`

/**
 * Запускает только те миграции которые ещё не выполнялись.
 * Проверяет версию по таблице _migrations.
 */
const runMigrations = async (db: SQLiteDatabase): Promise<void> => {
	// Создаём таблицу миграций если не существует
	await db.execAsync(CREATE_MIGRATIONS_TABLE)

	// Получаем список уже выполненных версий
	const executed = await db.getAllAsync<{ version: number }>(
		'SELECT version FROM _migrations ORDER BY version ASC'
	)
	const executedVersion = new Set(executed.map(r => r.version))

	// Выполняем только новые миграции
	for (const migration of MIGRATIONS) {
		if (executedVersion.has(migration.version)) {
			// Эта миграция уже выполнялась — пропускаем
			continue
		}

		console.log(`[DB] Running migration v${migration.version}...`)

		await migration.up(db)

		// Записываем что миграция выполнена
		await db.runAsync(
			'INSERT INTO _migrations (version, executed_at) VALUES (?, ?)',
			[migration.version, new Date().toISOString()]
		)

		console.log(`[DB] Migration v${migration.version} completed ✓`)
	}
}

/**
 * Главная функция инициализации БД.
 * Вызывается один раз при старте приложения.
 *
 * WAL режим — Write-Ahead Logging:
 * — Чтение и запись не блокируют друг друга
 * — Значительно быстрее для мобильных приложений
 */
export const initDatabase = async (): Promise<SQLiteDatabase> => {
	// Открываем или создаём файл fitnessup.db на устройстве
	const db = await openDatabaseAsync('fitnessup.db')
	// WAL режим — обязательно для производительности
	await db.execAsync('PRAGMA journal_mode = WAL;')
	// Включаем проверку внешних ключей (OFF по умолчанию в SQLite!)
	// Без этого ON DELETE CASCADE не работает
	await db.execAsync('PRAGMA foreign_keys = ON;')
	// Запускаем миграции
	await runMigrations(db)

	console.log('[DB] Database ready ✓')

	return db
}

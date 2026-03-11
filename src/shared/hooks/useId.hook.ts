/**
 * @file shared/hooks/useId.ts
 * @description Генератор уникальных ID.
 *
 * Почему не uuid библиотека:
 * — Лишняя зависимость ради одной функции
 * — Date.now() + random даёт достаточную уникальность для локального приложения
 * — Формат читаемый: "1709123456789_a3f2" — видно когда создан
 */

/**
 * Генерирует уникальный ID.
 * @returns строка вида "1709123456789_a3f2"
 */
export const generateId = (): string => {
	const timestamp = Date.now().toString()
	const random = Math.random().toString(36).slice(2, 6)
	return `${timestamp}_${random}`
}

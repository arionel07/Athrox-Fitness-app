/**
 * @file shared/theme/typography.ts
 * @description Типографика FitnessUp.
 *
 * Два шрифта из экосистемы Vercel (дизайн-документ):
 * — Geist: основной UI шрифт
 * — Geist Mono: числа, даты, метрики — для технического ощущения
 *
 * Использование Mono для чисел — ключевая деталь дизайна.
 * Цифры одинаковой ширины не прыгают при обновлении данных.
 */

import { StyleSheet } from 'react-native'
import { Colors } from './tokens.theme'

export const Typography = StyleSheet.create({
	// ── Заголовки (Geist) ────────────────────────────────────────────
	h1: {
		fontFamily: 'Geist',
		fontSize: 28,
		fontWeight: '700',
		color: Colors.foreground,
		letterSpacing: -0.5
	},
	h2: {
		fontFamily: 'Geist',
		fontSize: 22,
		fontWeight: '600',
		color: Colors.foreground,
		letterSpacing: -0.3
	},
	h3: {
		fontFamily: 'Geist',
		fontSize: 18,
		fontWeight: '600',
		color: Colors.foreground
	},

	// ── Основной текст (Geist) ───────────────────────────────────────
	body: {
		fontFamily: 'Geist',
		fontSize: 15,
		fontWeight: '400',
		color: Colors.foreground,
		lineHeight: 22
	},
	bodySmall: {
		fontFamily: 'Geist',
		fontSize: 13,
		fontWeight: '400',
		color: Colors.muted,
		lineHeight: 18
	},
	label: {
		fontFamily: 'Geist',
		fontSize: 12,
		fontWeight: '500',
		color: Colors.muted,
		textTransform: 'uppercase',
		letterSpacing: 0.8
	},
	// ── Числа и метрики (Geist Mono) ─────────────────────────────────
	metric: {
		fontFamily: 'GeistMono',
		fontSize: 28,
		fontWeight: '700',
		color: Colors.foreground
	},
	metricSmall: {
		fontFamily: 'GeistMono',
		fontSize: 18,
		fontWeight: '600',
		color: Colors.foreground
	},
	metricTiny: {
		fontFamily: 'GeistMono',
		fontSize: 13,
		fontWeight: '400',
		color: Colors.muted
	},
	// ── Неделя / дата (Geist Mono) ───────────────────────────────────
	weekLabel: {
		fontFamily: 'GeistMono',
		fontSize: 13,
		fontWeight: '400',
		color: Colors.muted,
		letterSpacing: 0.5
	}
})

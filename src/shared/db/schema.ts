/**
 * @file shared/db/schema.ts
 * @description SQL схема базы данных FitnessUp.
 *
 * Принципы:
 * — TEXT для дат (ISO / YYYY-MM-DD) — SQLite не имеет типа DATE,
 *   TEXT с ISO форматом легко сортируется и фильтруется
 * — INTEGER для булевых (0/1) — стандарт SQLite
 * — REAL для дробных чисел (вес, % жира)
 * — Индексы на все поля по которым делаем WHERE и GROUP BY
 */

// ─── Тренировки ───────────────────────────────────────────────────

export const CREATE_WORKOUT_SESSIONS_TABLE = `
	CREATE TABLE IF NOT EXISTS workout_sessions (
    id           TEXT PRIMARY KEY,
    type         TEXT NOT NULL CHECK(type IN ('strength','cardio','stretching')),
    title        TEXT NOT NULL DEFAULT '',
    notes        TEXT NOT NULL DEFAULT '',
    started_at   TEXT NOT NULL,  -- ISO строка
    finished_at  TEXT NOT NULL   -- ISO строка
	)
`

// Индекс для быстрой фильтрации по дате (Weekly Report, экран Прогресса)
export const CREATE_WORKOUT_SESSIONS_DATE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_workout_sessions_started_at
  ON workout_sessions(started_at);
`

export const CREATE_EXERCISES_TABLE = `
	CREATE TABLE IF NOT EXISTS exercises (
    id          TEXT PRIMARY KEY,
    session_id  TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    sort_order     INTEGER NOT NULL DEFAULT 0
	)
`

// Индекс для быстрого получения упражнений конкретной тренировки
export const CREATE_EXERCISES_SESSION_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_exercises_session_id
  ON exercises(session_id);
`

export const CREATE_WORKOUT_SETS_TABLE = `
	CREATE TABLE IF NOT EXISTS workout_sets (
    id           TEXT PRIMARY KEY,
    exercise_id  TEXT NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    weight       REAL NOT NULL DEFAULT 0,
    reps         INTEGER NOT NULL DEFAULT 0,
    completed    INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0,1)),
    created_at   TEXT NOT NULL
	)
`

// Индекс для агрегации по упражнению (максимальный вес, история)
export const CREATE_SETS_EXERCISE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_workout_sets_exercise_id
  ON workout_sets(exercise_id);
`

// ─── Питание ──────────────────────────────────────────────────────

export const CREATE_NUTRITION_DAYS_TABLE = `
  CREATE TABLE IF NOT EXISTS nutrition_days (
    id        TEXT PRIMARY KEY,
    date      TEXT NOT NULL UNIQUE, -- YYYY-MM-DD, UNIQUE: один день = одна запись
    water_ml  INTEGER NOT NULL DEFAULT 0
  );
`

export const CREATE_NUTRITION_DAYS_DATE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_nutrition_days_date
  ON nutrition_days(date);
`

export const CREATE_MEALS_TABLE = `
  CREATE TABLE IF NOT EXISTS meals (
    id      TEXT PRIMARY KEY,
    day_id  TEXT NOT NULL REFERENCES nutrition_days(id) ON DELETE CASCADE,
    type    TEXT NOT NULL CHECK(type IN ('breakfast','lunch','dinner','snack'))
  );
`

export const CREATE_FOOD_ITEMS_TABLE = `
  CREATE TABLE IF NOT EXISTS food_items (
    id       TEXT PRIMARY KEY,
    meal_id  TEXT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    name     TEXT NOT NULL,
    grams    REAL NOT NULL DEFAULT 0,
    calories REAL NOT NULL DEFAULT 0,
    protein  REAL NOT NULL DEFAULT 0,
    fat      REAL NOT NULL DEFAULT 0,
    carbs    REAL NOT NULL DEFAULT 0
  );
`

// Индекс для быстрого подсчёта макросов за день (JOIN meals → food_items)
export const CREATE_FOOD_ITEMS_MEAL_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_food_items_meal_id
  ON food_items(meal_id);
`

// ─── Сон ──────────────────────────────────────────────────────────

export const CREATE_SLEEP_SESSIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS sleep_sessions (
    id                TEXT PRIMARY KEY,
    date              TEXT NOT NULL UNIQUE, -- YYYY-MM-DD, один день = одна запись
    bedtime           TEXT NOT NULL,        -- ISO
    wake_time         TEXT NOT NULL,        -- ISO
    duration_minutes  INTEGER NOT NULL DEFAULT 0,
    quality           INTEGER NOT NULL DEFAULT 3 CHECK(quality BETWEEN 1 AND 5),
    notes             TEXT NOT NULL DEFAULT ''
  );
`

export const CREATE_SLEEP_DATE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_sleep_sessions_date
  ON sleep_sessions(date);
`

// ─── Метрики тела ─────────────────────────────────────────────────

export const CREATE_BODY_METRICS_TABLE = `
  CREATE TABLE IF NOT EXISTS body_metrics (
    id               TEXT PRIMARY KEY,
    date             TEXT NOT NULL UNIQUE, -- один замер в день
    weight_kg        REAL NOT NULL,
    body_fat_percent REAL,                 -- NULL если не замеряли
    notes            TEXT NOT NULL DEFAULT ''
  );
`

export const CREATE_BODY_METRICS_DATE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_body_metrics_date
  ON body_metrics(date);
`

// ─── Фото прогресса ───────────────────────────────────────────────

export const CREATE_PROGRESS_PHOTOS_TABLE = `
  CREATE TABLE IF NOT EXISTS progress_photos (
    id         TEXT PRIMARY KEY,
    date       TEXT NOT NULL,  -- YYYY-MM-DD
    angle      TEXT NOT NULL CHECK(angle IN ('front','side','back')),
    local_uri  TEXT NOT NULL,  -- путь к файлу на устройстве
    notes      TEXT NOT NULL DEFAULT ''
  );
`

export const CREATE_PROGRESS_PHOTOS_DATE_INDEX = `
  CREATE INDEX IF NOT EXISTS idx_progress_photos_date
  ON progress_photos(date);
`

// ─── Недельные отчёты ─────────────────────────────────────────────

export const CREATE_WEEKLY_REPORTS_TABLE = `
  CREATE TABLE IF NOT EXISTS weekly_reports (
    id                       TEXT PRIMARY KEY,
    week_number              INTEGER NOT NULL,
    year                     INTEGER NOT NULL,
    start_date               TEXT NOT NULL,
    end_date                 TEXT NOT NULL,
    strength_delta           REAL NOT NULL DEFAULT 0,
    improved_exercises_count INTEGER NOT NULL DEFAULT 0,
    weight_delta             REAL NOT NULL DEFAULT 0,
    avg_daily_calories       REAL NOT NULL DEFAULT 0,
    avg_daily_protein        REAL NOT NULL DEFAULT 0,
    avg_sleep_minutes        REAL NOT NULL DEFAULT 0,
    avg_sleep_quality        REAL NOT NULL DEFAULT 0,
    insights                 TEXT NOT NULL DEFAULT '[]', -- JSON массив строк
    generated_at             TEXT NOT NULL,

    -- Уникальность: один отчёт на одну неделю одного года
    UNIQUE(week_number, year)
  );
`

// ─── Профиль пользователя ─────────────────────────────────────────

export const CREATE_USER_PROFILE_TABLE = `
  CREATE TABLE IF NOT EXISTS user_profile (
    id                      TEXT PRIMARY KEY,
    name                    TEXT NOT NULL DEFAULT 'Атлет',
    weight_goal             REAL NOT NULL DEFAULT 80,
    calorie_goal            INTEGER NOT NULL DEFAULT 2400,
    protein_goal            INTEGER NOT NULL DEFAULT 160,
    workouts_per_week_goal  INTEGER NOT NULL DEFAULT 4,
    created_at              TEXT NOT NULL,
    updated_at              TEXT NOT NULL
  )
`

// ─── Все таблицы и индексы списком ────────────────────────────────
// Используется в migration.ts для создания БД в правильном порядке
// Порядок важен: сначала родительские таблицы, потом дочерние (REFERENCES)

export const ALL_TABLES = [
	CREATE_WORKOUT_SESSIONS_TABLE,
	CREATE_WORKOUT_SESSIONS_DATE_INDEX,
	CREATE_EXERCISES_TABLE,
	CREATE_EXERCISES_SESSION_INDEX,
	CREATE_WORKOUT_SETS_TABLE,
	CREATE_SETS_EXERCISE_INDEX,

	CREATE_NUTRITION_DAYS_TABLE,
	CREATE_NUTRITION_DAYS_DATE_INDEX,
	CREATE_MEALS_TABLE,
	CREATE_FOOD_ITEMS_TABLE,
	CREATE_FOOD_ITEMS_MEAL_INDEX,

	CREATE_SLEEP_SESSIONS_TABLE,
	CREATE_SLEEP_DATE_INDEX,

	CREATE_BODY_METRICS_TABLE,
	CREATE_BODY_METRICS_DATE_INDEX,

	CREATE_PROGRESS_PHOTOS_TABLE,
	CREATE_PROGRESS_PHOTOS_DATE_INDEX,

	CREATE_WEEKLY_REPORTS_TABLE,
	CREATE_USER_PROFILE_TABLE
]

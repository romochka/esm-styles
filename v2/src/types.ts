// esm-styles v2 — типы.
// Слой 1: значения свойств (csstype). Слой 2: структура по скелету разметки
// (скелеты генерирует v2/src/gen.ts в esm-styles-env.d.ts).

import type * as CSS from 'csstype'

/** Скалярное CSS-значение: строка (включая токены 'var(--…)') или число. */
export type CssValue = string | number

/** CSS-свойства в camelCase; длины принимают и числа (0, 700 и т.п.). */
export type CssProperties = CSS.Properties<CssValue>

/**
 * Свободный узел стиля: свойства плюс произвольные вложенные селекторы.
 * Используется там, где разметка неизвестна (зоны {children}, markdown)
 * и в стилях без скелета. Опечатки в именах свойств здесь не ловятся.
 */
export interface Style extends CssProperties {
  [selector: string]: Style | CssValue | undefined
}

/**
 * Служебные ключи, допустимые на любом узле скелета:
 * ':hover'/'::before', '@mobile'/'@dark', '[disabled]', '.tag-like-class'.
 * Содержимое — тот же узел (внутри ':hover' доступны те же дети и классы).
 */
export type SpecialKeys<Self> = {
  [k: `:${string}`]: Self | undefined
  [k: `@${string}`]: Self | undefined
  [k: `[${string}`]: Self | undefined
  [k: `.${string}`]: Self | undefined
}

/**
 * Граница дочернего компонента (PascalCase-ключ): позиционировать можно,
 * ключей-потомков нет — заход внутрь чужой разметки даёт ошибку типов.
 */
export type Boundary = CssProperties & SpecialKeys<CssProperties>

/**
 * Подпись стиля компонента: satisfies StyleOf<Markup.X>.
 * Слой 2: M — сгенерированный скелет разметки, уже имеющий форму
 * допустимого объекта стилей; StyleOf — тождество, оставленное как
 * стабильная точка API (слой 1 подставлял сюда свободный Style).
 */
export type StyleOf<M> = M

/** Кадры @keyframes: from / to / проценты → только свойства. */
export type Keyframes = {
  [step: string]: CssProperties
}

/** Дескрипторы @property; initialValue → initial-value, syntax
 *  можно писать без кавычек — компилятор процитирует сам. */
export type PropertyRule = {
  syntax?: string
  inherits?: boolean
  initialValue?: CssValue
}

/** Глобальные стили: ключи верхнего уровня — теги, селекторы, at-правила. */
export type GlobalStyle = {
  [selector: string]: Style | Keyframes | PropertyRule
}

// --- конфиг ------------------------------------------------------------------

/** Одна активация режима: И между полями, ИЛИ между записями списка on. */
export type ModeActivation = {
  media?: string
  selector?: string
}

export type Mode = ModeActivation & {
  /** полная форма для экзотики (v1: «.auto ∧ prefers-dark») */
  on?: ModeActivation[]
  /** от кого наследовать токены; по умолчанию — предыдущий режим */
  inherits?: string
}

export type TokenValues = {
  [token: string]: string | number | TokenValues
}

/** Коллекция («медиаобъект», в Figma — variable collection с modes):
 *  именованный набор токенов с режимами. Первый режим — дефолт (:root)
 *  и канон структуры. Значения живут НЕ в конфиге, а по одному модулю
 *  на режим: <tokensPath>/<mode>.<collection>.ts — формат обмена с Figma
 *  (одна collection.mode → один файл). Файлы токенов — чистые данные:
 *  без импортов и без satisfies, конвертер может перезаписывать их
 *  целиком; согласованность режимов проверяет зрячий линтер. */
export type Collection = {
  /** светло-тёмная ось: цвета через light-dark(), режимы — однострочники
   *  color-scheme, «auto» — нативное поведение, не режим */
  colorScheme?: boolean
  modes: { [mode: string]: Mode }
}

export type EsmStylesConfig = {
  /** база всех путей; по умолчанию — папка самого конфига */
  basePath?: string
  /** пары и стили; по умолчанию './styles' */
  stylesPath?: string
  /** модули токенов <mode>.<collection>.ts; по умолчанию './tokens' */
  tokensPath?: string
  /** куда класть CSS; по умолчанию './css' */
  outputPath?: string
  mainCssFile?: string
  /** пути include относительны stylesPath */
  floors?: { name: string; include: string }[]
  /** '@шорткат' → at-правило или селектор-предок */
  shortcuts?: Record<string, string>
  collections?: { [name: string]: Collection }
}

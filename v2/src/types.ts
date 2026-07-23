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

/** Глобальные стили: ключи верхнего уровня — теги и селекторы. */
export type GlobalStyle = {
  [selector: string]: Style
}

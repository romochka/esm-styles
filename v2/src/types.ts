// esm-styles v2 — слой 1: типы значений.
// Даёт автодополнение имён CSS-свойств и проверку значений через csstype.
// Структурная строгость (ключи-селекторы по скелету разметки) — слой 2.

import type * as CSS from 'csstype'

/** Скалярное CSS-значение: строка (включая токены 'var(--…)') или число. */
export type CssValue = string | number

/** CSS-свойства в camelCase; длины принимают и числа (0, 700 и т.п.). */
export type CssProperties = CSS.Properties<CssValue>

/**
 * Узел стиля: CSS-свойства плюс произвольные вложенные ключи-селекторы
 * (теги, camelCase-классы, PascalCase-границы, ':…', '[…]', '@…', '.x').
 *
 * Известное ограничение слоя 1: опечатка в имени свойства (colr: 'red')
 * не ловится — index signature читает её как вложенный селектор.
 * Её поймает слой 2, когда ключи будут ограничены скелетом разметки.
 */
export interface Style extends CssProperties {
  [selector: string]: Style | CssValue | undefined
}

/**
 * Подпись стиля компонента: satisfies StyleOf<Markup.X>.
 * Слой 1 — заглушка: параметр M пока не используется, проверяются только
 * свойства и значения. В слое 2 M (скелет разметки из esm-styles-env.d.ts)
 * начнёт ограничивать допустимые ключи-селекторы на каждом уровне.
 */
export type StyleOf<_M> = Style

/** Глобальные стили: ключи верхнего уровня — теги и селекторы. */
export type GlobalStyle = {
  [selector: string]: Style
}

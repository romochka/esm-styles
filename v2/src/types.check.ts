// Компайл-тайм проверки типов слоя 1: файл не исполняется, только tsc.
// Каждый @ts-expect-error обязан давать ошибку — иначе tsc падает.

import type { GlobalStyle, Style, StyleOf } from './types'

// Корректный стиль: свойства, вложенность, псевдоклассы, media, числа.
export const valid = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  fontWeight: 700,
  margin: 0,
  lineHeight: 1.15,

  header: {
    h1: {
      fontSize: '2rem',
      ':hover': { opacity: 0.9 },
      '@mobile': { fontSize: '1.2rem' },
    },
  },
} satisfies Style

// StyleOf — тождество: скелет сам задаёт форму допустимого объекта.
export const validComponent = {
  article: { display: 'grid' },
} satisfies StyleOf<{ article: Style }>

export const validGlobal = {
  body: { margin: 0 },
  a: { color: 'inherit' },
} satisfies GlobalStyle

// @ts-expect-error — 'colum': опечатка в значении перечислимого свойства
export const badEnumValue = { flexDirection: 'colum' } satisfies Style

// @ts-expect-error — boolean не бывает CSS-значением
export const badValueType = { padding: true } satisfies Style

// @ts-expect-error — objectFit не принимает произвольных слов
export const badKeyword = { objectFit: 'covers' } satisfies Style

// Документированное ограничение слоя 1 (НЕ ошибка, к сожалению):
// опечатка в имени свойства читается как вложенный селектор. Ловит слой 2.
export const knownLimitation = { colr: 'red' } satisfies Style

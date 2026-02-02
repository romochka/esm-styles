# Сравнение CSS-in-JS решений

Один компонент — три подхода. Задача: карточка с кнопкой, темная тема, респонсив.

---

## 1. esm-styles (твой подход)

```js
// card.styles.mjs
import $theme from './$theme.mjs'

export default {
  card: {
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    borderRadius: '12px',
    backgroundColor: $theme.paper.bright,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',

    '@dark': {
      backgroundColor: $theme.paper.tinted,
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    },

    '@mobile': {
      padding: '16px',
    },

    __title: {
      fontSize: '20px',
      fontWeight: 600,
      color: $theme.ink.bright,
      marginBottom: '12px',
    },

    __content: {
      fontSize: '14px',
      color: $theme.ink.faded,
      lineHeight: 1.5,
    },

    button: {
      marginTop: '16px',
      padding: '12px 24px',
      border: 'none',
      borderRadius: '8px',
      backgroundColor: $theme.accent.primary,
      color: 'white',
      cursor: 'pointer',
      fontWeight: 500,

      ':hover': {
        opacity: 0.9,
      },

      ':disabled': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },

      '@dark': {
        backgroundColor: $theme.accent.primaryDark,
      },
    },
  },
}
```

```tsx
// Card.tsx
export function Card({ title, content }) {
  return (
    <div className="card">
      <h2 className="title">{title}</h2>
      <p className="content">{content}</p>
      <button>Action</button>
    </div>
  )
}
```

**Выход CSS:** ~40 строк, семантические классы

---

## 2. vanilla-extract

```ts
// card.css.ts
import { style, styleVariants } from '@vanilla-extract/css'
import { vars } from './theme.css'

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  padding: 24,
  borderRadius: 12,
  backgroundColor: vars.color.surface,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',

  '@media': {
    '(max-width: 768px)': {
      padding: 16,
    },
  },

  selectors: {
    '[data-theme="dark"] &': {
      backgroundColor: vars.color.surfaceDark,
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    },
  },
})

export const title = style({
  fontSize: 20,
  fontWeight: 600,
  color: vars.color.text,
  marginBottom: 12,
})

export const content = style({
  fontSize: 14,
  color: vars.color.textMuted,
  lineHeight: 1.5,
})

export const button = style({
  marginTop: 16,
  padding: '12px 24px',
  border: 'none',
  borderRadius: 8,
  backgroundColor: vars.color.primary,
  color: 'white',
  cursor: 'pointer',
  fontWeight: 500,

  ':hover': {
    opacity: 0.9,
  },

  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  selectors: {
    '[data-theme="dark"] &': {
      backgroundColor: vars.color.primaryDark,
    },
  },
})
```

```tsx
// Card.tsx
import * as styles from './card.css'

export function Card({ title, content }) {
  return (
    <div className={styles.card}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.content}>{content}</p>
      <button className={styles.button}>Action</button>
    </div>
  )
}
```

**Выход CSS:** ~60 строк, хешированные классы (`.card_1a2b3c`)

---

## 3. Panda CSS

```ts
// card.tsx (стили inline через функции)
import { css } from '../styled-system/css'

export function Card({ title, content }) {
  return (
    <div className={css({
      display: 'flex',
      flexDirection: 'column',
      p: '24px',
      borderRadius: '12px',
      bg: 'surface',
      boxShadow: 'sm',
      _dark: {
        bg: 'surface.dark',
        boxShadow: 'md',
      },
      md: {
        p: '16px',
      },
    })}>
      <h2 className={css({
        fontSize: '20px',
        fontWeight: 'semibold',
        color: 'text',
        mb: '12px',
      })}>
        {title}
      </h2>
      <p className={css({
        fontSize: '14px',
        color: 'text.muted',
        lineHeight: '1.5',
      })}>
        {content}
      </p>
      <button className={css({
        mt: '16px',
        p: '12px 24px',
        border: 'none',
        borderRadius: '8px',
        bg: 'primary',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'medium',
        _hover: { opacity: 0.9 },
        _disabled: { opacity: 0.5, cursor: 'not-allowed' },
        _dark: { bg: 'primary.dark' },
      })}>
        Action
      </button>
    </div>
  )
}
```

**Выход CSS:** atomic classes (`.d_flex`, `.p_24px`, `.bg_surface`)

---

## Сравнительная таблица

| Критерий | esm-styles | vanilla-extract | Panda CSS |
|----------|------------|-----------------|-----------|
| **TypeScript автокомплит свойств** | ❌ Нет | ✅ Полный | ✅ Полный |
| **Ошибки при опечатках** | ❌ Runtime/silent | ✅ Compile-time | ✅ Compile-time |
| **Семантические классы** | ✅ `.card`, `.button` | ⚠️ Хеши `.card_a1b2` | ❌ Atomic `.d_flex` |
| **Читаемость в DevTools** | ✅ Отличная | ⚠️ Средняя | ❌ Плохая |
| **CSS Layers** | ✅ Из коробки | ⚠️ Вручную | ⚠️ Вручную |
| **Размер бандла** | ✅ Только CSS | ✅ Только CSS | ✅ Atomic (меньше) |
| **Вложенность стилей** | ✅ Естественная | ⚠️ `selectors: {}` | ⚠️ Только pseudo |
| **Отделение стилей от JSX** | ✅ Полное | ✅ Полное | ❌ Inline |
| **Интеграция Vite/Next** | ❌ Вручную | ✅ Плагины | ✅ Плагины |
| **Порог входа** | ✅ Низкий | ⚠️ Средний | ⚠️ Средний |
| **Документация** | ⚠️ Базовая | ✅ Отличная | ✅ Отличная |

---

## Честные выводы

### Где esm-styles выигрывает:
1. **Читаемость** — и в коде, и в DevTools
2. **Вложенность** — естественная, без `selectors: {}`
3. **CSS Layers** — first-class поддержка
4. **Простота** — меньше концепций для изучения

### Где esm-styles проигрывает:
1. **Type safety** — нет проверки свойств на этапе компиляции
2. **Ecosystem** — нет плагинов для сборщиков
3. **Adoption** — неизвестен, нет community

### Что можно позаимствовать:

**От vanilla-extract:**
- TypeScript типы для CSS свойств (можно добавить опционально)
- Vite/esbuild плагин вместо CLI

**От Panda CSS:**
- Recipes для вариантов компонентов
- Semantic tokens (у тебя уже есть похожее с `$theme`)

---

## Твоя уникальная ниша

> "CSS-in-JS для тех, кто хочет писать CSS как CSS, но в JavaScript"

vanilla-extract заставляет думать о хешах и selectors.
Panda CSS заставляет писать стили в JSX.
esm-styles позволяет писать стили как обычный CSS, но с преимуществами JS.

Это валидная позиция. Вопрос только в том, достаточно ли людей её разделяют.

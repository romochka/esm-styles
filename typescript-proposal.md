# TypeScript Integration Proposal для esm-styles

## Текущее состояние

```
.styles.mjs  →  build.ts (esbuild)  →  .css
                    ↓
               $theme.mjs (автогенерация)
```

Проблема: нет проверки CSS свойств на этапе написания.

---

## Три варианта интеграции

### Вариант A: Node.js 22+ с `--experimental-strip-types`

```bash
# Запуск
node --experimental-strip-types esm-styles build
```

**Плюсы:**

- Нет шага компиляции
- Нативная поддержка в Node.js

**Минусы:**

- Node 22+ требование отсечёт часть аудитории
- `--experimental-strip-types` не поддерживает:
  - `const enum`
  - namespace
  - parameter properties
  - некоторые декораторы
- Нужно добавлять флаг при каждом запуске

**Вердикт:** Можно добавить как опцию, но не как единственный путь.

---

### Вариант B: esbuild для .styles.ts (рекомендую)

esbuild **уже в зависимостях** и используется для aliases. Расширить его для TypeScript — минимальные изменения.

```ts
// build.ts — изменения минимальны
const suffix = config.sourceFilesSuffix || '.styles.ts' // было .mjs

// esbuild уже умеет TypeScript из коробки
const result = await esbuild.build({
  entryPoints: [filePath],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
  // ... уже есть
})
```

**Плюсы:**

- Уже есть в проекте
- Молниеносно быстрый
- Type-stripping без проверки типов (быстро)
- Поддерживает `.ts`, `.mts`, `.tsx`

**Минусы:**

- Не проверяет типы (только IDE + отдельный `tsc --noEmit`)
- Нужно добавить `csstype` для типов свойств

**Вердикт:** Лучший баланс. Минимальные изменения, максимальная совместимость.

---

### Вариант C: Полная компиляция через tsc

```bash
tsc --project tsconfig.styles.json
node esm-styles build
```

**Плюсы:**

- Полная проверка типов при сборке

**Минусы:**

- Двойной шаг (tsc → node)
- Медленнее
- Сложнее настройка

**Вердикт:** Overkill для данной задачи.

---

## Рекомендация: Вариант B + типы

### Шаг 1: Добавить csstype

```bash
npm install csstype --save
```

### Шаг 2: Создать типы для стилей

```ts
// src/types/styles.ts
import type { Properties, Pseudos } from 'csstype'

// CSS свойства с поддержкой CSS переменных
type CSSValue = string | number | { var: string; name?: string }

type CSSProperties = {
  [K in keyof Properties]?: Properties[K] | CSSValue
}

// Псевдоклассы и псевдоэлементы
type PseudoSelectors = {
  [K in Pseudos]?: StyleObject
}

// Media queries
type MediaQueries = {
  [key: `@${string}`]?: StyleObject
}

// Вложенные селекторы
type NestedSelectors = {
  [key: string]?: StyleObject
}

// Полный тип для объекта стилей
export type StyleObject = CSSProperties & PseudoSelectors & MediaQueries & NestedSelectors

// Тип для default export
export type StyleSheet = {
  [selector: string]: StyleObject
}

// Helper для создания типизированных стилей
export function defineStyles<T extends StyleSheet>(styles: T): T {
  return styles
}
```

### Шаг 3: Как будут выглядеть файлы

```ts
// card.styles.ts
import { defineStyles } from 'esm-styles'
import $theme from './$theme' // автогенерируемый, тоже с типами

export default defineStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
    backgroundColor: $theme.paper.bright, // ✅ автокомплит

    // backgroundColr: 'red',  // ❌ IDE покажет ошибку!

    ':hover': {
      opacity: 0.9, // ✅ тип проверен
    },

    '@dark': {
      backgroundColor: $theme.paper.tinted,
    },

    button: {
      padding: '12px 24px',
      // ...вложенные стили тоже типизированы
    },
  },
})
```

### Шаг 4: Автогенерация типизированного $theme

Изменить генерацию `$theme.mjs` → `$theme.ts`:

```ts
// Автогенерируемый $theme.ts
export interface ThemeTokens {
  paper: {
    bright: { var: string; name: string; light: string; dark: string }
    tinted: { var: string; name: string; light: string; dark: string }
  }
  ink: {
    bright: { var: string; name: string; light: string; dark: string }
    faded: { var: string; name: string; light: string; dark: string }
  }
}

const $theme: ThemeTokens = {
  paper: {
    bright: {
      var: 'var(--paper-bright)',
      name: '--paper-bright',
      light: '#ffffff',
      dark: '#000000',
    },
    tinted: {
      var: 'var(--paper-tinted)',
      name: '--paper-tinted',
      light: '#f0f0f0',
      dark: '#323232',
    },
  },
  // ...
}

export default $theme
```

---

## Обратная совместимость

```js
// esm-styles.config.js
export default {
  // Новая опция
  typescript: true, // default: false для обратной совместимости

  // Или автодетект по расширению
  sourceFilesSuffix: '.styles.ts', // вместо .styles.mjs

  // ...остальное без изменений
}
```

**Логика:**

- Если `sourceFilesSuffix` заканчивается на `.ts` → использовать esbuild с TS
- Если `.mjs` / `.js` → работать как раньше
- Старые проекты не сломаются

---

## План реализации

### Фаза 1: Типы (1-2 дня)

1. Добавить `csstype` в dependencies
2. Создать `src/types/styles.ts` с типами
3. Экспортировать `defineStyles` helper
4. Добавить в README пример использования

### Фаза 2: Поддержка .ts файлов (1 день)

1. Модифицировать `importWithAliases` для работы с .ts
2. Добавить автодетект расширения
3. Тесты

### Фаза 3: Типизированные supporting modules (1-2 дня)

1. Генерировать `$theme.ts` вместо `$theme.mjs`
2. Добавить интерфейсы для токенов
3. Тесты

### Фаза 4: Документация (1 день)

1. Обновить README
2. Добавить примеры TypeScript использования
3. Migration guide для существующих проектов

---

[Статус реализации](./typescript-status.md)  
_TODO: синхронизировать План реализации и Статус реализации_

---

## Пример миграции

```bash
# До
styles/
  $theme.mjs
  card.styles.mjs
  button.styles.mjs

# После
styles/
  $theme.ts        # автогенерируется
  card.styles.ts   # переименовать + добавить типы
  button.styles.ts
```

```diff
- // card.styles.mjs
+ // card.styles.ts
+ import { defineStyles } from 'esm-styles'
  import $theme from './$theme'

- export default {
+ export default defineStyles({
    card: {
      display: 'flex',
      // ...
    }
- }
+ })
```

---

## Бонус: Строгий режим

Для тех, кто хочет полную проверку при сборке:

```js
// esm-styles.config.js
export default {
  typescript: {
    strict: true, // запускать tsc --noEmit перед сборкой
  },
}
```

```ts
// В build.ts
if (config.typescript?.strict) {
  await exec('tsc --noEmit --project tsconfig.styles.json')
}
// Продолжить с esbuild...
```

---

## Итого

| Что                   | Сложность | Ценность |
| --------------------- | --------- | -------- |
| Типы для CSS свойств  | Низкая    | Высокая  |
| Поддержка .ts файлов  | Низкая    | Высокая  |
| Типизированный $theme | Средняя   | Высокая  |
| Строгий режим         | Средняя   | Средняя  |

Минимальные изменения (esbuild уже есть!) → максимальный эффект для DX.

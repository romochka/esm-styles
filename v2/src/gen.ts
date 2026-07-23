// esm-styles v2 — генератор esm-styles-env.ts (прообраз watcher'а).
// Берёт скелеты из общего конвейера (pipeline.ts) и порождает:
//   - declare const для $-справочников,
//   - алиасы StyleOf/GlobalStyle,
//   - namespace Markup со скелетами в форме допустимых объектов стилей,
//     включая сокращённые пути и границы компонентов.
// Запуск: npm run gen:v2

import fs from 'node:fs'
import path from 'node:path'
import { loadProject, type ProjectComponent } from './pipeline.ts'
import type { SkeletonNode } from './skeleton.ts'

const v2Root = path.resolve(import.meta.dirname, '..')
const appRoot = path.join(v2Root, 'dream')
const stylesDir = path.join(appRoot, 'styles')
// Расширение .ts (не .d.ts!) намеренно: файл без import/export — глобальный
// скрипт для tsc, но .d.ts прятался бы от проверки за skipLibCheck.
const envFile = path.join(stylesDir, 'esm-styles-env.ts')
const typesImport = '../../src/types'

const { styled, transparent } = loadProject(appRoot)

// --- эмиссия типов ---------------------------------------------------------

/** Все элементы-потомки узла: имя тега → множество имён типов узлов. */
const collectDescendants = (
  node: SkeletonNode,
  pathParts: string[],
  map: Map<string, Set<string>>
): void => {
  for (const child of node.children) {
    const childPath = [...pathParts, child.tag]
    if (!map.has(child.tag)) map.set(child.tag, new Set())
    map.get(child.tag)!.add(childPath.join('_'))
    collectDescendants(child, childPath, map)
  }
}

const emitComponent = (c: ProjectComponent): string => {
  const aliases: string[] = []

  const walk = (node: SkeletonNode, pathParts: string[]): void => {
    const self = pathParts.join('_')
    const entries: string[] = []

    for (const cls of node.classes) entries.push(`${cls}?: ${self}`)
    for (const usage of node.components)
      entries.push(`${usage.name}?: Boundary`)
    for (const child of node.children) {
      entries.push(`${child.tag}?: ${[...pathParts, child.tag].join('_')}`)
    }

    // сокращённые пути: потомки любой глубины, кроме прямых детей;
    // неоднозначные (несколько путей) — union, точность добавит линтер
    const descendants = new Map<string, Set<string>>()
    collectDescendants(node, pathParts, descendants)
    for (const [tag, names] of descendants) {
      if (node.children.some((child) => child.tag === tag)) continue
      entries.push(`${tag}?: ${[...names].sort().join(' | ')}`)
    }

    // зона контента: ключи-селекторы не проверяются (разметки нет),
    // но значения свойств внутри — по-прежнему слой 1 (Free = Style)
    if (node.free) {
      const memberTypes = new Set<string>(['Free', 'CssValue', self])
      for (const entry of entries) {
        const type = entry.slice(entry.indexOf(': ') + 2)
        for (const part of type.split(' | ')) memberTypes.add(part)
      }
      entries.unshift(
        `[key: string]: ${[...memberTypes].join(' | ')} | undefined`
      )
    }

    // интерфейсы, не type aliases: самоссылки (классы, Special<Self>)
    // для интерфейсов законны, а не TS2456
    const body = entries.length
      ? ` {\n${entries.map((e) => `      ${e}`).join('\n')}\n    }`
      : ' {}'
    aliases.push(`    interface ${self} extends Css, Special<${self}>${body}`)

    for (const child of node.children) walk(child, [...pathParts, child.tag])
  }

  walk(c.root, [c.root.tag])

  return [
    `  /** ${c.source} */`,
    `  interface ${c.name} { ${c.root.tag}: ${c.name}.${c.root.tag} }`,
    `  namespace ${c.name} {`,
    ...aliases,
    `  }`,
  ].join('\n')
}

// --- $-справочники ---------------------------------------------------------

const refModules = fs
  .readdirSync(stylesDir)
  .filter((f) => f.startsWith('$') && f.endsWith('.ts'))
  .map((f) => path.basename(f, '.ts'))
  .sort()

const refLines = refModules.map(
  (name) => `declare const ${name}: (typeof import('./${name}'))['default']`
)

// --- сборка файла ----------------------------------------------------------

const env = `// Сгенерировано esm-styles v2 (v2/src/gen.ts) — руками не редактировать.
// Перегенерация: npm run gen:v2
//
// 1. Справочники — ambient-глобалы: среда исполнения стилей даёт их сама.
// 2. Markup — скелеты разметки, извлечённые из .tsx-половинок пар.
//    Нотация та же, что в стилях: тег — элемент, camelCase — класс,
//    PascalCase — граница компонента. Скелет — это стиль без свойств.
//    Сокращённые пути развёрнуты; зоны контента — в свободном режиме.

${refLines.join('\n')}

type StyleOf<M> = import('${typesImport}').StyleOf<M>
type GlobalStyle = import('${typesImport}').GlobalStyle

declare namespace Markup {
  type Css = import('${typesImport}').CssProperties
  type CssValue = import('${typesImport}').CssValue
  type Special<S> = import('${typesImport}').SpecialKeys<S>
  type Boundary = import('${typesImport}').Boundary
  type Free = import('${typesImport}').Style

${styled.map(emitComponent).join('\n\n')}
}
`

fs.writeFileSync(envFile, env)
console.log(
  `esm-styles-env.ts: ${styled.length} скелетов (${styled
    .map((c) => c.name)
    .join(', ')}), справочники: ${refModules.join(', ')}` +
    (transparent.length
      ? `, прозрачные: ${transparent.map((c) => c.name).join(', ')}`
      : '')
)

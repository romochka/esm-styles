// esm-styles v2 — генератор esm-styles-env.d.ts (прообраз watcher'а).
// Сканирует .tsx, извлекает скелеты разметки (skeleton.ts) и порождает:
//   - declare const для $-справочников,
//   - алиасы StyleOf/GlobalStyle,
//   - namespace Markup со скелетами в форме допустимых объектов стилей,
//     включая сокращённые пути и границы компонентов.
// Запуск: npm run gen:v2

import fs from 'node:fs'
import path from 'node:path'
import { extractComponents, type SkeletonNode } from './skeleton.ts'
import type { ComponentSkeleton } from './skeleton.ts'

const v2Root = path.resolve(import.meta.dirname, '..')
const appRoot = path.join(v2Root, 'dream')
const stylesDir = path.join(appRoot, 'styles')
// Расширение .ts (не .d.ts!) намеренно: файл без import/export — глобальный
// скрипт для tsc, но .d.ts прятался бы от проверки за skipLibCheck.
const envFile = path.join(stylesDir, 'esm-styles-env.ts')
const typesImport = '../../src/types'

// --- сбор скелетов ---------------------------------------------------------

const tsxFiles = (fs.readdirSync(appRoot, { recursive: true }) as string[])
  .filter((f) => f.endsWith('.tsx'))
  .sort()

const components: (ComponentSkeleton & { source: string })[] = []
for (const rel of tsxFiles) {
  const abs = path.join(appRoot, rel)
  const text = fs.readFileSync(abs, 'utf8')
  for (const skeleton of extractComponents(abs, text)) {
    components.push({ ...skeleton, source: rel })
  }
}

const duplicate = components.find(
  (c, i) => components.findIndex((d) => d.name === c.name) !== i
)
if (duplicate) {
  throw new Error(`Два компонента с именем ${duplicate.name}`)
}

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

const emitComponent = (c: ComponentSkeleton & { source: string }): string => {
  const aliases: string[] = []

  const walk = (node: SkeletonNode, pathParts: string[]): void => {
    const self = pathParts.join('_')
    const entries: string[] = []

    for (const cls of node.classes) entries.push(`${cls}?: ${self}`)
    for (const comp of node.components) entries.push(`${comp}?: Boundary`)
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

    // свободный режим ({children} внутри) — index signature отключает проверку
    if (node.free) entries.unshift('[key: string]: unknown')

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
//    Сокращённые пути развёрнуты; зоны {children} — в свободном режиме.

${refLines.join('\n')}

type StyleOf<M> = import('${typesImport}').StyleOf<M>
type GlobalStyle = import('${typesImport}').GlobalStyle

declare namespace Markup {
  type Css = import('${typesImport}').CssProperties
  type Special<S> = import('${typesImport}').SpecialKeys<S>
  type Boundary = import('${typesImport}').Boundary

${components.map(emitComponent).join('\n\n')}
}
`

fs.writeFileSync(envFile, env)
console.log(
  `esm-styles-env.ts: ${components.length} скелетов (${components
    .map((c) => c.name)
    .join(', ')}), справочники: ${refModules.join(', ')}`
)

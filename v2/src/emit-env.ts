// esm-styles v2 — продукт «типы»: эмиссия esm-styles-env.ts из скелетов.
// Чистая функция от снапшота проекта; зовут CLI (gen.ts) и watcher (watch.ts).

import fs from 'node:fs'
import path from 'node:path'
import type { Project, ProjectComponent } from './pipeline.ts'
import type { SkeletonNode } from './skeleton.ts'

export type EmitOptions = {
  stylesDir: string
  envFile: string
  typesImport: string
}

export type EmitResult = {
  changed: boolean
  refModules: string[]
}

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

    const memberTypes = new Set<string>([self])
    for (const entry of entries) {
      const type = entry.slice(entry.indexOf(': ') + 2)
      for (const part of type.split(' | ')) memberTypes.add(part)
    }

    if (node.free) {
      // зона контента: ключи-селекторы не проверяются (разметки нет),
      // но значения свойств внутри — по-прежнему слой 1 (Free = Style)
      entries.unshift(
        `[key: string]: Free | CssValue | ${[...memberTypes].join(' | ')} | undefined`
      )
    } else {
      // картезиана запятых: ключ с запятой законен, значения проверяются
      // против union допустимых узлов; состав частей проверяет линтер
      entries.unshift(
        '[k: `${string},${string}`]: ' +
          `${[...memberTypes].join(' | ')} | undefined`
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
    `  interface ${c.name} {`,
    `    ${c.root.tag}: ${c.name}.${c.root.tag}`,
    '    [k: `@keyframes ${string}`]: Keyframes',
    '    [k: `@property --${string}`]: PropertyRule',
    `  }`,
    `  namespace ${c.name} {`,
    ...aliases,
    `  }`,
  ].join('\n')
}

export const emitEnv = (project: Project, opts: EmitOptions): EmitResult => {
  const refModules = fs
    .readdirSync(opts.stylesDir)
    .filter((f) => f.startsWith('$') && f.endsWith('.ts'))
    .map((f) => path.basename(f, '.ts'))
    .sort()

  const refLines = refModules.map(
    (name) => `declare const ${name}: (typeof import('./${name}'))['default']`
  )

  const t = opts.typesImport
  const env = `// Сгенерировано esm-styles v2 (v2/src/gen.ts) — руками не редактировать.
// Перегенерация: npm run gen:v2 (или npm run watch:v2)
//
// 1. Справочники — ambient-глобалы: среда исполнения стилей даёт их сама.
// 2. Markup — скелеты разметки, извлечённые из .tsx-половинок пар.
//    Нотация та же, что в стилях: тег — элемент, camelCase — класс,
//    PascalCase — граница компонента. Скелет — это стиль без свойств.
//    Сокращённые пути развёрнуты; зоны контента — в свободном режиме.

${refLines.join('\n')}

type StyleOf<M> = import('${t}').StyleOf<M>
type GlobalStyle = import('${t}').GlobalStyle

declare namespace Markup {
  type Css = import('${t}').CssProperties
  type CssValue = import('${t}').CssValue
  type Special<S> = import('${t}').SpecialKeys<S>
  type Boundary = import('${t}').Boundary
  type Free = import('${t}').Style
  type Keyframes = import('${t}').Keyframes
  type PropertyRule = import('${t}').PropertyRule

${project.styled.map(emitComponent).join('\n\n')}
}
`

  const previous = fs.existsSync(opts.envFile)
    ? fs.readFileSync(opts.envFile, 'utf8')
    : ''
  const changed = previous !== env
  if (changed) fs.writeFileSync(opts.envFile, env)
  return { changed, refModules }
}

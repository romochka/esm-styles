// esm-styles v2 — зрячий линтер (жёлтый уровень, слой 3).
// Сверяет .styles.ts со скелетами разметки и предупреждает о том,
// чего типы выразить не могут:
//   - элемент или класс разметки, для которого нет стиля (покрытие);
//   - неоднозначный сокращённый путь (union в типах проходит — уточни);
//   - граница-компонент без единого стиля вообще.
// Красное — не его дело: это работа tsc (npm run check:v2).
// Запуск: npm run lint:v2

import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import { loadProject } from './pipeline.ts'
import type { SkeletonNode } from './skeleton.ts'

const v2Root = path.resolve(import.meta.dirname, '..')
const appRoot = path.join(v2Root, 'dream')
const stylesDir = path.join(appRoot, 'styles')

const project = loadProject(appRoot)
const skeletons = new Map(project.styled.map((c) => [c.name, c]))

type Warning = { file: string; line: number; col: number; message: string }
const warnings: Warning[] = []

const warn = (file: string, node: ts.Node | undefined, message: string) => {
  if (!node) {
    warnings.push({ file, line: 1, col: 1, message })
    return
  }
  const sf = node.getSourceFile()
  const { line, character } = sf.getLineAndCharacterOfPosition(node.getStart())
  warnings.push({ file, line: line + 1, col: character + 1, message })
}

// --- покрытие: что из скелета затронуто стилями ----------------------------

type Coverage = {
  nodes: Set<SkeletonNode>
  classes: Set<string> // `${путь}::${класс}`
}
const coverage = new Map<string, Coverage>()
const styledExports = new Set<string>()

const coverageOf = (name: string): Coverage => {
  if (!coverage.has(name)) {
    coverage.set(name, { nodes: new Set(), classes: new Set() })
  }
  return coverage.get(name)!
}

/** Потомки узла с данным тегом (любая глубина), с путями. */
const findDescendants = (
  node: SkeletonNode,
  tag: string,
  prefix: string[],
  results: { node: SkeletonNode; path: string[] }[]
): void => {
  for (const child of node.children) {
    const childPath = [...prefix, child.tag]
    if (child.tag === tag) results.push({ node: child, path: childPath })
    findDescendants(child, tag, childPath, results)
  }
}

// --- обход объекта стилей вдоль скелета ------------------------------------

const walkStyle = (
  obj: ts.ObjectLiteralExpression,
  node: SkeletonNode,
  nodePath: string[],
  component: string,
  file: string
): void => {
  const cov = coverageOf(component)
  cov.nodes.add(node)

  for (const prop of obj.properties) {
    if (!ts.isPropertyAssignment(prop)) continue
    const key = ts.isStringLiteral(prop.name)
      ? prop.name.text
      : prop.name.getText()
    const value = prop.initializer
    if (!ts.isObjectLiteralExpression(value)) continue // скалярное свойство

    // служебные ключи — тот же узел
    if (/^[:@[]/.test(key)) {
      walkStyle(value, node, nodePath, component, file)
      continue
    }
    // '.класс-тёзка-тега' — класс текущего узла
    if (key.startsWith('.')) {
      cov.classes.add(`${nodePath.join(' > ')}::${key.slice(1)}`)
      walkStyle(value, node, nodePath, component, file)
      continue
    }
    // класс текущего узла (в т.ч. на элементе зоны контента)
    if (node.classes.includes(key)) {
      cov.classes.add(`${nodePath.join(' > ')}::${key}`)
      walkStyle(value, node, nodePath, component, file)
      continue
    }
    // дальше — ключи-селекторы вглубь; в зоне контента разметки нет, молчим
    if (node.free) continue
    // граница компонента: позиционирование, внутрь не идём
    if (/^[A-Z]/.test(key)) continue
    // прямой ребёнок
    const child = node.children.find((c) => c.tag === key)
    if (child) {
      walkStyle(value, child, [...nodePath, key], component, file)
      continue
    }
    // сокращённый путь
    const matches: { node: SkeletonNode; path: string[] }[] = []
    findDescendants(node, key, nodePath, matches)
    if (matches.length > 1) {
      warn(
        file,
        prop.name,
        `${component}: неоднозначный путь «${key}» — совпадает с ${matches
          .map((m) => m.path.join(' > '))
          .join(' и с ')}; уточни промежуточным тегом`
      )
    }
    for (const match of matches) {
      walkStyle(value, match.node, match.path, component, file)
    }
    // 0 совпадений — забота tsc, молчим
  }
}

// --- разбор файлов стилей ---------------------------------------------------

const styleFiles = (fs.readdirSync(stylesDir, { recursive: true }) as string[])
  .filter((f) => f.endsWith('.styles.ts'))
  .sort()

for (const rel of styleFiles) {
  const abs = path.join(stylesDir, rel)
  const relFromRepo = path.relative(process.cwd(), abs)
  const sf = ts.createSourceFile(
    abs,
    fs.readFileSync(abs, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  )

  sf.forEachChild((statement) => {
    if (!ts.isVariableStatement(statement)) return
    for (const decl of statement.declarationList.declarations) {
      if (!decl.initializer || !ts.isIdentifier(decl.name)) continue
      if (!ts.isSatisfiesExpression(decl.initializer)) continue

      const typeText = decl.initializer.type.getText()
      const match = typeText.match(/^StyleOf<\s*Markup\.(\w+)\s*>$/)
      if (!match) continue // GlobalStyle и прочее — не наша забота

      const componentName = match[1]
      const skeleton = skeletons.get(componentName)
      if (!skeleton) continue // несуществующий Markup.X — уже красное у tsc
      styledExports.add(componentName)

      if (decl.name.text !== componentName) {
        warn(
          relFromRepo,
          decl.name,
          `экспорт «${decl.name.text}» стилизует ${componentName} — ` +
            `имена должны совпадать`
        )
      }

      const obj = decl.initializer.expression
      if (!ts.isObjectLiteralExpression(obj)) continue

      // корневой ключ — тег корня
      for (const prop of obj.properties) {
        if (!ts.isPropertyAssignment(prop)) continue
        const key = prop.name.getText()
        if (
          key === skeleton.root.tag &&
          ts.isObjectLiteralExpression(prop.initializer)
        ) {
          walkStyle(
            prop.initializer,
            skeleton.root,
            [skeleton.root.tag],
            componentName,
            relFromRepo
          )
        }
      }

      // непокрытые элементы и классы
      const cov = coverageOf(componentName)
      const missing: string[] = []
      const inspect = (node: SkeletonNode, nodePath: string[]): void => {
        if (!cov.nodes.has(node)) missing.push(nodePath.join(' > '))
        for (const cls of node.classes) {
          if (!cov.classes.has(`${nodePath.join(' > ')}::${cls}`)) {
            missing.push(`${nodePath.join(' > ')}.${cls}`)
          }
        }
        if (node.free) return // внутри зоны контента разметки нет
        for (const child of node.children) {
          inspect(child, [...nodePath, child.tag])
        }
      }
      inspect(skeleton.root, [skeleton.root.tag])
      if (missing.length) {
        warn(
          relFromRepo,
          decl.name,
          `${componentName}: не стилизованы: ${missing.join(', ')}`
        )
      }
    }
  })
}

// --- границы без стилей вообще ----------------------------------------------

for (const component of project.styled) {
  if (!styledExports.has(component.name)) {
    warnings.push({
      file: path.join('v2/dream', component.source),
      line: 1,
      col: 1,
      message: `${component.name}: компонент-граница без единого стиля`,
    })
  }
}

// --- вывод -------------------------------------------------------------------

if (!warnings.length) {
  console.log('линтер: жёлтого нет')
} else {
  for (const w of warnings) {
    console.log(`${w.file}:${w.line}:${w.col} — ${w.message}`)
  }
  console.log(`\nлинтер: предупреждений — ${warnings.length}`)
}

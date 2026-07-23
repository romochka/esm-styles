// esm-styles v2 — продукт «жёлтая диагностика»: зрячий линтер.
// Чистая функция от снапшота проекта; зовут CLI (lint.ts) и watcher (watch.ts).
// Сверяет .styles.ts со скелетами разметки и предупреждает о том,
// чего типы выразить не могут:
//   - элемент или класс разметки, для которого нет стиля (покрытие);
//   - неоднозначный сокращённый путь (union в типах проходит — уточни);
//   - граница-компонент без единого стиля вообще;
//   - несовпадение имени экспорта с именем компонента.
// Красное — не его дело: это работа tsc (npm run check:v2).

import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'
import type { Project } from './pipeline.ts'
import type { SkeletonNode } from './skeleton.ts'

export type Warning = {
  file: string
  line: number
  col: number
  message: string
}

export type LintOptions = {
  appRoot: string
  stylesDir: string
  /** база для относительных путей в выводе (по умолчанию cwd) */
  cwd?: string
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

export const lintProject = (
  project: Project,
  opts: LintOptions
): Warning[] => {
  const cwd = opts.cwd ?? process.cwd()
  const skeletons = new Map(project.styled.map((c) => [c.name, c]))
  const warnings: Warning[] = []

  const warn = (file: string, node: ts.Node | undefined, message: string) => {
    if (!node) {
      warnings.push({ file, line: 1, col: 1, message })
      return
    }
    const sf = node.getSourceFile()
    const { line, character } = sf.getLineAndCharacterOfPosition(
      node.getStart()
    )
    warnings.push({ file, line: line + 1, col: character + 1, message })
  }

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
      // картезиана запятых: типы пропускают любой комма-ключ по образцу,
      // состав частей — наша забота
      if (key.includes(',')) {
        const parts = key
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean)
        for (const part of parts) {
          if (node.classes.includes(part)) {
            cov.classes.add(`${nodePath.join(' > ')}::${part}`)
            walkStyle(value, node, nodePath, component, file)
            continue
          }
          if (/^[A-Z]/.test(part)) continue
          const partChild = node.children.find((c) => c.tag === part)
          if (partChild) {
            walkStyle(value, partChild, [...nodePath, part], component, file)
            continue
          }
          const partMatches: { node: SkeletonNode; path: string[] }[] = []
          findDescendants(node, part, nodePath, partMatches)
          if (!partMatches.length) {
            warn(
              file,
              prop.name,
              `${component}: в «${key}» часть «${part}» не найдена ` +
                `в разметке (типы комма-ключи не проверяют — это ко мне)`
            )
            continue
          }
          if (partMatches.length > 1) {
            warn(
              file,
              prop.name,
              `${component}: неоднозначный путь «${part}» в «${key}» — ` +
                `совпадает с ${partMatches
                  .map((m) => m.path.join(' > '))
                  .join(' и с ')}; уточни промежуточным тегом`
            )
          }
          for (const m of partMatches) {
            walkStyle(value, m.node, m.path, component, file)
          }
        }
        continue
      }
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

  const styleFiles = (
    fs.readdirSync(opts.stylesDir, { recursive: true }) as string[]
  )
    .filter((f) => f.endsWith('.styles.ts'))
    .sort()

  for (const rel of styleFiles) {
    const abs = path.join(opts.stylesDir, rel)
    const relFromCwd = path.relative(cwd, abs)
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
            relFromCwd,
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
              relFromCwd
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
            relFromCwd,
            decl.name,
            `${componentName}: не стилизованы: ${missing.join(', ')}`
          )
        }
      }
    })
  }

  // границы без стилей вообще
  for (const component of project.styled) {
    if (!styledExports.has(component.name)) {
      warnings.push({
        file: path.relative(cwd, path.join(opts.appRoot, component.source)),
        line: 1,
        col: 1,
        message: `${component.name}: компонент-граница без единого стиля`,
      })
    }
  }

  return warnings
}

export const formatWarnings = (warnings: Warning[]): string => {
  if (!warnings.length) return 'линтер: жёлтого нет'
  return (
    warnings
      .map((w) => `${w.file}:${w.line}:${w.col} — ${w.message}`)
      .join('\n') + `\n\nлинтер: предупреждений — ${warnings.length}`
  )
}

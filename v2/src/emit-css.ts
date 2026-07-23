// esm-styles v2 — продукт «CSS»: исполнение стилей и сборка по этажам.
// Здесь живёт «среда исполнения стилей»: $-справочники становятся
// глобалами ДО импорта модулей стилей — поэтому в них нет импортов.
// Этажи — декларативные группы пар (NOTATION.md): каждый этаж → свой
// CSS-файл в @layer, плюс главный файл с порядком слоёв.

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Project } from './pipeline.ts'
import {
  compileComponent,
  compileGlobal,
  printRules,
  type Rule,
} from './compile-css.ts'

export type CssOptions = {
  stylesDir: string
  cssDir: string
  mainCssFile: string
  media: Record<string, string>
  floors: { name: string; include: string }[]
  /** содержимое tokens.css (генератор коллекций) — первый слой каскада */
  tokensCss?: string
}

export type CssResult = {
  files: string[]
  changed: boolean
}

/** import с учётом mtime: правка файла инвалидирует ESM-кэш. */
const freshImport = async (abs: string): Promise<Record<string, unknown>> => {
  const { mtimeMs } = fs.statSync(abs)
  return import(`${pathToFileURL(abs).href}?v=${mtimeMs}`)
}

const writeIfChanged = (file: string, content: string): boolean => {
  const previous = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
  if (previous === content) return false
  fs.writeFileSync(file, content)
  return true
}

export const emitCss = async (
  project: Project,
  opts: CssOptions
): Promise<CssResult> => {
  // 1. Среда исполнения: $-справочники → глобалы
  for (const file of fs.readdirSync(opts.stylesDir)) {
    if (!file.startsWith('$') || !file.endsWith('.ts')) continue
    const mod = await freshImport(path.join(opts.stylesDir, file))
    ;(globalThis as Record<string, unknown>)[path.basename(file, '.ts')] =
      mod.default
  }

  const skeletons = new Map(project.styled.map((c) => [c.name, c]))
  const styleFiles = (
    fs.readdirSync(opts.stylesDir, { recursive: true }) as string[]
  )
    .filter((f) => f.endsWith('.styles.ts'))
    .sort()

  fs.mkdirSync(opts.cssDir, { recursive: true })
  const files: string[] = []
  let changed = false
  const layerNames: string[] = []

  // 2. Токены — первый слой каскада
  if (opts.tokensCss) {
    const css =
      `/* Сгенерировано esm-styles v2, слой «tokens» — не редактировать */\n\n` +
      `@layer tokens {\n${opts.tokensCss.trimEnd().replace(/^(?!$)/gm, '  ')}\n}\n`
    const file = path.join(opts.cssDir, 'tokens.css')
    changed = writeIfChanged(file, css) || changed
    files.push(file)
    layerNames.push('tokens')
  }

  // 3. Этажи
  for (const floor of opts.floors) {
    const members = styleFiles.filter(
      (f) => f === floor.include || f.startsWith(floor.include)
    )
    const rules: Rule[] = []
    for (const rel of members) {
      const mod = await freshImport(path.join(opts.stylesDir, rel))
      for (const [exportName, style] of Object.entries(mod)) {
        if (typeof style !== 'object' || style === null) continue
        const skeleton = skeletons.get(exportName)
        if (skeleton) {
          compileComponent(
            exportName,
            style as Record<string, unknown>,
            skeleton.root,
            opts.media,
            rules
          )
        } else {
          compileGlobal(style as Record<string, unknown>, opts.media, rules)
        }
      }
    }
    const body = printRules(rules).trimEnd()
    const css =
      `/* Сгенерировано esm-styles v2, этаж «${floor.name}» — не редактировать */\n\n` +
      `@layer ${floor.name} {\n${body.replace(/^(?!$)/gm, '  ')}\n}\n`
    const file = path.join(opts.cssDir, `${floor.name}.css`)
    changed = writeIfChanged(file, css) || changed
    files.push(file)
    layerNames.push(floor.name)
  }

  // 4. Главный файл: порядок слоёв + импорты
  const main =
    `/* Сгенерировано esm-styles v2 — не редактировать */\n\n` +
    `@layer ${layerNames.join(', ')};\n\n` +
    layerNames.map((name) => `@import url('./${name}.css');`).join('\n') +
    '\n'
  const mainFile = path.join(opts.cssDir, opts.mainCssFile)
  changed = writeIfChanged(mainFile, main) || changed
  files.push(mainFile)

  return { files, changed }
}

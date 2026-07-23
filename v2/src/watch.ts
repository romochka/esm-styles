// esm-styles v2 — watcher: одно зрячее ядро, несколько продуктов.
// Следит за парами, токенами и конфигом; на каждое изменение пересобирает
// снапшот и обновляет продукты:
//   1. $-справочники и tokens.css (генератор коллекций);
//   2. esm-styles-env.ts — типы (красное в IDE делает tsserver, мы лишь
//      держим env свежим; tsc в цикл watcher'а не входит — это CI);
//   3. CSS по этажам;
//   4. жёлтая диагностика (lint-core + согласованность коллекций).
// Будущий продукт того же ядра: LSP-фасад.
// Запуск: npm run watch:v2

import { watch } from 'node:fs'
import path from 'node:path'
import { loadConfig } from './config.ts'
import {
  loadCollections,
  emitRefs,
  tokensCss,
  checkCollections,
} from './collections.ts'
import { loadProject } from './pipeline.ts'
import { emitEnv } from './emit-env.ts'
import { emitCss } from './emit-css.ts'
import { lintProject, formatWarnings } from './lint-core.ts'

const time = () => new Date().toTimeString().slice(0, 8)

let watchRoot = ''

const run = async (reason: string): Promise<void> => {
  const started = Date.now()
  try {
    const config = await loadConfig()
    watchRoot = config.appRoot
    const collections = await loadCollections(config)
    const refsChanged = emitRefs(collections, config.stylesDir)
    const project = loadProject(config.appRoot)
    const env = emitEnv(project, config)
    const css = await emitCss(project, {
      stylesDir: config.stylesDir,
      cssDir: config.cssDir,
      mainCssFile: config.mainCssFile,
      media: config.shortcuts,
      floors: config.floors,
      tokensCss: tokensCss(collections),
    })
    const warnings = [
      ...checkCollections(collections),
      ...lintProject(project, {
        appRoot: config.appRoot,
        stylesDir: config.stylesDir,
      }),
    ]
    const ms = Date.now() - started
    console.log(
      `\n[${time()}] ${reason} → скелетов: ${project.styled.length}, ` +
        `справочники: ${refsChanged ? 'обновлены' : 'без изменений'}, ` +
        `env: ${env.changed ? 'обновлён' : 'без изменений'}, ` +
        `css: ${css.changed ? 'обновлён' : 'без изменений'}, ${ms}ms`
    )
    console.log(formatWarnings(warnings))
  } catch (error) {
    console.error(`\n[${time()}] ${reason} → ошибка:`, error)
  }
}

await run('старт')

let timer: ReturnType<typeof setTimeout> | undefined
watch(watchRoot, { recursive: true }, (_event, filename) => {
  if (!filename) return
  if (!filename.endsWith('.tsx') && !filename.endsWith('.ts')) return
  const base = path.basename(filename)
  if (base === 'esm-styles-env.ts') return // свой выхлоп
  if (base.startsWith('$')) return // свой выхлоп: справочники
  if (filename.startsWith('css/') || filename.endsWith('.css')) return
  clearTimeout(timer)
  timer = setTimeout(() => void run(filename), 80)
})

console.log(`watcher: слежу за ${path.relative(process.cwd(), watchRoot)}`)

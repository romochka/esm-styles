// esm-styles v2 — watcher: одно зрячее ядро, несколько продуктов.
// Следит за парами (.tsx + .styles.ts) и справочниками, на каждое изменение
// пересобирает снапшот проекта и обновляет продукты:
//   1. esm-styles-env.ts — типы (красное в IDE делает tsserver, мы лишь
//      держим env свежим; tsc в цикл watcher'а не входит — это CI);
//   2. жёлтая диагностика (lint-core).
// Будущие продукты того же ядра: CSS-эмиссия, LSP-фасад.
// Запуск: npm run watch:v2

import { watch } from 'node:fs'
import path from 'node:path'
import { loadProject } from './pipeline.ts'
import { emitEnv } from './emit-env.ts'
import { emitCss } from './emit-css.ts'
import { lintProject, formatWarnings } from './lint-core.ts'
import {
  appRoot,
  stylesDir,
  envFile,
  typesImport,
  cssDir,
  mainCssFile,
  media,
  floors,
} from './paths.ts'

const time = () => new Date().toTimeString().slice(0, 8)

const run = async (reason: string): Promise<void> => {
  const started = Date.now()
  try {
    const project = loadProject(appRoot)
    const env = emitEnv(project, { stylesDir, envFile, typesImport })
    const css = await emitCss(project, {
      stylesDir,
      cssDir,
      mainCssFile,
      media,
      floors,
    })
    const warnings = lintProject(project, { appRoot, stylesDir })
    const ms = Date.now() - started
    console.log(
      `\n[${time()}] ${reason} → скелетов: ${project.styled.length}, ` +
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
watch(appRoot, { recursive: true }, (_event, filename) => {
  if (!filename) return
  if (!filename.endsWith('.tsx') && !filename.endsWith('.ts')) return
  if (path.basename(filename) === path.basename(envFile)) return // свой выхлоп
  if (filename.startsWith('css/') || filename.endsWith('.css')) return
  clearTimeout(timer)
  timer = setTimeout(() => void run(filename), 80)
})

console.log(`watcher: слежу за ${path.relative(process.cwd(), appRoot)}`)

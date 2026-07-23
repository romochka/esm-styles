// esm-styles v2 — CLI: разовая сборка CSS по этажам.
// Ядро — pipeline.ts (скелеты) + emit-css.ts (компиляция и сборка).
// Запуск: npm run css:v2. Непрерывный режим: npm run watch:v2.

import path from 'node:path'
import { loadProject } from './pipeline.ts'
import { emitCss } from './emit-css.ts'
import { appRoot, stylesDir, cssDir, mainCssFile, media, floors } from './paths.ts'

const project = loadProject(appRoot)
const { files, changed } = await emitCss(project, {
  stylesDir,
  cssDir,
  mainCssFile,
  media,
  floors,
})

console.log(
  `css${changed ? '' : ' (без изменений)'}: ` +
    files.map((f) => path.relative(process.cwd(), f)).join(', ')
)

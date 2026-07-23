// esm-styles v2 — CLI: разовая сборка CSS (токены + этажи).
// Запуск: npm run css:v2. Непрерывный режим: npm run watch:v2.

import path from 'node:path'
import { loadConfig } from './config.ts'
import { loadCollections, emitRefs, tokensCss } from './collections.ts'
import { loadProject } from './pipeline.ts'
import { emitCss } from './emit-css.ts'

const config = await loadConfig()
const collections = await loadCollections(config)
emitRefs(collections, config.stylesDir)

const project = loadProject(config.appRoot)
const { files, changed } = await emitCss(project, {
  stylesDir: config.stylesDir,
  cssDir: config.cssDir,
  mainCssFile: config.mainCssFile,
  media: config.shortcuts,
  floors: config.floors,
  tokensCss: tokensCss(collections),
})

console.log(
  `css${changed ? '' : ' (без изменений)'}: ` +
    files.map((f) => path.relative(process.cwd(), f)).join(', ')
)

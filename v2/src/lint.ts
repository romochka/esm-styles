// esm-styles v2 — CLI: разовый прогон зрячего линтера (жёлтый уровень).
// Стили против скелетов (lint-core) + согласованность режимов коллекций.
// Запуск: npm run lint:v2. Непрерывный режим: npm run watch:v2.

import { loadConfig } from './config.ts'
import { loadCollections, checkCollections } from './collections.ts'
import { loadProject } from './pipeline.ts'
import { lintProject, formatWarnings } from './lint-core.ts'

const config = await loadConfig()
const collections = await loadCollections(config)
const project = loadProject(config.appRoot)

const warnings = [
  ...checkCollections(collections),
  ...lintProject(project, {
    appRoot: config.appRoot,
    stylesDir: config.stylesDir,
  }),
]
console.log(formatWarnings(warnings))

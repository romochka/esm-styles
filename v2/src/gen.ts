// esm-styles v2 — CLI: разовая генерация справочников и esm-styles-env.ts.
// Ядро — config.ts + collections.ts + pipeline.ts + emit-env.ts.
// Запуск: npm run gen:v2. Непрерывный режим: npm run watch:v2.

import { loadConfig } from './config.ts'
import { loadCollections, emitRefs } from './collections.ts'
import { loadProject } from './pipeline.ts'
import { emitEnv } from './emit-env.ts'

const config = await loadConfig()
const collections = await loadCollections(config)
const refsChanged = emitRefs(collections, config.stylesDir)

const project = loadProject(config.appRoot)
const { changed, refModules } = emitEnv(project, config)

console.log(
  `справочники${refsChanged ? '' : ' (без изменений)'}: ${refModules.join(', ')}; ` +
    `esm-styles-env.ts${changed ? '' : ' (без изменений)'}: ` +
    `${project.styled.length} скелетов (${project.styled
      .map((c) => c.name)
      .join(', ')})` +
    (project.transparent.length
      ? `, прозрачные: ${project.transparent.map((c) => c.name).join(', ')}`
      : '')
)

// esm-styles v2 — CLI: разовая генерация esm-styles-env.ts.
// Ядро — pipeline.ts (скелеты) + emit-env.ts (эмиссия).
// Запуск: npm run gen:v2. Непрерывный режим: npm run watch:v2.

import { loadProject } from './pipeline.ts'
import { emitEnv } from './emit-env.ts'
import { appRoot, stylesDir, envFile, typesImport } from './paths.ts'

const project = loadProject(appRoot)
const { changed, refModules } = emitEnv(project, {
  stylesDir,
  envFile,
  typesImport,
})

console.log(
  `esm-styles-env.ts${changed ? '' : ' (без изменений)'}: ` +
    `${project.styled.length} скелетов (${project.styled
      .map((c) => c.name)
      .join(', ')}), справочники: ${refModules.join(', ')}` +
    (project.transparent.length
      ? `, прозрачные: ${project.transparent.map((c) => c.name).join(', ')}`
      : '')
)

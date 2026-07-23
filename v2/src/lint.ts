// esm-styles v2 — CLI: разовый прогон зрячего линтера (жёлтый уровень).
// Ядро — pipeline.ts (скелеты) + lint-core.ts (проверки).
// Запуск: npm run lint:v2. Непрерывный режим: npm run watch:v2.

import { loadProject } from './pipeline.ts'
import { lintProject, formatWarnings } from './lint-core.ts'
import { appRoot, stylesDir } from './paths.ts'

const project = loadProject(appRoot)
const warnings = lintProject(project, { appRoot, stylesDir })
console.log(formatWarnings(warnings))

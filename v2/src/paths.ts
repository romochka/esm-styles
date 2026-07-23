// esm-styles v2 — пути проекта (прообраз будущего esm-styles.config).

import path from 'node:path'

export const v2Root = path.resolve(import.meta.dirname, '..')
export const appRoot = path.join(v2Root, 'dream')
export const stylesDir = path.join(appRoot, 'styles')
export const envFile = path.join(stylesDir, 'esm-styles-env.ts')
export const typesImport = '../../src/types'

export const cssDir = path.join(appRoot, 'css')
export const mainCssFile = 'styles.css'

/** '@шорткат' → at-правило или селектор-предок */
export const media: Record<string, string> = {
  '@mobile': '@media (max-width: 767px)',
  '@dark': '@media (prefers-color-scheme: dark)',
}

/** Этажи каскада: декларативные группы пар (NOTATION.md → «Этажи») */
export const floors: { name: string; include: string }[] = [
  { name: 'global', include: 'global.styles.ts' },
  { name: 'layout', include: 'layout.styles.ts' },
  { name: 'components', include: 'components/' },
  { name: 'pages', include: 'pages/' },
]

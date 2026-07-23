// esm-styles v2 — загрузка конфига. Все пути в конфиге относительны папке
// самого конфига (как tsconfig/vite); basePath — опциональный префикс
// для случая «конфиг в корне репо, стили глубже».

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { Collection, EsmStylesConfig } from './types.ts'

export const v2Root = path.resolve(import.meta.dirname, '..')
export const configFile = path.join(v2Root, 'dream', 'esm-styles.config.ts')

/** import с учётом mtime: правка файла инвалидирует ESM-кэш. */
export const freshImport = async (
  abs: string
): Promise<Record<string, unknown>> => {
  const { mtimeMs } = fs.statSync(abs)
  return import(`${pathToFileURL(abs).href}?v=${mtimeMs}`)
}

export type ResolvedConfig = {
  appRoot: string
  stylesDir: string
  tokensDir: string
  cssDir: string
  mainCssFile: string
  envFile: string
  typesImport: string
  floors: { name: string; include: string }[]
  shortcuts: Record<string, string>
  collections: { [name: string]: Collection }
}

export const loadConfig = async (): Promise<ResolvedConfig> => {
  const raw = (await freshImport(configFile)).default as EsmStylesConfig
  const base = path.resolve(path.dirname(configFile), raw.basePath ?? '.')
  const stylesDir = path.resolve(base, raw.stylesPath ?? './styles')
  return {
    appRoot: base,
    stylesDir,
    tokensDir: path.resolve(base, raw.tokensPath ?? './tokens'),
    cssDir: path.resolve(base, raw.outputPath ?? './css'),
    mainCssFile: raw.mainCssFile ?? 'styles.css',
    envFile: path.join(stylesDir, 'esm-styles-env.ts'),
    typesImport: path.relative(stylesDir, path.join(v2Root, 'src', 'types')),
    floors: raw.floors ?? [],
    shortcuts: raw.shortcuts ?? {},
    collections: raw.collections ?? {},
  }
}

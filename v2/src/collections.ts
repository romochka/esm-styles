// esm-styles v2 — генератор коллекций («медиаобъектов»).
// Читает конфиг + tokens/<mode>.<collection>.ts и порождает два продукта:
//   1. $-справочники ($theme.ts, $device.ts) — строки 'var(--…)' с JSDoc,
//      показывающим значения ВСЕХ режимов (включая унаследованные);
//   2. tokens.css — переменные без дубляжа: наследование каскадом
//      (режим пишет только диффы), colorScheme-коллекции — через
//      color-scheme + light-dark(), «auto» — нативная семантика, не режим.
// Согласованность режимов (токен-сирота и пр.) — жёлтые предупреждения.

import fs from 'node:fs'
import path from 'node:path'
import { freshImport } from './config.ts'
import type { ResolvedConfig } from './config.ts'
import type { TokenValues } from './types.ts'
import type { Warning } from './lint-core.ts'

type Flat = Map<string, string | number> // 'paper.bright' → значение

export type LoadedMode = {
  name: string
  parent?: string
  raw: TokenValues
  rawFlat: Flat
  resolved: Flat
  activations: { media?: string; selector?: string }[]
  scheme: 'light' | 'dark'
  file: string
}

export type LoadedCollection = {
  name: string
  colorScheme: boolean
  modes: LoadedMode[] // [0] — дефолт и канон структуры
}

const isObj = (v: unknown): v is TokenValues =>
  typeof v === 'object' && v !== null

const flatten = (values: TokenValues, prefix = ''): Flat => {
  const flat: Flat = new Map()
  for (const [key, value] of Object.entries(values)) {
    const p = prefix ? `${prefix}.${key}` : key
    if (isObj(value)) for (const [k, v] of flatten(value, p)) flat.set(k, v)
    else flat.set(p, value)
  }
  return flat
}

const isColor = (v: unknown): boolean =>
  typeof v === 'string' &&
  /^(#|rgb|hsl|hwb|lab|lch|oklab|oklch|color\()/i.test(v)

const kebab = (s: string): string =>
  s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)

const varName = (collection: string, tokenPath: string): string =>
  `--${[collection, ...tokenPath.split('.')].map(kebab).join('-')}`

// --- загрузка ----------------------------------------------------------------

export const loadCollections = async (
  config: ResolvedConfig
): Promise<LoadedCollection[]> => {
  const result: LoadedCollection[] = []
  for (const [name, col] of Object.entries(config.collections)) {
    const modeNames = Object.keys(col.modes)
    const modes: LoadedMode[] = []
    for (const [i, modeName] of modeNames.entries()) {
      const file = path.join(config.tokensDir, `${modeName}.${name}.ts`)
      if (!fs.existsSync(file)) {
        throw new Error(
          `режим ${name}.${modeName} объявлен в конфиге, а файла ` +
            `${path.relative(process.cwd(), file)} нет`
        )
      }
      const raw = (await freshImport(file)).default as TokenValues
      const def = col.modes[modeName]
      const parent = i === 0 ? undefined : (def.inherits ?? modeNames[i - 1])
      const parentMode = parent
        ? modes.find((m) => m.name === parent)
        : undefined
      if (parent && !parentMode) {
        throw new Error(
          `${name}.${modeName}: inherits «${parent}» должен быть объявлен раньше`
        )
      }
      const rawFlat = flatten(raw)
      const resolved = new Map(parentMode?.resolved ?? [])
      for (const [k, v] of rawFlat) resolved.set(k, v)
      const activations =
        def.on ??
        (def.media || def.selector
          ? [{ media: def.media, selector: def.selector }]
          : [])
      const scheme: 'light' | 'dark' =
        modeName === 'light' || modeName === 'dark'
          ? modeName
          : (parentMode?.scheme ?? 'light')
      modes.push({
        name: modeName,
        parent,
        raw,
        rawFlat,
        resolved,
        activations,
        scheme,
        file,
      })
    }
    if (col.colorScheme) {
      for (const required of ['light', 'dark']) {
        if (!modes.find((m) => m.name === required)) {
          throw new Error(
            `коллекция ${name}: colorScheme требует режимов light и dark`
          )
        }
      }
    }
    result.push({ name, colorScheme: !!col.colorScheme, modes })
  }
  return result
}

// --- $-справочники -------------------------------------------------------------

const refSource = (col: LoadedCollection): string => {
  const lines: string[] = [
    `// Сгенерировано esm-styles v2 из tokens/<mode>.${col.name}.ts —`,
    `// руками не редактировать. Перегенерация: npm run gen:v2 (или watch:v2).`,
    `// Токен — обычная строка 'var(--…)'; значения режимов видны при hover.`,
    ``,
    `export default {`,
  ]
  const walk = (values: TokenValues, tokenPath: string[], indent: string) => {
    for (const [key, value] of Object.entries(values)) {
      if (isObj(value)) {
        lines.push(`${indent}${key}: {`)
        walk(value, [...tokenPath, key], indent + '  ')
        lines.push(`${indent}},`)
        continue
      }
      const p = [...tokenPath, key].join('.')
      const doc = col.modes
        .map((m) => `${m.name} \`${m.resolved.get(p)}\``)
        .join(' · ')
      lines.push(`${indent}/** ${doc} */`)
      lines.push(`${indent}${key}: 'var(${varName(col.name, p)})',`)
    }
  }
  walk(col.modes[0].raw, [], '  ')
  lines.push(`}`, ``)
  return lines.join('\n')
}

export const emitRefs = (
  collections: LoadedCollection[],
  stylesDir: string
): boolean => {
  let changed = false
  for (const col of collections) {
    const file = path.join(stylesDir, `$${col.name}.ts`)
    const content = refSource(col)
    const previous = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
    if (previous !== content) {
      fs.writeFileSync(file, content)
      changed = true
    }
  }
  return changed
}

// --- tokens.css ------------------------------------------------------------------

/** Что «доставляет» :root для данной схемы: цвета, различающиеся между
 *  light и dark — соответствующее плечо light-dark(); остальное — дефолт. */
const rootDelivery = (col: LoadedCollection, scheme: 'light' | 'dark'): Flat => {
  const light = col.modes.find((m) => m.name === 'light')!.resolved
  const dark = col.modes.find((m) => m.name === 'dark')!.resolved
  const delivery: Flat = new Map()
  for (const [p, lightValue] of light) {
    const darkValue = dark.get(p)
    const pair =
      isColor(lightValue) && isColor(darkValue) && lightValue !== darkValue
    delivery.set(p, pair ? (scheme === 'dark' ? darkValue! : lightValue) : lightValue)
  }
  return delivery
}

export const tokensCss = (collections: LoadedCollection[]): string => {
  const out: string[] = []
  for (const col of collections) {
    const defaultMode = col.modes[0]
    out.push(`/* коллекция ${col.name} */`)

    // :root — дефолт
    out.push(`:root {`)
    if (col.colorScheme) {
      out.push(`  color-scheme: light dark;`)
      const dark = col.modes.find((m) => m.name === 'dark')!.resolved
      for (const [p, lightValue] of defaultMode.resolved) {
        const darkValue = dark.get(p)
        const pair =
          isColor(lightValue) && isColor(darkValue) && lightValue !== darkValue
        out.push(
          `  ${varName(col.name, p)}: ${
            pair ? `light-dark(${lightValue}, ${darkValue})` : lightValue
          };`
        )
      }
    } else {
      for (const [p, value] of defaultMode.resolved) {
        out.push(`  ${varName(col.name, p)}: ${value};`)
      }
    }
    out.push(`}`, ``)

    // режимы: только диффы от того, что уже доставил :root
    for (const mode of col.modes) {
      if (!mode.activations.length) continue
      const base = col.colorScheme
        ? rootDelivery(col, mode.scheme)
        : defaultMode.resolved
      const content: string[] = []
      if (col.colorScheme) content.push(`color-scheme: ${mode.scheme};`)
      for (const [p, value] of mode.resolved) {
        if (base.get(p) !== value) {
          content.push(`${varName(col.name, p)}: ${value};`)
        }
      }
      if (!content.length) continue

      const selectorOnly = mode.activations.filter(
        (a) => a.selector && !a.media
      )
      const withMedia = mode.activations.filter((a) => a.media)
      if (selectorOnly.length) {
        const sel =
          selectorOnly.length === 1
            ? `:root${selectorOnly[0].selector}`
            : `:root:is(${selectorOnly.map((a) => a.selector).join(', ')})`
        out.push(`${sel} {`, ...content.map((l) => `  ${l}`), `}`, ``)
      }
      for (const a of withMedia) {
        out.push(
          `@media ${a.media} {`,
          `  :root${a.selector ?? ''} {`,
          ...content.map((l) => `    ${l}`),
          `  }`,
          `}`,
          ``
        )
      }
    }
  }
  return out.join('\n').trimEnd() + '\n'
}

// --- согласованность (жёлтое) -------------------------------------------------------

export const checkCollections = (
  collections: LoadedCollection[],
  cwd = process.cwd()
): Warning[] => {
  const warnings: Warning[] = []
  const warn = (file: string, message: string) =>
    warnings.push({ file: path.relative(cwd, file), line: 1, col: 1, message })

  for (const col of collections) {
    const canon = col.modes[0]
    for (const mode of col.modes.slice(1)) {
      for (const p of mode.rawFlat.keys()) {
        if (!canon.resolved.has(p)) {
          warn(
            mode.file,
            `${col.name}.${mode.name}: токен «${p}» отсутствует в каноне ` +
              `(${canon.name}) — сирота, в справочник не попадёт`
          )
        }
      }
    }
    if (col.colorScheme) {
      const light = col.modes.find((m) => m.name === 'light')!
      const dark = col.modes.find((m) => m.name === 'dark')!
      for (const [p, lightValue] of light.resolved) {
        const darkValue = dark.resolved.get(p)
        if (
          lightValue !== darkValue &&
          !(isColor(lightValue) && isColor(darkValue))
        ) {
          warn(
            dark.file,
            `${col.name}: токен «${p}» не цвет — light-dark() неприменим, ` +
              `авто-режим его не переключит (только явный selector)`
          )
        }
      }
    }
  }
  return warnings
}

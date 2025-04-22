import type { GetCssOptions } from '../types/index.js'

interface MediaShorthand {
  selector?: string
  mediaQuery?: string
  prefix?: string
}

export interface MediaShorthandResult {
  mediaQueries: Record<string, string>
  selectorShorthands: Record<string, MediaShorthand[]>
  allShorthands: Record<string, MediaShorthand[]>
}

export function getMediaShorthands(config: any): MediaShorthandResult {
  const mediaQueries: Record<string, string> = { ...config.mediaQueries }
  const selectorShorthands: Record<string, MediaShorthand[]> = {}
  const allShorthands: Record<string, MediaShorthand[]> = {}
  const usedNames = new Set<string>()

  // 1. From mediaSelectors
  if (config.mediaSelectors) {
    for (const mediaType of Object.keys(config.mediaSelectors)) {
      const variants = config.mediaSelectors[mediaType]
      for (const variantName of Object.keys(variants)) {
        const entries = variants[variantName]
        for (const entry of entries) {
          // If has mediaQuery and no selector: treat as media query
          if (entry.mediaQuery && !entry.selector) {
            if (mediaQueries[variantName]) {
              console.warn(
                `[esm-styles] Warning: Duplicate media shorthand '${variantName}' in both mediaQueries and mediaSelectors. Using value from mediaQueries.`
              )
              continue
            }
            mediaQueries[variantName] = entry.mediaQuery
            usedNames.add(variantName)
            allShorthands[variantName] = allShorthands[variantName] || []
            allShorthands[variantName].push({ mediaQuery: entry.mediaQuery })
          }
          // If has selector: treat as selector shorthand
          if (entry.selector) {
            selectorShorthands[variantName] =
              selectorShorthands[variantName] || []
            selectorShorthands[variantName].push({
              selector: entry.selector,
              mediaQuery: entry.mediaQuery,
              prefix: entry.prefix,
            })
            usedNames.add(variantName)
            allShorthands[variantName] = allShorthands[variantName] || []
            allShorthands[variantName].push({
              selector: entry.selector,
              mediaQuery: entry.mediaQuery,
              prefix: entry.prefix,
            })
          }
        }
      }
    }
  }

  // 2. From mediaQueries (overrides)
  if (config.mediaQueries) {
    for (const name of Object.keys(config.mediaQueries)) {
      if (usedNames.has(name)) {
        console.warn(
          `[esm-styles] Warning: Duplicate media shorthand '${name}' in both mediaQueries and mediaSelectors. Using value from mediaQueries.`
        )
      }
      mediaQueries[name] = config.mediaQueries[name]
      allShorthands[name] = [{ mediaQuery: config.mediaQueries[name] }]
    }
  }

  return { mediaQueries, selectorShorthands, allShorthands }
}

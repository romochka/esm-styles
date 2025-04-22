// Main entry point for JS-to-CSS conversion library
import type {
  CssJsObject,
  GetCssOptions,
  CssString,
  CssRuleObject,
} from './types/index.js'
import * as utils from './utils/index.js'

// getCss implementation plan:
// 1. Recursively walk the input object.
// 2. For each key/value:
//    - If value is a primitive, treat as CSS property (convert camelCase to kebab-case).
//    - If value is an object, treat as selector (tag, class, id, pseudo, attribute, etc.).
//    - Handle special cases: underscores, double underscores, media queries, layers, content, etc.
//    - Support nested selectors and comma-separated selectors.
//    - Collect media queries and layers for output at the end.
// 3. Output a formatted CSS string.

// Available utilities: utils.isHtmlTag, utils.isClassSelector, utils.isSpecialSelector, utils.joinSelectorPath, utils.jsKeyToCssKey, utils.contentValue, utils.cartesianProduct, utils.prettifyCssString, utils.isEndValue

// Refer to doc/translation.md in package root for more details

// --- FLATTENED MEDIA COLLECTION ---

interface FlatWalkResult {
  rules: { selector: string; declarations: CssRuleObject }[]
  media: Record<string, { selector: string; declarations: CssRuleObject }[]>
  layers: Record<string, FlatWalkResult>
}

type SelectorPath = string[][]

function flatWalk(
  obj: CssJsObject,
  selectorPath: SelectorPath = [],
  result: FlatWalkResult = { rules: [], media: {}, layers: {} },
  options: GetCssOptions = {},
  currentMedia: string[] = []
): FlatWalkResult {
  const props: CssRuleObject = {}
  for (const key in obj) {
    const value = obj[key]
    if (utils.isEndValue(value)) {
      const cssKey = utils.jsKeyToCssKey(key)
      props[cssKey] = cssKey === 'content' ? utils.contentValue(value) : value
    } else if (typeof value === 'object' && value !== null) {
      if (key.startsWith('@media ')) {
        // Recursively walk value, collecting rules for this media block
        const nested = flatWalk(
          value,
          selectorPath,
          { rules: [], media: {}, layers: {} },
          options,
          [...currentMedia, key]
        )
        const mediaKey = [...currentMedia, key].join(' && ')
        if (!result.media[mediaKey]) result.media[mediaKey] = []
        result.media[mediaKey].push(...nested.rules)
        // Also merge any nested media
        for (const nestedMediaKey in nested.media) {
          if (!result.media[nestedMediaKey]) result.media[nestedMediaKey] = []
          result.media[nestedMediaKey].push(...nested.media[nestedMediaKey])
        }
      } else if (key.startsWith('@layer ')) {
        if (!result.layers[key])
          result.layers[key] = { rules: [], media: {}, layers: {} }
        flatWalk(value, selectorPath, result.layers[key], options, currentMedia)
      } else if (key.startsWith('@')) {
        // Other special keys (shorthands, etc.)
        const shorthand = key.slice(1)
        let handled = false
        if (options.mediaQueries && options.mediaQueries[shorthand]) {
          const mediaKey = `@media ${options.mediaQueries[shorthand]}`
          flatWalk(value, selectorPath, result, options, [
            ...currentMedia,
            mediaKey,
          ])
          handled = true
        }
        if (
          options.selectorShorthands &&
          options.selectorShorthands[shorthand]
        ) {
          const root = options.globalRootSelector || ':root'
          for (const entry of options.selectorShorthands[shorthand]) {
            if (entry.selector && !entry.mediaQuery) {
              flatWalk(
                value,
                [[root + entry.selector], ...selectorPath],
                result,
                options,
                currentMedia
              )
              handled = true
            }
            if (entry.selector && entry.mediaQuery) {
              const mediaKey = `@media ${entry.mediaQuery}`
              flatWalk(
                value,
                [[root + entry.selector], ...selectorPath],
                result,
                options,
                [...currentMedia, mediaKey]
              )
              handled = true
            }
            if (!entry.selector && entry.mediaQuery) {
              const mediaKey = `@media ${entry.mediaQuery}`
              flatWalk(value, selectorPath, result, options, [
                ...currentMedia,
                mediaKey,
              ])
              handled = true
            }
          }
        }
        if (!handled) {
          if (key.startsWith('@media') || key.startsWith('@layer')) {
            // skip
          } else {
            const parts = key.split(',').map((k) => k.trim())
            flatWalk(
              value,
              [...selectorPath, parts],
              result,
              options,
              currentMedia
            )
          }
        }
      } else {
        // Always treat as selector segment if not a special key
        const parts = key.split(',').map((k) => k.trim())
        flatWalk(value, [...selectorPath, parts], result, options, currentMedia)
      }
    }
  }
  if (Object.keys(props).length > 0) {
    const selectors = utils.joinSelectorPath(selectorPath)
    for (const selector of selectors) {
      if (currentMedia.length === 0) {
        result.rules.push({ selector, declarations: { ...props } })
      } else {
        const mediaKey = currentMedia.join(' && ')
        if (!result.media[mediaKey]) result.media[mediaKey] = []
        result.media[mediaKey].push({ selector, declarations: { ...props } })
      }
    }
  }
  return result
}

function renderRules(
  rules: { selector: string; declarations: CssRuleObject }[]
): string {
  let css = ''
  const groups: Record<string, string[]> = {}
  for (const rule of rules) {
    const declKey = JSON.stringify(rule.declarations)
    if (!groups[declKey]) groups[declKey] = []
    groups[declKey].push(rule.selector)
  }
  for (const declKey in groups) {
    const selectors = groups[declKey].join(', ')
    const declarations: CssRuleObject = JSON.parse(declKey)
    css += `${selectors} {\n`
    for (const key in declarations) {
      css += `  ${key}: ${declarations[key]};\n`
    }
    css += '}\n'
  }
  return css
}

function renderLayers(layers: Record<string, FlatWalkResult>): string {
  let css = ''
  for (const key in layers) {
    css += `${key} {\n`
    css += renderRules(layers[key].rules)
    css += renderFlatMedia(layers[key].media)
    css += renderLayers(layers[key].layers)
    css += '}\n'
  }
  return css
}

function renderFlatMedia(
  media: Record<string, { selector: string; declarations: CssRuleObject }[]>
): string {
  let css = ''
  for (const key in media) {
    // If the key contains '&&', recursively nest the media blocks
    const mediaParts = key.split(' && ')
    if (mediaParts.length > 1) {
      css += mediaParts.reduceRight(
        (inner, part) => `${part} {\n${inner}\n}`,
        renderFlatMedia({ ['']: media[key] })
      )
    } else if (key === '') {
      // Render rules directly, no block
      // Group rules by their declarations (stringified)
      const groups: Record<string, string[]> = {}
      for (const rule of media[key]) {
        const declKey = JSON.stringify(rule.declarations)
        if (!groups[declKey]) groups[declKey] = []
        groups[declKey].push(rule.selector)
      }
      for (const declKey in groups) {
        const selectors = groups[declKey].join(', ')
        const declarations: CssRuleObject = JSON.parse(declKey)
        css += `${selectors} {\n`
        for (const k in declarations) {
          css += `  ${k}: ${declarations[k]};\n`
        }
        css += '}\n'
      }
    } else {
      css += `${key} {\n`
      // Group rules by their declarations (stringified)
      const groups: Record<string, string[]> = {}
      for (const rule of media[key]) {
        const declKey = JSON.stringify(rule.declarations)
        if (!groups[declKey]) groups[declKey] = []
        groups[declKey].push(rule.selector)
      }
      for (const declKey in groups) {
        const selectors = groups[declKey].join(', ')
        const declarations: CssRuleObject = JSON.parse(declKey)
        css += `${selectors} {\n`
        for (const k in declarations) {
          css += `  ${k}: ${declarations[k]};\n`
        }
        css += '}\n'
      }
      css += '}\n'
    }
  }
  return css
}

function mergeMedia(
  target: Record<string, { selector: string; declarations: CssRuleObject }[]>,
  source: Record<string, { selector: string; declarations: CssRuleObject }[]>
) {
  for (const key in source) {
    if (!target[key]) target[key] = []
    target[key].push(...source[key])
  }
}

export function getCss(
  styles: CssJsObject,
  options: GetCssOptions = {}
): CssString {
  const result = flatWalk(
    styles,
    [],
    { rules: [], media: {}, layers: {} },
    options
  )
  if (typeof console !== 'undefined') {
    console.log(
      '[esm-styles] flatWalk result:',
      JSON.stringify(result, null, 2)
    )
  }
  let css = ''
  css += renderRules(result.rules)
  css += renderFlatMedia(result.media)
  css += renderLayers(result.layers)
  return utils.prettifyCssString(css)
}

export * from './types/index.js'

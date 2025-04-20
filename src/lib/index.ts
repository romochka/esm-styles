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

interface WalkResult {
  rules: { selector: string; declarations: CssRuleObject }[]
  media: Record<string, WalkResult>
  layers: Record<string, WalkResult>
}

function walk(
  obj: CssJsObject,
  selectorPath: string[] = [],
  result: WalkResult = { rules: [], media: {}, layers: {} }
): WalkResult {
  const props: CssRuleObject = {}
  for (const key in obj) {
    const value = obj[key]
    if (utils.isEndValue(value)) {
      // Property: convert key to kebab-case, handle content
      const cssKey = utils.jsKeyToCssKey(key)
      props[cssKey] = cssKey === 'content' ? utils.contentValue(value) : value
    } else if (typeof value === 'object' && value !== null) {
      if (key.startsWith('@media ')) {
        // Media query block
        if (!result.media[key])
          result.media[key] = { rules: [], media: {}, layers: {} }
        walk(value, selectorPath, result.media[key])
      } else if (key.startsWith('@layer ')) {
        // Layer block
        if (!result.layers[key])
          result.layers[key] = { rules: [], media: {}, layers: {} }
        walk(value, selectorPath, result.layers[key])
      } else if (key.includes(',')) {
        // Comma-separated selectors
        const parts = key.split(',').map((k) => k.trim())
        for (const part of parts) {
          walk(value, [...selectorPath, part], result)
        }
      } else {
        walk(value, [...selectorPath, key], result)
      }
    }
  }
  if (Object.keys(props).length > 0) {
    const selector = utils.joinSelectorPath(selectorPath)
    result.rules.push({ selector, declarations: props })
  }
  return result
}

function renderRules(
  rules: { selector: string; declarations: CssRuleObject }[]
): string {
  let css = ''
  for (const rule of rules) {
    css += `${rule.selector} {\n`
    for (const key in rule.declarations) {
      css += `  ${key}: ${rule.declarations[key]};\n`
    }
    css += '}\n'
  }
  return css
}

function renderMedia(media: Record<string, WalkResult>): string {
  let css = ''
  for (const key in media) {
    css += `${key} {\n`
    css += renderRules(media[key].rules)
    css += renderMedia(media[key].media)
    css += renderLayers(media[key].layers)
    css += '}\n'
  }
  return css
}

function renderLayers(layers: Record<string, WalkResult>): string {
  let css = ''
  for (const key in layers) {
    css += `${key} {\n`
    css += renderRules(layers[key].rules)
    css += renderMedia(layers[key].media)
    css += renderLayers(layers[key].layers)
    css += '}\n'
  }
  return css
}

export function getCss(
  styles: CssJsObject,
  options: GetCssOptions = {}
): CssString {
  // Walk and collect rules, media, and layers
  const result = walk(styles)
  let css = ''
  css += renderRules(result.rules)
  css += renderMedia(result.media)
  css += renderLayers(result.layers)
  return utils.prettifyCssString(css)
}

export * from './types/index.js'

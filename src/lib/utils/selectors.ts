/**
 * Utilities for working with CSS selectors
 */

import { isHtmlTag } from './tags.js'

/**
 * Joins selector parts into a valid CSS selector
 * @param path - Array of selector parts or a single selector
 * @returns Combined CSS selector
 */
export function joinSelectors(path: string | string[]): string {
  const array = typeof path === 'string' ? [path] : path
  let result = ''

  for (const keyStr of array) {
    // Skip empty key strings
    if (!keyStr.trim()) continue

    const key = keyStr.replace(/&/g, '').trim()

    if (isHtmlTag(key)) {
      // If it's an HTML tag, just add it with a space
      result += ` ${key}`
    } else {
      let prefix = ''
      let selector = key

      // Handle reference to parent selector with &
      if (/^&/.test(keyStr)) {
        prefix += ' '
      }

      // Handle double underscore for descendant of any level (T6)
      if (/^__/.test(key)) {
        prefix += ' '
        selector = selector.replace(/^__/, '')
      }

      // Handle single underscore for class selector (T5)
      if (/^_/.test(key)) {
        selector = selector.replace(/^_/, '')
        if (!isHtmlTag(selector)) {
          // If not a tag, increase level
          prefix += ' '
        }
      }

      // Add dot for class selectors if needed
      if (!/^[.:#*[~+>]/.test(selector)) {
        if (!/\./.test(prefix)) prefix += '.'
      }

      // Special handling for universal selector
      if (/^\*/.test(selector)) {
        prefix = ' ' + prefix
      }

      result += prefix + selector
    }
  }

  // Fix any double dots that might have been created
  result = result.replace(/\.\s*\./g, '.')

  // Clean up whitespace
  result = result
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    // Preserve proper spacing around combinators
    .replace(/\s*([>+~])\s*/g, ' $1 ')
    // Fix pseudo-classes and pseudo-elements
    .replace(/\s+:/g, ':')
    // Fix attribute selectors
    .replace(/\s+\[/g, '[')
    // Trim whitespace
    .trim()

  return result
}

/**
 * Creates a Cartesian product of selector parts and joins them
 * @param parts - Array of selector parts arrays
 * @returns Array of all possible combined selectors
 */
export function cartesianSelectors(parts: string[][]): string[] {
  // Base case: If empty or just one part, return it flattened
  if (parts.length === 0) return []
  if (parts.length === 1) return parts[0]

  // Implementation of cartesian product
  const result = parts.reduce<string[][]>(
    (acc, curr) => acc.flatMap((x) => curr.map((y) => [...x, y])),
    [[]]
  )

  return result.map((selectors) => {
    // Handle comma-separated selectors by creating real CSS selector lists
    return joinSelectors(selectors.filter(Boolean))
  })
}

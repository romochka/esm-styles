/**
 * Utilities for handling media queries
 */

import { CssStyles, MediaQueries, CssValue } from '../types/index.js'
import { indent, jsKeyToCssKey } from './common.js'
import { obj2css } from './obj2css.js'
import { isEndValue } from './common.js'

/**
 * Processes media query objects and converts them to CSS
 * @param mediaObject - Object containing media queries and their styles
 * @param mediaQueries - Named media query definitions
 * @returns CSS string with processed media queries
 */
export function processMediaQueries(
  mediaObject: CssStyles,
  mediaQueries: MediaQueries = {}
): string {
  if (!mediaObject || Object.keys(mediaObject).length === 0) {
    return ''
  }

  const mediaQueriesToProcess = Object.keys(mediaObject)

  // Process each media query and convert to CSS
  const mediaCssStrings = mediaQueriesToProcess.map((queryKey) => {
    // Handle named media queries (using @name syntax)
    const mediaQueryMatch = queryKey.match(/^@(\w+)$/)
    let actualQuery = queryKey

    if (
      mediaQueryMatch &&
      mediaQueryMatch[1] &&
      mediaQueries[mediaQueryMatch[1]]
    ) {
      // Replace named query with actual query definition
      actualQuery = mediaQueries[mediaQueryMatch[1]]
    } else if (queryKey.startsWith('@media ')) {
      // Strip @media prefix if present
      actualQuery = queryKey.replace(/^@media\s+/, '')
    }

    // Convert the styles for this media query to CSS
    const styles = mediaObject[queryKey]

    // Skip if the styles aren't an object
    if (isEndValue(styles)) {
      return ''
    }

    // Process the styles to convert camelCase properties to kebab-case
    const processedStyles = processStylesForMedia(styles as Record<string, any>)

    const stylesCss = obj2css(processedStyles)

    if (!stylesCss.trim()) {
      return ''
    }

    // Wrap the styles in a media query block
    return `@media ${actualQuery} {\n${indent(stylesCss)}\n}`
  })

  // Join all media query blocks with newlines
  return mediaCssStrings.filter((css) => css).join('\n\n')
}

/**
 * Processes styles for media queries to ensure camelCase is converted to kebab-case
 * @param styles - Style object to process
 * @returns Processed style object with converted property names
 */
function processStylesForMedia(
  styles: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = {}

  // Process each selector in the styles
  Object.keys(styles).forEach((selector) => {
    const selectorStyles = styles[selector]

    // Skip if not an object
    if (isEndValue(selectorStyles)) {
      result[selector] = selectorStyles
      return
    }

    const processedProps: Record<string, any> = {}

    // Convert each property name to kebab-case
    Object.keys(selectorStyles).forEach((prop) => {
      const cssKey = jsKeyToCssKey(prop)
      processedProps[cssKey] = selectorStyles[prop]
    })

    result[selector] = processedProps
  })

  return result
}

/**
 * Checks if a key represents a media query
 * @param key - Key to check
 * @returns True if the key is a media query
 */
export function isMediaQuery(key: string): boolean {
  return key.startsWith('@media') || key.startsWith('@')
}

/**
 * Checks if a key is a named media query that needs to be resolved
 * @param key - Key to check
 * @param mediaQueries - Named media query definitions
 * @returns True if the key is a named media query
 */
export function isNamedMediaQuery(
  key: string,
  mediaQueries: MediaQueries
): boolean {
  const match = key.match(/^@(\w+)$/)
  return Boolean(match && match[1] && mediaQueries[match[1]])
}

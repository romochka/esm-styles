/**
 * Utilities for handling media queries
 */

import { CssStyles, MediaQueries, CssValue } from '../types/index.js'
import { indent } from './common.js'
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

    const stylesCss = obj2css(styles as Record<string, any>)

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

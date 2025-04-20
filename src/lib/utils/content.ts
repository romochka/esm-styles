/**
 * Utilities for handling CSS content property values
 */

import { getObjectType } from './common.js'

/**
 * Converts a JavaScript string value to a valid CSS content property value
 * @param value - String value to convert for CSS content property
 * @returns CSS-compatible content value
 */
export function formatContentValue(
  value: string | number | boolean | null
): string {
  if (value === null) return 'none'

  const stringValue = String(value)

  // If it's already wrapped in quotes, return as is
  if (/^['"].*['"]$/.test(stringValue)) {
    return stringValue
  }

  // Handle unicode and emoji characters
  const formattedValue = Array.from(stringValue)
    .map((char) => {
      const codePoint = char.codePointAt(0)
      if (!codePoint) return char

      // Convert emoji and special characters to unicode escape sequences
      // Control characters and non-ASCII characters need escaping
      if (codePoint > 127 || codePoint < 32) {
        return `\\${codePoint.toString(16).padStart(6, '0')}`
      }

      return char
    })
    .join('')

  // Wrap in single quotes if not already wrapped
  return `'${formattedValue}'`
}

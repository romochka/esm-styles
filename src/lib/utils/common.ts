/**
 * Utility functions for CSS processing
 */

/**
 * Determines the object type in a more precise way than typeof
 * @param obj - Any value to check type
 * @returns The lowercase string representing the object type
 */
export function getObjectType(obj: any): string {
  return (
    Object.prototype.toString
      .call(obj)
      .match(/^\[object (\w+)\]$/)?.[1]
      .toLowerCase() || 'unknown'
  )
}

/**
 * Checks if a value is a primitive end value (string, number, boolean, null)
 * @param value - Value to check
 * @returns True if the value is a primitive end value
 */
export function isEndValue(value: any): boolean {
  return ['string', 'number', 'boolean', 'null'].includes(getObjectType(value))
}

/**
 * Indents a string with spaces
 * @param str - String to indent
 * @param spaces - Number of spaces to indent with
 * @returns Indented string
 */
export function indent(str: string, spaces: number = 2): string {
  return str
    .split('\n')
    .map((s) => ' '.repeat(spaces) + s)
    .join('\n')
}

/**
 * Converts a JavaScript property name in camelCase to CSS kebab-case
 * @param key - Property name in camelCase
 * @returns Property name in kebab-case
 */
export function jsKeyToCssKey(key: string): string {
  // Keep vendor prefixes intact
  const prefix = key.match(/^[-]+/)?.[0] || ''
  const baseKey = key.replace(/^[-]+/, '')

  // Convert camelCase to kebab-case
  const kebabKey = baseKey.replace(/([A-Z])/g, '-$1').toLowerCase()

  return prefix + kebabKey
}

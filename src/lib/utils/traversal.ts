/**
 * Utility for traversing and transforming nested objects
 */

import { CssStyles, CssValue } from '../types/index.js'

/**
 * Type for node visitor functions
 */
export type NodeVisitor<T> = (
  node: any,
  path: string,
  root: any,
  index: number
) => T

/**
 * Traverses a nested object and applies a visitor function to each node
 * @param node - The object to traverse
 * @param visitor - Function to call for each node
 * @param path - Current path in the object (for tracking)
 * @param root - Root object (for reference)
 * @param index - Current index in array (if applicable)
 * @param separator - Path separator character
 * @returns The result of the visitor function on the current node
 */
export function traverseObject<T>(
  node: any,
  visitor: NodeVisitor<T>,
  path = '',
  root?: any,
  index = -1,
  separator = '\\'
): T {
  const realRoot = root || node

  // Handle arrays
  if (Array.isArray(node)) {
    const processedItems = node.map((item, idx) =>
      traverseObject(item, visitor, path, realRoot, idx, separator)
    )
    return visitor(processedItems, path, realRoot, index)
  }

  // Handle objects (but not null)
  if (node !== null && typeof node === 'object') {
    const processedObject = Object.keys(node).reduce<Record<string, any>>(
      (result, key) => {
        const newPath = path ? `${path}${separator}${key}` : key
        const processedValue = traverseObject(
          node[key],
          visitor,
          newPath,
          realRoot,
          index,
          separator
        )

        result[key] = processedValue
        return result
      },
      {}
    )

    return visitor(processedObject, path, realRoot, index)
  }

  // Handle primitive values
  return visitor(node, path, realRoot, index)
}

/**
 * Determines the type of a node in the CSS object
 * @param node - The node to check
 * @param path - Current path in the object
 * @returns The identified node type as a string
 */
export function determineNodeType(node: any, path?: string): string {
  if (!path) return 'unknown'

  const lastKey = path.split('\\').pop() || ''

  // Layer statement
  if (/^@layer/.test(lastKey) && typeof node === 'string') {
    return 'layer statement'
  }

  // Layer block
  if (/^@layer/.test(lastKey) && typeof node === 'object' && node !== null) {
    return 'layer block'
  }

  // Container query
  if (
    /^@container/.test(lastKey) &&
    typeof node === 'object' &&
    node !== null
  ) {
    return 'container query block'
  }

  // Media query or prefix
  if (/^@/.test(lastKey)) {
    return 'media query or prefix'
  }

  // CSS property-value pair (end value)
  if (isPrimitiveValue(node)) {
    return 'selector'
  }

  return 'unknown'
}

/**
 * Checks if a value is a primitive that can be used as a CSS property value
 * @param value - Value to check
 * @returns True if the value is a primitive
 */
function isPrimitiveValue(value: any): boolean {
  return (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}

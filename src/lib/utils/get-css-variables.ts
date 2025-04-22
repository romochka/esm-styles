import _ from 'lodash'

/**
 * Flattens a nested JS object into CSS variable declarations.
 * Example:
 *   { colors: { paper: { normal: '#212121' } } }
 *   => [ '--colors-paper-normal: #212121;' ]
 */
export function getCssVariables(
  obj: Record<string, any>,
  options: { prefix?: string } = {}
): string {
  const result: string[] = []

  function walk(current: any, path: string[] = []) {
    if (_.isPlainObject(current)) {
      for (const key in current) {
        walk(current[key], [...path, key])
      }
    } else {
      // Leaf value: build variable name
      const varName = '--' + path.map(k => k.replace(/_/g, '-')).join('-')
      result.push(`${varName}: ${current};`)
    }
  }

  walk(obj)
  return result.join('\n')
}

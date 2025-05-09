// Utility to convert a value to a CSS string, handling arrays, objects with 'var', and primitives

export function toCssValue(value: any): string {
  if (Array.isArray(value)) {
    // Join array parts, recursively converting each
    return value.map(toCssValue).join(' ')
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'var' in value &&
    typeof value.var === 'string'
  ) {
    return value.var
  }
  // For primitives (string, number), just return as string
  return String(value)
}

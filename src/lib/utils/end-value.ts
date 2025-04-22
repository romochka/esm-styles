// End value utility for getCss
import type { IsEndValue } from '../types/index.js'

export const isEndValue: IsEndValue = (value) => {
  if (value == null) return false
  if (typeof value === 'string' || typeof value === 'number') return true
  if (Array.isArray(value)) {
    return value.every((v) => typeof v === 'string' || typeof v === 'number')
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'var' in value &&
    typeof value.var === 'string'
  ) {
    return true
  }
  return false
}

// End value utility for getCss
import type { IsEndValue } from '../types/index.js'

export const isEndValue: IsEndValue = (value) => {
  if (value == null) return false
  if (typeof value === 'string' || typeof value === 'number') return true
  if (Array.isArray(value)) {
    return value.every((v) => typeof v === 'string' || typeof v === 'number')
  }
  return false
}

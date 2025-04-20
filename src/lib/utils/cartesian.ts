// Cartesian product utility for getCss
import type { CartesianProduct } from '../types/index.js'

export function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (!arrays.length) return []
  return arrays.reduce((a, b) => a.flatMap((d) => b.map((e) => [...d, e])), [
    [],
  ] as T[][])
}

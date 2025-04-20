// Key conversion utility for getCss
import type { JsKeyToCssKey } from '../types/index.js'

export const jsKeyToCssKey: JsKeyToCssKey = (key) => {
  // Convert camelCase or PascalCase to kebab-case
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

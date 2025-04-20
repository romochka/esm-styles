// CSS formatting utility for getCss
import type { PrettifyCssString } from '../types/index.js'

export const prettifyCssString: PrettifyCssString = (css) => {
  // Simple pretty-print: trim and collapse extra whitespace
  return css
    .replace(/\s+/g, ' ')
    .replace(/\s*{\s*/g, ' {\n  ')
    .replace(/;\s*/g, ';\n  ')
    .replace(/}\s*/g, '\n}\n')
    .trim()
}

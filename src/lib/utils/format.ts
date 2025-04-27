// CSS formatting utility for getCss
import beautify from 'js-beautify'

import type { PrettifyCssString } from '../types/index.js'

export const prettifyCssString: PrettifyCssString = (cssString) => {
  // Simple pretty-print: trim and collapse extra whitespace
  // return css
  //   .replace(/\s+/g, ' ')
  //   .replace(/\s*{\s*/g, ' {\n  ')
  //   .replace(/;\s*/g, ';\n  ')
  //   .replace(/}\s*/g, '\n}\n')
  //   .trim()

  return beautify.css(cssString, {
    indent_size: 2,
    end_with_newline: true,
  })
}

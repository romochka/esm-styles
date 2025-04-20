/**
 * esm-styles
 *
 * A library for working with CSS styles in ESM
 */

// Export types
export * from './lib/types/index.js'

// Main function export
export { default as getCss } from './lib/getCss.js'

// Utils exports for advanced usage
export { joinSelectors, cartesianSelectors } from './lib/utils/selectors.js'
export { formatContentValue } from './lib/utils/content.js'
export { jsKeyToCssKey, isEndValue } from './lib/utils/common.js'
export { processMediaQueries } from './lib/utils/media.js'
export { obj2css, prettifyCss } from './lib/utils/obj2css.js'

export function greet(): string {
  return 'esm-styles 0.1.3'
}

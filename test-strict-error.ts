import type { StrictCSSProperties } from './src/lib/types/styles.js'

// This should error - backgroundColr is not a valid CSS property
const testWithTypo: StrictCSSProperties = {
  display: 'flex',
  backgroundColr: 'red',  // ❌ typo!
}

export default testWithTypo

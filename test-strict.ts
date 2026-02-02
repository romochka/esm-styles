import type { StrictCSSProperties } from './src/lib/types/styles.js'

// Method 1: Explicit type annotation (catches excess properties)
const test1: StrictCSSProperties = {
  display: 'flex',
  // backgroundColr: 'red',  // ❌ Uncomment to see error!
}

// Method 2: satisfies operator (TS 4.9+)
const test2 = {
  display: 'flex',
  // backgroundColr: 'red',  // ❌ Uncomment to see error!
} satisfies StrictCSSProperties

export { test1, test2 }

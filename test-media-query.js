// Test file to verify media query nesting fix
import { getCss } from './dist/lib/getCss.js'

// Sample object based on the example in issue
const styleObject = {
  body: {
    margin: 0,
    padding: 0,
    fontFamily: 'sans-serif',
    header: {
      backgroundColor: '#333',
      color: 'white',
      padding: '1rem',
      '@media (max-width: 768px)': {
        color: 'yellow',
      },
    },
    '.container': {
      maxWidth: '1200px',
      margin: '0 auto',
      '@media (max-width: 768px)': {
        padding: '0 1rem',
      },
    },
  },
}

// Second test case from documentation example
const documentationExample = {
  p: {
    fontSize: '1rem',
    '@layer a': { fontWeight: 300 },

    '@media screen and (max-width: 768px)': {
      fontSize: `${14 / 16}rem`,
    },
  },

  ul: {
    marginBlock: '1em',

    '> li': {
      fontSize: '16px',

      '@media screen and (max-width: 768px)': {
        fontSize: '14px',
      },
    },

    '@layer a, b': '',

    '@dark': {
      fontSize: '14px',
    },
  },
}

// Convert to CSS and print results
console.log('Test Case 1 - Fixed Media Query Nesting:')
console.log(getCss(styleObject))

console.log('\n\nTest Case 2 - Documentation Example:')
console.log(getCss(documentationExample))

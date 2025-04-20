import { getCss } from './dist/index.js'

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

// Convert to CSS and print results
console.log('Test Case 1 - Fixed Media Query Nesting:')
console.log(getCss(styleObject))

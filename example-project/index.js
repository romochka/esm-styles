// Import functions from esm-styles
import { getCss, greet } from 'esm-styles'

// Test the greet function
console.log(greet())

// Create some sample styles
const styles = {
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

// Generate CSS from the styles object
const css = getCss(styles)

// Print the generated CSS
console.log('\nGenerated CSS:')
console.log(css)

# ESM Styles

A TypeScript library for converting JavaScript objects to CSS strings, allowing for a cleaner syntax when writing CSS-in-JS.

## Installation

```bash
npm install esm-styles
```

## Usage

### Basic Usage

```javascript
import { getCss } from 'esm-styles'

const styles = {
  body: {
    margin: 0,
    padding: 0,
    fontFamily: 'sans-serif',

    header: {
      backgroundColor: '#333',
      color: 'white',
      padding: '1rem',
    },

    'main, article': {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '1rem',
    },

    footer: {
      textAlign: 'center',
      padding: '1rem',
      backgroundColor: '#f5f5f5',
    },
  },
}

const css = getCss(styles)
console.log(css)
```

This will output CSS with nested selectors properly expanded:

```css
body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}

body header {
  background-color: #333;
  color: white;
  padding: 1rem;
}

body main,
body article {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

body footer {
  text-align: center;
  padding: 1rem;
  background-color: #f5f5f5;
}
```

### Advanced Features

#### Media Queries

```javascript
import { getCss } from 'esm-styles'

const styles = {
  body: {
    fontSize: '16px',

    '@media (max-width: 768px)': {
      fontSize: '14px',
    },
  },
}

const css = getCss(styles)
```

#### Named Media Queries

```javascript
import { getCss } from 'esm-styles'

const styles = {
  container: {
    width: '1200px',
    '@tablet': {
      width: '100%',
      padding: '0 20px',
    },
    '@mobile': {
      padding: '0 10px',
    },
  },
}

const mediaQueries = {
  tablet: '(max-width: 1024px)',
  mobile: '(max-width: 480px)',
}

const css = getCss(styles, mediaQueries)
```

#### Class and Tag Selectors

```javascript
import { getCss } from 'esm-styles'

const styles = {
  // Tag selector (div)
  div: {
    margin: '10px',

    // Nested tag selector (p inside div)
    p: {
      lineHeight: 1.5,
    },

    // Class selector (with underscore prefix)
    _highlight: {
      backgroundColor: 'yellow',
    },

    // Descendant class selector (with double underscore)
    __text: {
      color: 'blue',
    },
  },
}

const css = getCss(styles)
```

## License

MIT

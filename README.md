# ESM Styles

A CSS-in-JS solution for JavaScript/TypeScript projects.

## Features

- JavaScript to CSS conversion with an intuitive object syntax
- Build CSS from organized source files with a simple CLI
- CSS layering support for proper style encapsulation
- Media query and device/theme selectors with shorthands
- CSS variables with inheritance between themes
- Supporting modules for easy CSS variable usage

## Installation

```bash
npm install esm-styles
```

## Usage

### Basic Concept

ESM Styles lets you write CSS in JavaScript objects with a natural syntax that converts to proper CSS:

```js
// component.styles.mjs
export default {
  button: {
    backgroundColor: '#4285f4',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '4px',

    ':hover': {
      backgroundColor: '#3367d6',
    },

    '@media (max-width: 768px)': {
      padding: '8px 16px',
    },
  },
}
```

### CLI Usage

Build your styles by creating a configuration file and running the CLI:

```bash
npx build
```

Or specify a custom config:

```bash
npx build path/to/config.js
```

Watch for changes:

```bash
npx watch
```

### Configuration

Create a `esm-styles.config.js` in your project root (or use a custom path):

```js
export default {
  basePath: './src/styles',
  sourcePath: 'source',
  outputPath: 'css',
  sourceFilesSuffix: '.styles.mjs',

  // Input layers
  layers: ['defaults', 'components', 'layout'],

  // Output
  mainCssFile: 'styles.css',

  // Global variables
  globalVariables: 'global',
  globalRootSelector: ':root',

  // Media types and queries
  media: {
    theme: ['light', 'dark'],
    device: ['mobile', 'tablet', 'desktop'],
  },

  mediaSelectors: {
    theme: {
      light: [
        {
          selector: '.light',
        },
        {
          selector: '.auto',
          mediaQuery: 'screen and (prefers-color-scheme: light)',
          prefix: 'auto',
        },
      ],
      dark: [
        {
          selector: '.dark',
        },
        {
          selector: '.auto',
          mediaQuery: 'screen and (prefers-color-scheme: dark)',
          prefix: 'auto',
        },
      ],
    },
    // Device selectors
    device: {
      mobile: [
        {
          mediaQuery: 'screen and (max-width: 767px)',
        },
      ],
      tablet: [
        {
          mediaQuery: 'screen and (min-width: 768px) and (max-width: 1024px)',
        },
      ],
      desktop: [
        {
          mediaQuery: 'screen and (min-width: 1025px)',
        },
      ],
    },
  },

  // Media query shorthands
  mediaQueries: {
    mobile: '(max-width: 767px)',
    tablet: '(min-width: 768px) and (max-width: 1024px)',
    desktop: '(min-width: 1025px)',
  },
}
```

## JS to CSS Translation

### Basic Selectors

```js
{
  p: {
    fontSize: '16px',
    color: 'black',

    a: {
      color: 'blue'
    },

    strong: {
      fontWeight: 'bold'
    }
  }
}
```

Compiles to:

```css
p {
  font-size: 16px;
  color: black;
}

p a {
  color: blue;
}

p strong {
  font-weight: bold;
}
```

### Class Selectors

```js
{
  // Class selectors for non-HTML tag names
  header: {
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },

  // Class on HTML tag using underscore prefix
  p: {
    _highlight: {
      backgroundColor: 'yellow'
    }
  }
}
```

Compiles to:

```css
.header {
  background-color: #f5f5f5;
  padding: 20px;
}

p.highlight {
  background-color: yellow;
}
```

### Double Underscore for Descendant Class Selector

```js
{
  modal: {
    position: 'relative',

    __close: {
      position: 'absolute',
      top: '10px',
      right: '10px'
    }
  }
}
```

Compiles to:

```css
.modal {
  position: relative;
}

.modal .close {
  position: absolute;
  top: 10px;
  right: 10px;
}
```

### Multiple Selectors

```js
{
  'button, .btn': {
    padding: '10px 20px'
  },

  'input[type="text"], input[type="email"]': {
    borderRadius: '4px'
  }
}
```

### Nested Media Queries

```js
{
  card: {
    display: 'flex',

    '@media (max-width: 768px)': {
      flexDirection: 'column',

      '@media (orientation: portrait)': {
        padding: '10px'
      }
    }
  }
}
```

### Named Media Queries

```js
{
  main: {
    display: 'grid',

    '@mobile': {
      display: 'flex',
      flexDirection: 'column'
    },

    '@desktop': {
      gridTemplateColumns: 'repeat(3, 1fr)'
    }
  }
}
```

### Theme Support

```js
{
  card: {
    backgroundColor: 'white',
    color: 'black',

    '@dark': {
      backgroundColor: '#222',
      color: 'white'
    }
  }
}
```

### CSS Variables

Define variables in a global variables file:

```js
// global.styles.mjs
export default {
  colors: {
    primary: '#4285f4',
    secondary: '#34a853',
    error: '#ea4335',
  },
  spacing: {
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
}
```

Define theme-specific variables:

```js
// light.styles.mjs
export default {
  paper: {
    bright: '#ffffff',
    tinted: '#f0f0f0',
  },
  ink: {
    bright: '#000000',
    faded: '#333333',
    accent: '#ff0000',
  },
}
```

```js
// dark.styles.mjs
export default {
  paper: {
    bright: '#000000',
    tinted: '#323232',
  },
  ink: {
    bright: '#ffffff',
    faded: '#b3b3b3',
  },
}
```

Use with supporting modules:

```js
// component.styles.mjs
import $theme from './$theme.mjs'

export default {
  button: {
    backgroundColor: $theme.paper.bright,
    color: $theme.ink.bright,
    padding: '10px 20px',
  },
}
```

## Advanced Features

### Layering

Organize your styles in layers for better control over specificity:

```js
// defaults.styles.mjs, components.styles.mjs, layout.styles.mjs
```

The build process wraps each in an appropriate layer and generates a main CSS file with proper import order.

### CSS Variable Inheritance

Missing variables in one theme automatically inherit from the previous theme in the configuration.

## Additional documentation

For humans: [doc/usage-guide.md](doc/usage-guide.md)

For AI assistants: [doc/ai-guide.md](doc/ai-guide.md)

API reference: [doc/api-reference.md](doc/api-reference.md)

## License

MIT

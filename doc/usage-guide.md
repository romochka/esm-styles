# ESM Styles Usage Guide

This guide explains how to use ESM Styles to create and manage your CSS styles using JavaScript/TypeScript.

## Table of Contents

- [Basic Concepts](#basic-concepts)
- [CLI Usage](#cli-usage)
- [Configuration](#configuration)
- [JS to CSS Translation Rules](#js-to-css-translation-rules)
- [Layers](#layers)
- [Media Queries](#media-queries)
- [CSS Variables](#css-variables)
- [Supporting Modules](#supporting-modules)

## Basic Concepts

ESM Styles allows you to write CSS using JavaScript objects with an intuitive nested syntax. The main benefits are:

- Composition with JavaScript functions
- JS tooling and editor support
- Dynamic generation of styles
- Modular organization of styles

You write styles as objects with nested selectors, and the library converts them to valid CSS:

```js
// component.styles.mjs
export default {
  button: {
    backgroundColor: '#4285f4',
    color: 'white',
    padding: '10px 20px',

    ':hover': {
      backgroundColor: '#3367d6',
    },
  },
}
```

## CLI Usage

Once you've installed ESM Styles, you can use the CLI to build your styles:

```bash
# Using default esm-styles.config.js in the current directory
npx esm-styles build

# Using a custom config file
npx esm-styles build path/to/config.js
```

The CLI will:

1. Read your configuration file
2. Process each layer file
3. Convert styles to CSS
4. Generate theme/device variable files
5. Create supporting modules
6. Output all files to the specified output directory

## Configuration

The configuration file is where you define your style structure, paths, media queries, and themes.

```js
// esm-styles.config.js
export default {
  // Base paths
  basePath: './src/styles',
  sourcePath: 'source',
  outputPath: 'css',
  sourceFilesSuffix: '.styles.mjs',

  // Input layers - order matters
  layers: ['defaults', 'components', 'layout'],

  // Output
  mainCssFile: 'styles.css',

  // CSS Variables configuration
  globalVariables: 'global',
  globalRootSelector: ':root',

  // Media types and their variable sets
  media: {
    theme: ['light', 'dark'],
    device: ['mobile', 'tablet', 'desktop'],
  },

  // Selectors/media queries for each media type
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
    device: {
      mobile: [
        {
          mediaQuery: 'screen and (max-width: 767px)',
        },
      ],
      // Additional device selectors...
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

### Configuration Properties

| Property             | Description                                                               |
| -------------------- | ------------------------------------------------------------------------- |
| `basePath`           | Base directory for all styles, relative to where the build command is run |
| `sourcePath`         | Directory inside `basePath` containing source style files                 |
| `outputPath`         | Directory inside `basePath` where output CSS files will be written        |
| `sourceFilesSuffix`  | Suffix for source style files (default: `.styles.mjs`)                    |
| `layers`             | Array of layer names, defining the order of CSS specificity               |
| `mainCssFile`        | Name of the output CSS file that imports all layer and variable files     |
| `globalVariables`    | Name of the file containing global CSS variables                          |
| `globalRootSelector` | Root selector for CSS variables (default: `:root`)                        |
| `media`              | Object defining media types and their variable sets                       |
| `mediaSelectors`     | Configuration for applying media types with selectors/queries             |
| `mediaQueries`       | Object defining shorthand names for media queries                         |

## JS to CSS Translation Rules

ESM Styles converts JavaScript objects to CSS following these rules:

### T1: Properties vs Selectors

Object keys that contain another object become CSS selectors, while keys with primitive values become CSS properties:

```js
{
  p: {
    fontSize: '16px',  // CSS property
    color: 'black',    // CSS property

    a: {              // Nested selector
      color: 'blue'
    }
  }
}
```

Property names are automatically converted from camelCase to kebab-case.

### T2: HTML Tag Selectors

HTML tag names are recognized and become tag selectors:

```js
{
  div: {
    margin: '10px',

    p: {
      lineHeight: 1.5,
    }
  }
}
```

Becomes:

```css
div {
  margin: 10px;
}

div p {
  line-height: 1.5;
}
```

### T3: Class Selectors

Keys with non-primitive values that aren't recognized as HTML tags become class selectors:

```js
{
  card: {
    backgroundColor: 'white',
    borderRadius: '4px'
  }
}
```

Becomes:

```css
.card {
  background-color: white;
  border-radius: 4px;
}
```

### T4: Special Selectors

You can use pseudo-classes, IDs, and attribute selectors directly:

```js
{
  a: {
    color: 'blue',

    ':hover': {
      color: 'red'
    },

    '#main': {
      fontWeight: 'bold'
    },

    '[target="_blank"]': {
      textDecoration: 'underline'
    }
  }
}
```

### T5: Underscore for Class Names

Use a single underscore prefix to force a class selector when the name matches an HTML tag:

```js
{
  div: {
    _button: {  // Creates div.button
      padding: '10px'
    },

    button: {   // Creates div button
      margin: '5px'
    }
  }
}
```

### T6: Double Underscore for Any Level Descendants

Use double underscore to create a descendant selector that can match at any nesting level:

```js
{
  card: {
    position: 'relative',

    __close: {  // Creates .card .close
      position: 'absolute',
      top: '10px',
      right: '10px'
    }
  }
}
```

### T7: Complex Selectors

You can use complex selectors directly as keys:

```js
{
  ul: {
    '> li:not(:last-child)': {
      borderBottom: '1px solid #eee'
    }
  }
}
```

### T8: Comma-Separated Selectors

Use commas to target multiple selectors:

```js
{
  'button, .btn': {
    padding: '10px 20px'
  }
}
```

### T9: Content Property

For the `content` property, use JavaScript unicode notation for special characters:

```js
{
  '::before': {
    content: '\u2022',  // Bullet character
  }
}
```

## Layers

CSS layers help manage specificity and provide better organization of styles. ESM Styles supports @layer directives:

```js
{
  p: {
    color: 'black',

    '@layer typography': {
      fontFamily: 'sans-serif',
      lineHeight: 1.5
    }
  }
}
```

Your configuration can define multiple layer files that will be automatically wrapped in their respective layer directives:

```js
// defaults.styles.mjs
export default {
  // Base styles
}

// components.styles.mjs
export default {
  // Component styles
}

// layout.styles.mjs
export default {
  // Layout styles
}
```

The build process generates:

```css
@layer defaults, components, layout;

@layer defaults {
  /* defaults.css content */
}

@layer components {
  /* components.css content */
}

@layer layout {
  /* layout.css content */
}
```

## Media Queries

### Standard Media Queries

You can use standard media queries directly in your styles:

```js
{
  container: {
    maxWidth: '1200px',

    '@media (max-width: 768px)': {
      maxWidth: '100%',
      padding: '0 20px'
    }
  }
}
```

### Nested Media Queries

Media queries can be nested for more specific targeting:

```js
{
  card: {
    '@media (max-width: 768px)': {
      padding: '10px',

      '@media (orientation: portrait)': {
        marginBottom: '20px'
      }
    }
  }
}
```

### Media Query Shorthands

Use named media query shorthands for better readability:

```js
{
  section: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',

    '@mobile': {
      display: 'block'
    },

    '@tablet': {
      gridTemplateColumns: 'repeat(2, 1fr)'
    }
  }
}
```

### Theme and Device Selectors

Use named selectors defined in `mediaSelectors` configuration:

```js
{
  button: {
    backgroundColor: 'white',
    color: 'black',

    '@dark': {
      backgroundColor: '#222',
      color: 'white'
    }
  }
}
```

This will generate appropriate selectors based on your config, including automatic handling of prefers-color-scheme media queries.

## CSS Variables

ESM Styles provides a powerful system for managing CSS variables across themes and devices.

### Global Variables

Define global variables that remain consistent across all themes:

```js
// global.styles.mjs
export default {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
  },
}
```

### Theme Variables

Define theme-specific variables that change depending on the active theme:

```js
// light.styles.mjs
export default {
  colors: {
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#111111',
    primary: '#4285f4'
  }
}

// dark.styles.mjs
export default {
  colors: {
    background: '#121212',
    surface: '#222222',
    text: '#ffffff',
    primary: '#5c9eff'
  }
}
```

### Variable Inheritance

Variables defined in one theme automatically inherit from previous themes if not explicitly defined:

```js
// In your config: theme: ['light', 'twilight', 'dark']

// light.styles.mjs
export default {
  colors: {
    primary: '#4285f4',
    secondary: '#34a853',
    accent: '#ea4335'
  }
}

// twilight.styles.mjs
export default {
  colors: {
    primary: '#5c9eff',
    // secondary will be inherited
    accent: '#ff7e75'
  }
}

// dark.styles.mjs
export default {
  colors: {
    primary: '#8ab4ff',
    secondary: '#66c385'
    // accent will be inherited from twilight
  }
}
```

## Supporting Modules

ESM Styles generates supporting modules for each media type to provide convenient access to CSS variables:

### Theme Module

The build process automatically generates modules like `$theme.mjs`:

```js
// $theme.mjs (generated)
export default {
  colors: {
    background: {
      var: '--colors-background',
      light: '#ffffff',
      dark: '#121212',
    },
    surface: {
      var: '--colors-surface',
      light: '#f5f5f5',
      dark: '#222222',
    },
    // More variables...
  },
}
```

### Using Supporting Modules

Import and use supporting modules in your style files:

```js
// components.styles.mjs
import $theme from './$theme.mjs'

export default {
  button: {
    backgroundColor: $theme.colors.primary,
    color: $theme.colors.background,
    padding: '10px 20px',
    borderRadius: '4px',
  },
}
```

This gets compiled to:

```css
button {
  background-color: var(--colors-primary);
  color: var(--colors-background);
  padding: 10px 20px;
  border-radius: 4px;
}
```

The supporting modules provide:

- Autocomplete for available variables in most code editors
- The ability to see the actual values for each theme

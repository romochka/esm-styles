# ESM Styles Configuration Reference

Complete guide to `esm-styles.config.js`.

## Table of Contents

- [Basic Configuration](#basic-configuration)
- [Paths](#paths)
- [Import Aliases](#import-aliases)
- [Floors](#floors)
- [CSS Variables](#css-variables)
- [Media Configuration](#media-configuration)
- [CLI Usage](#cli-usage)

## Basic Configuration

```js
// esm-styles.config.js
export default {
  // Paths
  basePath: './src/styles',
  sourcePath: 'source',
  outputPath: 'css',
  sourceFilesSuffix: '.styles.mjs',

  // Input
  floors: [
    { source: 'defaults', layer: 'defaults' },
    { source: 'components', layer: 'components' },
    { source: 'layout', layer: 'layout' },
  ],

  // Output
  mainCssFile: 'styles.css',
  importFloors: ['defaults', 'components', 'layout'],

  // Variables
  globalVariables: 'global',
  globalRootSelector: ':root',

  // Media
  media: {
    theme: ['light', 'dark'],
    device: ['mobile', 'tablet', 'desktop'],
  },

  mediaSelectors: { /* ... */ },
  mediaQueries: { /* ... */ },
}
```

## Paths

| Property | Description |
|----------|-------------|
| `basePath` | Base directory for styles, relative to build command location |
| `sourcePath` | Source directory inside `basePath` |
| `outputPath` | Output directory inside `basePath` |
| `sourceFilesSuffix` | Suffix for source files (default: `.styles.mjs`) |

Example structure:
```
src/styles/           ← basePath
├── source/           ← sourcePath
│   ├── defaults.styles.mjs
│   ├── components.styles.mjs
│   └── layout.styles.mjs
└── css/              ← outputPath
    ├── styles.css
    ├── defaults.css
    ├── components.css
    └── layout.css
```

## Import Aliases

Simplify imports in your style files by configuring path aliases:

```js
aliases: {
  '@': '.',                    // @ resolves to sourcePath
  '@components': './components',
  '@shared': '../shared',
}
```

| Property | Description |
|----------|-------------|
| `aliases` | Object mapping alias prefixes to paths (optional) |

Alias paths are resolved relative to the `sourcePath` directory.

### Usage example

```js
// Before (relative paths)
import $theme from '../../$theme.mjs'
import { button } from '../components/button.styles.mjs'

// After (with aliases)
import $theme from '@/$theme.mjs'
import { button } from '@components/button.styles.mjs'
```

### How it works

When aliases are configured, the build process uses esbuild to resolve imports before loading each style file. This adds minimal overhead but provides familiar path resolution similar to other build tools.

Without aliases configured, files are imported directly using Node.js native ESM resolution.

### IDE support

To enable Cmd+click navigation and IntelliSense for aliased imports in VSCode/Cursor, create a `jsconfig.json` in your styles source directory:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["./components/*"]
    }
  }
}
```

The `paths` entries should match your `aliases` configuration.

## Floors

Floors define how source files are processed and organized:

```js
floors: [
  { source: 'defaults', layer: 'defaults' },     // wrap in @layer defaults
  { source: 'components', layer: 'components' }, // wrap in @layer components
  { source: 'layout', layer: 'layout' },         // wrap in @layer layout
  { source: 'utilities' },                       // no layer wrapper
  { source: 'special', outputPath: 'alt' },      // custom output path
  { source: 'minified', minify: true },          // minify output
]
```

### Floor properties

| Property | Description |
|----------|-------------|
| `source` | Source file name without suffix (required) |
| `layer` | CSS layer name to wrap styles in (optional) |
| `outputPath` | Custom output directory (optional) |
| `minify` | Minify CSS output (optional) |

### importFloors

Control which floors are included in main CSS:

```js
importFloors: ['defaults', 'components', 'layout']
```

Generated `styles.css`:
```css
@layer defaults, components, layout;

@import url('./defaults.css');
@import url('./components.css');
@import url('./layout.css');
```

## CSS Variables

### Global variables

```js
globalVariables: 'global',      // file: global.styles.mjs
globalRootSelector: ':root',    // selector for variables
```

`global.styles.mjs`:
```js
export default {
  spacing: {
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
  radius: {
    sm: '4px',
    md: '8px',
  }
}
```

### Theme variables

Defined per theme:

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
  }
}

// dark.styles.mjs
export default {
  paper: {
    bright: '#000000',
    tinted: '#323232',
  },
  ink: {
    bright: '#ffffff',
    faded: '#b3b3b3',
  }
}
```

### Variable inheritance

Missing variables inherit from previous theme in the list:

```js
media: { theme: ['light', 'twilight', 'dark'] }
```

If `twilight.styles.mjs` doesn't define `ink.accent`, it inherits from `light`.

### Generated $theme module

Build process generates `$theme.mjs`:

```js
export default {
  paper: {
    bright: {
      var: 'var(--paper-bright)',
      name: '--paper-bright',
      light: '#ffffff',
      dark: '#000000'
    }
  }
}
```

## Media Configuration

### media

Define media types and their variable sets:

```js
media: {
  theme: ['light', 'dark'],
  device: ['mobile', 'tablet', 'desktop'],
}
```

### mediaSelectors

Configure how each media type applies:

```js
mediaSelectors: {
  theme: {
    light: [
      { selector: '.light' },
      {
        selector: '.auto',
        mediaQuery: 'screen and (prefers-color-scheme: light)',
        prefix: 'auto'
      }
    ],
    dark: [
      { selector: '.dark' },
      {
        selector: '.auto',
        mediaQuery: 'screen and (prefers-color-scheme: dark)',
        prefix: 'auto'
      }
    ]
  },
  device: {
    mobile: [
      { mediaQuery: 'screen and (max-width: 767px)' }
    ],
    tablet: [
      { mediaQuery: 'screen and (min-width: 768px) and (max-width: 1024px)' }
    ],
    desktop: [
      { mediaQuery: 'screen and (min-width: 1025px)' }
    ]
  }
}
```

### mediaQueries

Define shorthand names for media queries:

```js
mediaQueries: {
  'mobile': '(max-width: 767px)',
  'min-tablet': '(min-width: 768px)',
  'max-tablet': '(max-width: 1024px)',
  'desktop': '(min-width: 1025px)',
  'hover': '(hover: hover)',
  'reduced-motion': '(prefers-reduced-motion: reduce)',
}
```

Usage in styles:
```js
{
  button: {
    '@mobile': { padding: '8px' },
    '@hover': { opacity: 0.9 }
  }
}
```

## CLI Usage

### Build

```bash
# Default config (esm-styles.config.js)
npx esm-styles build

# Custom config
npx esm-styles build path/to/config.js
```

### Watch

```bash
npx esm-styles watch
npx esm-styles watch path/to/config.js
```

### Timestamp file

Optional timestamp for cache busting / HMR:

```js
timestamp: {
  outputPath: 'source',  // default: basePath
  extension: 'ts'        // default: 'mjs'
}
```

Generates `timestamp.ts`:
```js
export default 1767867956228
```

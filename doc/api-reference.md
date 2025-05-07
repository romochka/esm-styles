# ESM Styles API Reference

This document provides a comprehensive overview of the API for ESM Styles, detailing the core functionality and configuration options.

## Table of Contents

- [Core API](#core-api)
  - [getCss](#getcss)
- [Configuration](#configuration)
  - [Configuration Object](#configuration-object)
  - [Media Selectors](#media-selectors)
  - [Media Queries](#media-queries)
- [CLI Commands](#cli-commands)
  - [build](#build)

## Core API

### getCss

```typescript
function getCss(styles: CssJsObject, options?: GetCssOptions): CssString
```

The main function that converts a JavaScript/TypeScript object into a CSS string.

#### Parameters

- `styles`: A JavaScript object representing CSS styles.
- `options`: (Optional) Configuration options for CSS generation.

#### Returns

A string containing the generated CSS.

#### Example

```javascript
import { getCss } from 'esm-styles'

const styles = {
  button: {
    backgroundColor: '#4285f4',
    color: 'white',
    padding: '10px 20px',

    ':hover': {
      backgroundColor: '#3367d6',
    },
  },
}

const css = getCss(styles)
console.log(css)
// Outputs: button { background-color: #4285f4; color: white; padding: 10px 20px; } button:hover { background-color: #3367d6; }
```

### Types

#### CssJsObject

```typescript
type CssJsObject = {
  [key: string]:
    | CssJsObject
    | string
    | number
    | boolean
    | null
    | undefined
    | { var: string }
}
```

Represents a JavaScript object structure that can be converted to CSS.

#### GetCssOptions

```typescript
interface GetCssOptions {
  globalRootSelector?: string
  mediaQueries?: Record<string, string>
  selectorShorthands?: Record<
    string,
    Array<{
      selector?: string
      mediaQuery?: string
    }>
  >
}
```

Configuration options for the CSS generation process:

- `globalRootSelector`: Root selector for variables (default: ':root')
- `mediaQueries`: Map of named media query shorthands
- `selectorShorthands`: Map of named selector shorthands

#### CssString

```typescript
type CssString = string
```

A string containing valid CSS.

#### CssRuleObject

```typescript
interface CssRuleObject {
  [key: string]: string | number
}
```

Represents a set of CSS property declarations.

## Configuration

### Configuration Object

The `esm-styles.config.js` file exports a configuration object with the following structure:

```typescript
interface ESMStylesConfig {
  // Paths
  basePath: string
  sourcePath: string
  outputPath: string
  sourceFilesSuffix?: string

  // Input
  layers: string[]

  // Output
  mainCssFile: string

  // Variables
  globalVariables?: string
  globalRootSelector?: string

  // Media
  media?: Record<string, string[]>
  mediaSelectors?: Record<string, Record<string, Array<MediaSelectorConfig>>>
  mediaQueries?: Record<string, string>
}
```

#### Properties

| Property             | Type     | Description                   | Default       |
| -------------------- | -------- | ----------------------------- | ------------- |
| `basePath`           | string   | Base directory for styles     | -             |
| `sourcePath`         | string   | Source files directory        | -             |
| `outputPath`         | string   | Output CSS directory          | -             |
| `sourceFilesSuffix`  | string   | Suffix for source files       | '.styles.mjs' |
| `layers`             | string[] | Array of layer names          | -             |
| `mainCssFile`        | string   | Output CSS file name          | -             |
| `globalVariables`    | string   | Global variables file name    | -             |
| `globalRootSelector` | string   | Root selector for variables   | ':root'       |
| `media`              | object   | Media types and variables     | -             |
| `mediaSelectors`     | object   | Media selector configurations | -             |
| `mediaQueries`       | object   | Named media query shorthands  | -             |

### Media Selectors

The `mediaSelectors` configuration defines how variables should be applied in different contexts:

```typescript
interface MediaSelectorConfig {
  selector?: string
  mediaQuery?: string
  prefix?: string
}
```

#### Properties

| Property     | Type   | Description                             |
| ------------ | ------ | --------------------------------------- |
| `selector`   | string | CSS selector to append to root selector |
| `mediaQuery` | string | Media query for conditional application |
| `prefix`     | string | Prefix for generated CSS file names     |

#### Example

```javascript
mediaSelectors: {
  theme: {
    dark: [
      // Applied when .dark class is present
      {
        selector: '.dark',
      },
      // Applied in dark mode when .auto class is present
      {
        selector: '.auto',
        mediaQuery: 'screen and (prefers-color-scheme: dark)',
        prefix: 'auto',
      },
    ]
  }
}
```

### Media Queries

The `mediaQueries` configuration provides shorthands for commonly used media queries:

```javascript
mediaQueries: {
  'mobile': '(max-width: 767px)',
  'tablet': '(min-width: 768px) and (max-width: 1024px)',
  'desktop': '(min-width: 1025px)'
}
```

These shorthands can be used directly in style objects:

```javascript
{
  container: {
    maxWidth: '1200px',

    '@mobile': {
      maxWidth: '100%',
      padding: '0 16px'
    }
  }
}
```

## CLI Commands

### build

```
npx esm-styles build [configPath]
```

Builds CSS files from JavaScript/TypeScript source files according to the configuration.

#### Parameters

- `configPath`: (Optional) Path to the configuration file. Defaults to `esm-styles.config.js` in the current directory.

#### Process

1. Loads the configuration file
2. Processes each layer file
3. Converts styles to CSS
4. Generates theme/device variable files
5. Creates supporting modules
6. Outputs all files to the specified directory

#### Example

```bash
# Use default config
npx esm-styles build

# Use custom config
npx esm-styles build ./configs/my-esm-styles.config.js
```

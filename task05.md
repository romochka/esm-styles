# Task 5 (completed)

Introduce supporting modules for CSS variables.

## Why

Supporting modules needed to make it easier to use CSS variables in source styles.

````js
import "./$theme.mjs"

export default {
  p: {
    color: $theme.ink.bright,
  }
}

It gives two benefits: autocompletion and posibility to quickly check values of the variable.

In the compile stage the values stored in the supporting modules will be replaced with variable names:

```css
p {
  color: var(--ink-bright);
}
````

## Modules

(config for reference: [./sample.config.js](./sample.config.js))

For each media type defined in `media` parameter module is generated in `basePath/sourcePath` directory.

Each module's file name should start with dollar sign `$` and have `.mjs` extension without additional suffix:

`$device.mjs`

`$theme.mjs`

Each module should default export an object that repeats the structure of the variables object (after applying inheritance as described in the [task 3](./task03.md) section "The inheritance of variables").

Each end value should be a special object with property `var` equals to CSS variable name, and all possible values for this variable under keys named after the variable sets of this media type.

Example:

`$theme.mjs` based on `theme: ['light', 'twilight', 'dark']` and files in `sample-styles/source` directory:

```js
export default {
  paper: {
    bright: {
      var: '--paper-bright',
      light: '#ffffff', // from light.styles.mjs
      twilight: '#dfdfdf', // from twilight.styles.mjs
      dark: '#000000', // from dark.styles.mjs
    },
    ...
  },
  ink: {
    ...
    accent: {
      var: '--ink-accent',
      light: '#ff0000', // from light.styles.mjs
      twilight: '#ff0000', // from twilight.styles.mjs after inheritance from light.styles.mjs
      dark: '#ff0000', // from dark.styles.mjs after inheritance from twilight.styles.mjs
    }
  }
}
```

## Build process changes

1. Object with `var` property must be recognized as end value. [utils/end-value.ts](./src/lib/utils/end-value.ts)
2. In the build process where end value is being attached to css [flatWalk](./src/lib/index.ts) this object must be replaced with its `var` value wrapped in `var(...)` string.

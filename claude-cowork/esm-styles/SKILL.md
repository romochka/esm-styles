---
name: esm-styles
description: |
  CSS-in-JS compiler that converts JavaScript objects to CSS. Use when:
  (1) User mentions "esm-styles" explicitly
  (2) Working with .styles.mjs files
  (3) Project has esm-styles.config.js
  CRITICAL: This is NOT Tailwind/SCSS - no utility classes, no & ampersand syntax.
---

# ESM Styles

Write CSS as JavaScript objects. The compiler converts JS → CSS.

## Critical Rules

### NO Ampersand (&) Syntax

```js
// ❌ WRONG - will NOT work
button: {
  '&:hover': { opacity: 0.9 },
  '&.active': { color: 'red' }
}

// ✅ CORRECT
button: {
  ':hover': { opacity: 0.9 },
  active: { color: 'red' }
}
```

### HTML Tags vs Classes

Tags are recognized automatically. Non-tags become classes:

```js
{
  div: { margin: 0 },        // → div { margin: 0; }
  p: { fontSize: '16px' },   // → p { font-size: 16px; }
  card: { padding: '20px' }  // → .card { padding: 20px; }
}
```

### camelCase → kebab-case

Class names in camelCase are converted to kebab-case in CSS output:

```js
{ __sideContent: { ... } }  // → .side-content in CSS
```

```jsx
// In JSX, use kebab-case to match:
<div className="side-content">  // ✅ correct
<div className="sideContent">   // ❌ won't match
```

**Exception:** PascalCase names (starting with uppercase) are preserved as-is.

### Underscore Conventions

```js
{
  modal: {
    _button: { ... },   // → .modal.button (single _ = class with tag name)
    __close: { ... }    // → .modal .close (double __ = descendant class)
  }
}
```

### State Modifiers with Descendants

Nest state modifiers inside the parent component. Do NOT create separate exports for states:

```js
// ❌ WRONG - creates separate .Panel and .PanelOpen selectors
export const Panel = { ... }
export const PanelOpen = {
  __content: { ... }  // → .PanelOpen .content (wrong!)
}

// ✅ CORRECT - creates .Panel.open .content
export const Panel = {
  __content: { opacity: 0 },

  open: {                    // → .Panel.open
    __content: { opacity: 1 }  // → .Panel.open .content
  }
}
```

### Pseudo-classes and Selectors

```js
{
  button: {
    ':hover': { opacity: 0.9 },
    '::before': { content: '"→"' },
    '> span': { marginLeft: '5px' },
    '[disabled]': { cursor: 'not-allowed' }
  }
}
```

### Media Queries

```js
{
  container: {
    maxWidth: '1200px',
    '@mobile': { maxWidth: '100%' },      // named query from config
    '@dark': { backgroundColor: '#222' }  // theme selector
  }
}
```

### CSS Variables

For each key in `media` config, a helper module `$<key>.mjs` is generated:

```js
// media: { theme: [...], device: [...] } → $theme.mjs, $device.mjs

import $theme from './$theme.mjs'
import $device from './$device.mjs'

export default {
  button: {
    backgroundColor: $theme.paper.bright,
    padding: $device.spacing.md,
    // For concatenation, use .var:
    border: `1px solid ${$theme.paper.tinted.var}`
  }
}
```

These modules give IDE autocomplete and show values. Without them → manual `var(--name)`.

## Limitations

### No @keyframes support

Create a separate `animations.css` file, import globally, use animation names in styles:

```css
/* animations.css */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

```js
// component.styles.mjs
export const Modal = {
  animation: 'fadeIn 0.3s ease-out'
}
```

### Import Aliases

Path aliases can be configured in `esm-styles.config.js` (see `sample.config.js` in repo root):

```js
aliases: {
  '@': '.',
  '@components': './components',
}
```

For IDE support (autocomplete, Cmd+click), add `jsconfig.json` to `sourcePath` folder (see `sample-styles/source/jsconfig.json`):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  }
}
```

## Project Conventions

### Component Styles (PascalCase)

```js
// styles/components/message.styles.mjs
export const Message = {
  width: '90vw',
  urgent: { backgroundColor: 'red' },

  header: {
    fontSize: '1.2rem'
  }
}
```

```jsx
// In React component
<article className="Message urgent">...</article>
```

### Layout Styles

```js
// styles/layout.styles.mjs
export const layout = {
  home: { display: 'grid' },
  inner: { maxWidth: '1200px' }
}
```

```jsx
<div className="layout home">...</div>
```

## Build

Before running build commands, ask the user:
- "Is `npx watch` already running?"

If yes → styles compile automatically on save, no action needed.
If no → run `npx build` from the esm-styles package folder.

**Note:** Commands run from the folder where esm-styles is installed (e.g. `packages/styles`).

## References

- **Compiler rules**: See [references/compiler.md](references/compiler.md) for complete JS→CSS translation
- **Configuration**: See [references/config.md](references/config.md) for esm-styles.config.js
- **Project structure & best practices**: See [references/conventions.md](references/conventions.md) for file organization, semantic HTML, naming

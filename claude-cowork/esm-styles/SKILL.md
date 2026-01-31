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

### Underscore Conventions

```js
{
  modal: {
    _button: { ... },   // → .modal.button (single _ = class with tag name)
    __close: { ... }    // → .modal .close (double __ = descendant class)
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

```js
import $theme from './$theme.mjs'

export default {
  button: {
    backgroundColor: $theme.paper.bright,
    // For concatenation, use .var:
    border: `1px solid ${$theme.paper.tinted.var}`
  }
}
```

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

### Relative imports only

No path aliases. Use relative paths:

```js
// ❌ No aliases
import $theme from '@styles/$theme.mjs'

// ✅ Relative paths only
import $theme from '../../$theme.mjs'
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
- "Is `npx esm-styles watch` already running?"

If yes → styles compile automatically on save, no action needed.
If no → run `npx esm-styles build` when needed.

## References

- **Compiler rules**: See [references/compiler.md](references/compiler.md) for complete JS→CSS translation
- **Configuration**: See [references/config.md](references/config.md) for esm-styles.config.js
- **Project structure**: See [references/conventions.md](references/conventions.md) for file organization

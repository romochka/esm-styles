# ESM Styles Compiler Reference

Complete JS → CSS translation rules.

## Table of Contents

- [Properties vs Selectors](#properties-vs-selectors)
- [HTML Tags vs Classes](#html-tags-vs-classes)
- [Nesting](#nesting)
- [Underscore Conventions](#underscore-conventions)
- [Special Selectors](#special-selectors)
- [Complex Selectors](#complex-selectors)
- [Media Queries](#media-queries)
- [CSS Layers](#css-layers)
- [CSS Variables](#css-variables)
- [Naming Conventions](#naming-conventions)

## Properties vs Selectors

Keys with objects → selectors. Keys with primitives → properties:

```js
{
  p: {
    fontSize: '16px',  // property (camelCase → kebab-case)
    color: 'black',    // property

    a: {               // nested selector
      color: 'blue'
    }
  }
}
```

Output:
```css
p { font-size: 16px; color: black; }
p a { color: blue; }
```

## HTML Tags vs Classes

Recognized HTML tags become tag selectors. Everything else becomes class selectors:

```js
{
  div: { margin: 0 },           // → div { margin: 0; }
  p: { fontSize: '16px' },      // → p { font-size: 16px; }

  card: { padding: '20px' },    // → .card { padding: 20px; }
  heading: { display: 'flex' }  // → .heading { display: flex; }
}
```

Nesting combines:
```js
{
  p: {
    warning: { color: 'red' }   // → p.warning { color: red; }
  }
}
```

## Nesting

```js
{
  nav: {
    backgroundColor: '#333',

    ul: {
      display: 'flex',

      li: {
        margin: '0 10px',

        a: { color: 'white' }
      }
    }
  }
}
```

Output:
```css
nav { background-color: #333; }
nav ul { display: flex; }
nav ul li { margin: 0 10px; }
nav ul li a { color: white; }
```

## Underscore Conventions

### Single underscore: force class for tag name

```js
{
  div: {
    video: { width: '100%' },    // → div video { width: 100%; }
    _video: { padding: '10px' }  // → div.video { padding: 10px; }
  }
}
```

### Double underscore: descendant class selector

```js
{
  modal: {
    position: 'relative',

    __close: {                   // → .modal .close { ... }
      position: 'absolute',
      top: '10px',
      right: '10px'
    }
  }
}
```

Double underscore always means class, never tag.

## Special Selectors

### Pseudo-classes and pseudo-elements

```js
{
  a: {
    color: 'blue',
    ':hover': { color: 'red' },
    ':visited': { color: 'purple' }
  },

  button: {
    '::before': { content: '"→"' },
    '::after': { content: '' }       // empty content - compiler adds quotes
  }
}
```

### Attribute selectors

```js
{
  input: {
    '[type="text"]': {
      padding: '8px',

      '::placeholder': { color: 'gray' }
    },
    '[disabled]': { cursor: 'not-allowed' }
  }
}
```

### ID selectors

```js
{
  input: {
    '#main-input': { fontWeight: 'bold' }
  }
}
```

### Child and sibling combinators

```js
{
  button: {
    '> span': { marginLeft: '5px' },
    '+ p': { color: 'green' },
    '~ p': { color: 'purple' }
  }
}
```

## Complex Selectors

### Complex selector as key

```js
{
  ul: {
    '> li:not(:last-child) > img': {
      filter: 'grayscale(100%)'
    }
  }
}
// → ul > li:not(:last-child) > img { filter: grayscale(100%); }
```

### Comma-separated selectors

```js
{
  'button, .btn': {
    padding: '10px 20px'
  },

  'input[type="text"], input[type="email"]': {
    borderRadius: '4px'
  },

  body: {
    'main, aside': {
      'input, textarea, button': {
        outline: 'none'
      }
    }
  }
}
```

Last example outputs:
```css
body main input,
body main textarea,
body main button,
body aside input,
body aside textarea,
body aside button { outline: none; }
```

## Media Queries

### Standard media queries

```js
{
  p: {
    fontSize: '1rem',

    '@media screen and (max-width: 768px)': {
      fontSize: '0.875rem'
    }
  }
}
```

Media queries are extracted and grouped at end of CSS.

### Nested media queries

```js
{
  p: {
    '@media (max-width: 768px)': {
      fontSize: '0.875rem',

      '@media (orientation: portrait)': {
        fontSize: '0.75rem'
      }
    }
  }
}
```

### Named media queries

Defined in config, used with `@name`:

```js
{
  div: {
    '@min-tablet': { fontSize: '14px' },
    '@phone': { fontSize: '12px' }
  }
}
```

### Theme selectors

```js
{
  img: {
    width: '100%',
    '@dark': {
      filter: 'brightness(0.8) saturate(0.8)'
    }
  }
}
```

Output (based on config):
```css
img { width: 100%; }
:root.dark img { filter: brightness(0.8) saturate(0.8); }
@media (prefers-color-scheme: dark) {
  :root.auto img { filter: brightness(0.8) saturate(0.8); }
}
```

### Known limitation

Media selectors (@dark, @light) inside named media queries don't work:

```js
// ❌ Won't work
{
  div: {
    '@phone': {
      '@dark': { fontSize: '12px' }  // Empty output!
    }
  }
}

// ✅ Works - reverse order
{
  div: {
    '@dark': {
      '@phone': { fontSize: '12px' }  // Correct output
    }
  }
}
```

## CSS Layers

### Inline layers

```js
{
  div: {
    thin: {
      fontWeight: 200,
      '@layer a': { fontWeight: 300 }
    }
  }
}
```

Output:
```css
div.thin { font-weight: 200; }
@layer a { div.thin { font-weight: 300; } }
```

### Layer ordering

```js
{
  '@layer': 'a, b, c'
}
// → @layer a, b, c;
```

## CSS Variables

### Using $theme module

```js
import $theme from './$theme.mjs'

export default {
  button: {
    backgroundColor: $theme.paper.bright,
    color: $theme.ink.bright
  }
}
// → background-color: var(--paper-bright); color: var(--ink-bright);
```

### Concatenation requires .var

```js
{
  button: {
    // ❌ Wrong - will be [object Object]
    border: `1px solid ${$theme.paper.tinted}`,

    // ✅ Correct
    border: `1px solid ${$theme.paper.tinted.var}`
  }
}
```

### Direct var object

```js
{
  button: {
    color: { var: '--custom-color' }
  }
}
// → color: var(--custom-color);
```

## Naming Conventions

### Automatic kebab-case conversion

camelCase class names → kebab-case in CSS:

```js
{
  myClass: { color: 'red' },       // → .my-class { color: red; }
  'myClass:hover': { ... }         // → .my-class:hover { ... }
}
```

### PascalCase preserved

Names starting with uppercase are kept as-is:

```js
{
  MyComponent: { color: 'green' }  // → .MyComponent { color: green; }
}
```

### Content with unicode

```js
{
  span: {
    '::before': { content: '👀' },       // → content: '\00d83d\00dc40';
    '::after': { content: '\u00a0' }     // → content: '\0000a0';
  }
}
```

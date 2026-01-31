# ESM Styles Project Conventions

Recommended project structure for React/SSR applications.

## Table of Contents

- [Directory Structure](#directory-structure)
- [Component Types](#component-types)
- [Component Styles](#component-styles)
- [Layout Styles](#layout-styles)
- [Best Practices](#best-practices)

## Directory Structure

### Parallel trees

Styles mirror the component tree in a separate directory:

```
project/
├── src/
│   └── components/
│       ├── message.tsx
│       ├── button.tsx
│       └── article/
│           ├── index.tsx
│           ├── header.tsx
│           └── footer.tsx
└── styles/
    ├── source/
    │   ├── components/
    │   │   ├── message.styles.mjs
    │   │   ├── button.styles.mjs
    │   │   └── article/
    │   │       ├── index.styles.mjs
    │   │       ├── header.styles.mjs
    │   │       └── footer.styles.mjs
    │   ├── components.styles.mjs
    │   ├── layout.styles.mjs
    │   └── defaults.styles.mjs
    └── css/
        └── styles.css
```

### File grouping pattern

Match component structure:

| Component structure | Styles structure |
|---------------------|------------------|
| `my-component.tsx` | `my-component.styles.mjs` |
| `my-component/index.tsx` | `my-component/index.styles.mjs` |

### Workflow

1. Open IDE with split view: component left, styles right
2. Run compiler in watch mode: `npx esm-styles watch`
3. Styles auto-compile on save

## Component Types

Two types of styled components:

### Components

Regular UI components that render content:

- PascalCase class names matching component name
- Self-contained styles (all variants nested inside)
- Globally unique names

### Layouts

Container components that only hold other components:

- Grouped under `layout` key
- Class pattern: `layout {name}`
- No content styles, only positioning

## Component Styles

### Naming convention

Component name = root class name = style object key:

```jsx
// message.tsx
export const Message = ({ urgent, children }) => (
  <article className={`Message ${urgent ? 'urgent' : ''}`}>
    {children}
  </article>
)
```

```js
// message.styles.mjs
export const Message = {
  width: '90vw',
  padding: '1rem',
  borderRadius: '8px',

  // Variant classes
  urgent: {
    backgroundColor: 'red',
    color: 'white'
  },

  // Nested elements
  header: {
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },

  content: {
    lineHeight: 1.6
  }
}
```

Output CSS:
```css
.Message { width: 90vw; padding: 1rem; border-radius: 8px; }
.Message.urgent { background-color: red; color: white; }
.Message.header { font-size: 1.2rem; font-weight: bold; }
.Message.content { line-height: 1.6; }
```

### Why PascalCase?

1. **Matches component names** — easy to find styles for a component
2. **Globally unique** — no conflicts between components
3. **Self-documenting** — clear what component a class belongs to

### Nested variants never conflict

```js
// button.styles.mjs
export const Button = {
  active: { fontWeight: 'bold' }  // → .Button.active
}

// message.styles.mjs
export const Message = {
  active: { borderColor: 'blue' } // → .Message.active
}
```

Same `active` class, different scopes.

## Layout Styles

### Naming convention

All layouts grouped under `layout` key:

```jsx
// layouts/home.tsx
export const HomeLayout = ({ children }) => (
  <div className="layout home">
    {children}
  </div>
)

// layouts/inner.tsx
export const InnerLayout = ({ children }) => (
  <div className="layout inner">
    {children}
  </div>
)
```

```js
// layout.styles.mjs
const home = {
  display: 'grid',
  gridTemplateColumns: '1fr 3fr',
  gap: '2rem'
}

const inner = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 1rem'
}

export const layout = { home, inner }
```

Output CSS:
```css
.layout.home { display: grid; grid-template-columns: 1fr 3fr; gap: 2rem; }
.layout.inner { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
```

### Avoid layout name conflicts

Don't nest one layout name inside another:

```js
// ❌ BAD - "inner" exists as layout AND nested in "home"
const home = {
  inner: { padding: '1rem' }  // Conflicts with layout.inner!
}

const inner = { maxWidth: '1200px' }

export const layout = { home, inner }
```

```js
// ✅ GOOD - use different names
const home = {
  content: { padding: '1rem' }  // No conflict
}

const inner = { maxWidth: '1200px' }

export const layout = { home, inner }
```

## Best Practices

### Style importing

Import styles globally in root layout, not in individual components:

```jsx
// app/layout.tsx or root.tsx
import '../styles/css/styles.css'

export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>
}
```

### File aggregation

Use barrel files to combine component styles:

```js
// components.styles.mjs
import { Message } from './components/message.styles.mjs'
import { Button } from './components/button.styles.mjs'
import { Card } from './components/card.styles.mjs'

export default { Message, Button, Card }
```

### Semantic HTML + minimal classes

Prefer semantic HTML with scoped styles over excessive class names:

```js
// ❌ Too many classes
export const Article = {
  'article-header': { ... },
  'article-title': { ... },
  'article-content': { ... }
}

// ✅ Semantic HTML
export const Article = {
  header: {
    h2: { fontSize: '1.5rem' }
  },
  p: { lineHeight: 1.6 }
}
```

```jsx
<article className="Article">
  <header><h2>Title</h2></header>
  <p>Content...</p>
</article>
```

### Use camelCase for class names

Avoid dashes in JS — use camelCase (converted to kebab-case in CSS):

```js
// ❌ Requires quotes
export const Message = {
  'is-active': { ... }
}

// ✅ No quotes needed
export const Message = {
  isActive: { ... }  // → .Message.is-active in CSS
}
```

### Theme-aware styles

Use $theme for colors and values that change with theme:

```js
import $theme from './$theme.mjs'

export const Card = {
  backgroundColor: $theme.paper.bright,
  color: $theme.ink.bright,
  border: `1px solid ${$theme.paper.tinted.var}`
}
```

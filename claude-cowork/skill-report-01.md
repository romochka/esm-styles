# ESM Styles Skill - Feedback Report

## Issues Encountered

### 1. camelCase to kebab-case conversion

Agent did not know that camelCase class names in styles are converted to kebab-case in output CSS:

```js
// styles
{ __sideContent: { ... } }  // → .side-content in CSS
```

```jsx
// TSX must use kebab-case
<div className="side-content">  // ✅ correct
<div className="sideContent">   // ❌ won't match
```

**Status:** Already documented in `conventions.md` (lines 277-291) but not in main SKILL.md. Agent didn't look at conventions.md.

### 2. Redundant prefixes in class names

Agent tends to use redundant prefixes for class names:

```jsx
<div className="side">
  <div className="side-transform">
    <div className="side-content">
      <div className="side-content-inner">
```

Could be simplified with nested structure or semantic HTML.

**Status:** Semantic HTML recommendation exists in `conventions.md` (lines 249-275). Agent didn't see it.

### 3. State modifiers with descendant selectors

Agent misunderstood how to create compound selectors with state modifiers. Created separate exports:

```js
// ❌ WRONG - creates separate .Rollie and .RollieOpen selectors
export const Rollie = { ... }
export const RollieOpen = {
  __labelClose: { ... }  // → .RollieOpen .label-close (wrong!)
}
```

Instead, state modifiers should be nested inside the parent with descendant overrides:

```js
// ✅ CORRECT - creates .Rollie.open .label-close
export const Rollie = {
  open: {
    __labelClose: { ... }
  }
}
```

**Status:** NOT documented anywhere. The skill shows `active: { color: 'red' }` for simple modifiers but doesn't explain how to combine modifiers with descendant selectors for state-based styling like `.Parent.open .child`.

---

## Recommendations

### 1. Add "State Modifiers with Descendants" to SKILL.md

This is the main gap. Add a section showing:

```js
{
  Panel: {
    __content: { opacity: 0 },

    // .Panel.open .content { opacity: 1 }
    open: {
      __content: { opacity: 1 }
    }
  }
}
```

With explicit warning against creating separate exports for states.

### 2. Improve discoverability of conventions.md

The link "Project structure: See conventions.md" doesn't suggest it contains **best practices** for:

- Semantic HTML usage
- camelCase class naming
- Theme-aware styles

Options:

- Rename link to "Project structure & best practices"
- Add brief mentions in SKILL.md that point to conventions.md for details
- Move critical rules (like kebab-case conversion) to SKILL.md since they cause immediate bugs

### 3. Add "Flat vs Nested Structure" guidance

Neither SKILL.md nor conventions.md explains when to use:

**Flat (with prefixes):**

```js
{ __side: {}, __sideTransform: {}, __sideContent: {} }
```

**Nested:**

```js
{
  __side: {
    __transform: {
      __content: {
      }
    }
  }
}
```

Trade-offs: selector length vs HTML structure mirroring.

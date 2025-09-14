# ESM Styles Best Practices

This document outlines recommended practices and common pitfalls when using ESM Styles to help you write maintainable and efficient CSS-in-JS code.

## Table of Contents

- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Configuration](#configuration)
- [Style Structure](#style-structure)
- [CSS Variables](#css-variables)
- [Media Queries](#media-queries)
- [Performance](#performance)
- [Common Pitfalls](#common-pitfalls)

## File Organization

### ✅ DO: Use a clear directory structure

```
src/styles/
├── source/
│   ├── $theme.mjs           # Generated theme variables
│   ├── $device.mjs          # Generated device variables
│   ├── global.styles.mjs    # Global CSS variables
│   ├── light.styles.mjs     # Light theme variables
│   ├── dark.styles.mjs      # Dark theme variables
│   ├── twilight.styles.mjs  # Twilight theme variables
│   ├── phone.styles.mjs     # Phone device variables
│   ├── tablet.styles.mjs    # Tablet device variables
│   ├── notebook.styles.mjs  # Notebook device variables
│   ├── defaults.styles.mjs  # Reset, base styles
│   ├── components.styles.mjs # Component styles
│   ├── layout.styles.mjs    # Layout styles
│   └── components/
│       ├── button.styles.mjs
│       ├── card.styles.mjs
│       └── modal.styles.mjs
```

### ✅ DO: Use consistent file naming

- Use kebab-case for module files: `button-group.styles.mjs`
- Use descriptive names: `navigation-menu.styles.mjs` not `nav.styles.mjs`
- Group related components in subdirectories

### ❌ DON'T: Mix different concerns in one file

```js
// ❌ BAD: mixing layout and components
export default {
  // Layout styles
  container: { maxWidth: '1200px' },

  // Component styles
  button: { padding: '10px' },

  // Theme variables
  colors: { primary: '#blue' },
}
```

## Naming Conventions

### ✅ DO: Use semantic class names

```js
// ✅ GOOD
export default {
  navigationMenu: {
    display: 'flex',

    menuItem: {
      padding: '8px 16px',
    },

    activeItem: {
      fontWeight: 'bold',
    },
  },
}
```

### ❌ DON'T: Use presentation-based names

```js
// ❌ BAD
export default {
  blueBox: {
    backgroundColor: 'blue', // What if you change to red?
  },

  bigText: {
    fontSize: '24px', // What if you need different sizes?
  },
}
```

### ✅ DO: Use consistent naming patterns

```js
// ✅ GOOD: consistent modifier patterns
export default {
  button: {
    padding: '10px 20px',

    // State modifiers
    isDisabled: { opacity: 0.5 },
    isLoading: { cursor: 'wait' },

    // Size variants
    sizeSmall: { padding: '5px 10px' },
    sizeLarge: { padding: '15px 30px' },

    // Style variants
    variantPrimary: { backgroundColor: 'blue' },
    variantSecondary: { backgroundColor: 'gray' },
  },
}
```

### ❌ DON'T: Use ampersand (&) syntax

```js
// ❌ BAD: ampersand is not supported
export default {
  button: {
    color: 'blue',

    '&:hover': {     // This won't work!
      color: 'red'
    },

    '&.active': {    // This won't work!
      fontWeight: 'bold'
    }
  }
}

// ✅ GOOD: use direct selectors
export default {
  button: {
    color: 'blue',

    ':hover': {      // Direct pseudo-class
      color: 'red'
    },

    active: {        // Class name (if not HTML tag)
      fontWeight: 'bold'
    }
  }
}
```

### ❌ DON'T: Use BEM-like naming

```js
// ❌ BAD: BEM-style naming
export default {
  card: {
    padding: '20px',

    card__header: {           // Avoid block__element
      marginBottom: '16px'
    },

    card__title: {            // Repetitive naming
      fontSize: '1.5rem'
    },

    'card--featured': {       // Avoid block--modifier
      border: '2px solid gold'
    }
  }
}

// ✅ GOOD: semantic nesting
export default {
  card: {
    padding: '20px',

    header: {                 // Simple, semantic
      marginBottom: '16px',

      title: {                // Nested naturally
        fontSize: '1.5rem'
      }
    },

    featured: {               // Clear modifier
      border: '2px solid gold'
    }
  }
}
```

### ❌ DON'T: Use dashes in class names

```js
// ❌ BAD: dashes require quotes in JavaScript
export default {
  'navigation-menu': {        // Needs quotes
    display: 'flex'
  },

  'user-profile': {           // Harder to work with in JS
    padding: '20px'
  }
}

// ✅ GOOD: use camelCase for easier JS handling
export default {
  navigationMenu: {           // No quotes needed
    display: 'flex'
  },

  userProfile: {              // Easy to reference in JS
    padding: '20px'
  }
}
```

## Configuration

### ✅ DO: Order floors logically

```js
// ✅ GOOD: logical cascade order
floors: [
  { source: 'defaults', layer: 'defaults' }, // Reset, base styles
  { source: 'components', layer: 'components' }, // Component styles
  { source: 'layout', layer: 'layout' }, // Layout styles
  { source: 'utilities', layer: 'utilities' }, // Utility classes
  { source: 'overrides' }, // High-specificity overrides
]
```

### ✅ DO: Use meaningful breakpoint names

```js
// ✅ GOOD: semantic breakpoints
const breakpoints = {
  mobile: 499,
  tablet: 1024,
  desktop: 1440,
  wide: 1920,
}
```

### ❌ DON'T: Use arbitrary breakpoint names

```js
// ❌ BAD: meaningless names
const breakpoints = {
  sm: 499,
  md: 1024,
  lg: 1440,
  xl: 1920,
}
```

### ✅ DO: Group related media types

```js
// ✅ GOOD: logical grouping
media: {
  theme: ['light', 'dark', 'high-contrast'],
  device: ['mobile', 'tablet', 'desktop'],
  preference: ['reduced-motion', 'high-contrast']
}
```

## Style Structure

### ✅ DO: Use semantic HTML with logical nesting

```js
// ✅ GOOD: semantic tags with meaningful structure
export default {
  article: {
    padding: '20px',
    borderRadius: '8px',

    header: {
      marginBottom: '16px',

      h2: {
        // Semantic heading tag
        fontSize: '1.5rem',
        fontWeight: 'bold',
      },

      time: {
        // Semantic time element
        fontSize: '0.9rem',
        color: 'gray',
      },
    },

    p: {
      // Content in paragraphs
      lineHeight: 1.6,
      marginBottom: '1rem',
    },

    footer: {
      marginTop: '16px',
      textAlign: 'right',

      button: {
        // Semantic button
        padding: '8px 16px',
      },
    },
  },
}
```

### ✅ DO: Rely on semantic elements over generic divs

```js
// ❌ BAD: everything is a div with classes
export default {
  'story-container': {
    padding: '20px',

    'story-header': {
      marginBottom: '16px',
    },

    'story-title': {
      fontSize: '1.5rem',
    },

    'story-content': {
      lineHeight: 1.6,
    },

    'story-actions': {
      marginTop: '16px',
    },
  },
}

// ✅ GOOD: semantic HTML structure
export default {
  section: {                        // Semantic section
    story: {                        // Custom component class
      padding: '20px',

      header: {                     // Semantic header
        marginBottom: '16px',

        h3: {                       // Proper heading hierarchy
          fontSize: '1.5rem',
        },
      },

      main: {                       // Main content area
        lineHeight: 1.6,

        p: {                        // Paragraphs for text
          marginBottom: '1rem',
        },
      },

      nav: {                        // Navigation for actions
        marginTop: '16px',

        button: {                   // Semantic buttons
          marginRight: '8px',
        },
      },
    },
  },
}
```

### ❌ DON'T: Repeat class names or create redundant nesting

```js
// ❌ BAD: repetitive naming and poor structure
export default {
  'story-list': {
    'story-item': {
      'story-item-content': {
        'story-item-title': {       // Too repetitive!
          fontSize: '1.2rem',
        },

        'story-item-message': {     // div.story div.story_message
          padding: '10px',
        },
      },
    },
  },
}

// ✅ GOOD: semantic structure without repetition
export default {
  section: {
    story: {                        // section.story (semantic)
      padding: '20px',

      h3: {                         // story h3 (semantic heading)
        fontSize: '1.2rem',
      },

      article: {                    // story article (semantic content)
        message: {                  // story article.message
          padding: '10px',
        },
      },
    },
  },
}
```

### ❌ DON'T: Over-nest selectors

```js
// ❌ BAD: too deeply nested
export default {
  page: {
    main: {
      section: {
        article: {
          div: {
            p: {
              span: {
                color: 'red', // 7 levels deep!
              },
            },
          },
        },
      },
    },
  },
}
```

### ✅ DO: Use composition for reusable styles

```js
// ✅ GOOD: reusable patterns
const flexCenter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const cardBase = {
  padding: '20px',
  borderRadius: '8px',
  backgroundColor: 'white',
}

export default {
  modal: {
    ...flexCenter,
    position: 'fixed',
    inset: 0,
  },

  productCard: {
    ...cardBase,
    border: '1px solid #eee',
  },

  alertCard: {
    ...cardBase,
    border: '2px solid red',
  },
}
```

## CSS Variables

### ✅ DO: Use semantic variable names

```js
// ✅ GOOD: semantic naming
export default {
  colors: {
    primary: '#4285f4',
    secondary: '#34a853',
    danger: '#ea4335',
    surface: '#ffffff',
    onSurface: '#000000',
  },

  spacing: {
    unit: '8px',
    small: '16px',
    medium: '24px',
    large: '32px',
  },
}
```

### ✅ DO: Create consistent theme structures

```js
// light.styles.mjs
export default {
  surface: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    accent: '#e3f2fd'
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#bdbdbd'
  }
}

// dark.styles.mjs
export default {
  surface: {
    primary: '#121212',
    secondary: '#1e1e1e',
    accent: '#263238'
  },
  text: {
    primary: '#ffffff',
    secondary: '#b3b3b3',
    disabled: '#666666'
  }
}
```

### ❌ DON'T: Hardcode theme-specific values in components

```js
// ❌ BAD: hardcoded colors
export default {
  button: {
    backgroundColor: '#ffffff', // What about dark theme?
    color: '#000000'
  }
}

// ✅ GOOD: use theme variables
import $theme from './$theme.mjs'

export default {
  button: {
    backgroundColor: $theme.surface.primary,
    color: $theme.text.primary
  }
}
```

## Media Queries

### ✅ DO: Use mobile-first approach

```js
// ✅ GOOD: mobile-first
export default {
  container: {
    padding: '16px', // Mobile default

    '@min-tablet': {
      padding: '24px', // Tablet and up
    },

    '@min-desktop': {
      padding: '32px', // Desktop and up
    },
  },
}
```

### ✅ DO: Use semantic media query names

```js
// ✅ GOOD: descriptive names
mediaQueries: {
  'reduced-motion': '(prefers-reduced-motion: reduce)',
  'high-contrast': '(prefers-contrast: high)',
  'touch-device': '(hover: none) and (pointer: coarse)',
  'print': 'print'
}
```

### ❌ DON'T: Repeat media queries

```js
// ❌ BAD: repeated media queries
export default {
  header: {
    '@media (max-width: 768px)': {
      fontSize: '1.2rem'
    }
  },

  nav: {
    '@media (max-width: 768px)': { // Same breakpoint repeated
      display: 'none'
    }
  }
}

// ✅ GOOD: use named queries
export default {
  header: {
    '@mobile': {
      fontSize: '1.2rem'
    }
  },

  nav: {
    '@mobile': {
      display: 'none'
    }
  }
}
```

## Performance

### ✅ DO: Use efficient selectors

```js
// ✅ GOOD: specific, efficient selectors
export default {
  navigationMenu: {
    display: 'flex',

    menuItem: {
      padding: '8px',
    },
  },
}
```

### ❌ DON'T: Use overly complex selectors

```js
// ❌ BAD: complex, inefficient selectors
export default {
  'div > ul li:nth-child(odd) a[href*="example"]:not(.active)': {
    color: 'red', // Too complex!
  },
}
```

### ✅ DO: Minimize CSS output size

```js
// ✅ GOOD: group similar styles
const buttonBase = {
  padding: '10px 20px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
}

export default {
  primaryButton: {
    ...buttonBase,
    backgroundColor: 'blue',
    color: 'white',
  },

  secondaryButton: {
    ...buttonBase,
    backgroundColor: 'gray',
    color: 'black',
  },
}
```

## Common Pitfalls

### ❌ DON'T: Forget about CSS specificity

```js
// ❌ PROBLEM: specificity conflicts
export default {
  button: {
    color: 'blue',

    primary: {
      color: 'white', // Might not override due to specificity
    },
  },
}

// ✅ SOLUTION: use layers or more specific selectors
floors: [
  { source: 'base', layer: 'base' },
  { source: 'components', layer: 'components' },
  { source: 'overrides', layer: 'overrides' }, // Higher specificity layer
]
```

### ❌ DON'T: Mix units inconsistently

```js
// ❌ BAD: mixed units
export default {
  container: {
    padding: '16px',
    margin: '1rem',
    width: '50%',
    height: '200pt' // Inconsistent!
  }
}

// ✅ GOOD: consistent units
export default {
  container: {
    padding: '1rem',
    margin: '1rem',
    width: '50%',
    height: '12.5rem' // Consistent rem units
  }
}
```

### ❌ DON'T: Forget about accessibility

```js
// ❌ BAD: ignores accessibility
export default {
  button: {
    backgroundColor: '#ff0000',
    color: '#ff9999' // Poor contrast!
  }
}

// ✅ GOOD: considers accessibility
export default {
  button: {
    backgroundColor: '#d32f2f',
    color: '#ffffff', // Good contrast
    fontSize: '16px', // Large enough for readability
    padding: '12px 24px', // Adequate touch target size

    '@reduced-motion': {
      transition: 'none' // Respects user preferences
    }
  }
}
```

### ❌ DON'T: Hardcode magic numbers

```js
// ❌ BAD: magic numbers
export default {
  modal: {
    zIndex: 9999,     // Why 9999?
    top: '73px'       // Why 73px?
  }
}

// ✅ GOOD: use meaningful variables
const zIndexes = {
  modal: 1000,
  tooltip: 1100,
  dropdown: 1200
}

const headerHeight = '72px'

export default {
  modal: {
    zIndex: zIndexes.modal,
    top: `calc(${headerHeight} + 1px)`
  }
}
```

## Summary

- **Organize**: Use clear file structure and consistent naming
- **Naming**: Use camelCase, avoid BEM, avoid dashes, prefer semantic names
- **Structure**: Rely on semantic HTML tags over generic divs and classes
- **Nesting**: Use logical nesting, avoid repetitive class names
- **Syntax**: No ampersand (&) syntax, use direct selectors and pseudo-classes
- **Compose**: Reuse common patterns and avoid duplication
- **Configure**: Set up logical floors and meaningful breakpoints
- **Variables**: Use semantic names and consistent theme structures
- **Performance**: Write efficient selectors and minimize output
- **Accessibility**: Consider contrast, motion preferences, and usability
- **Maintainability**: Avoid magic numbers and overly complex selectors

Following these practices will help you create maintainable, performant, and accessible stylesheets with ESM Styles.

/**
 * Test file to verify TypeScript integration
 * Open this in VS Code / Cursor to test autocompletion
 */

import { defineStyles, defineMixin, type StrictCSSProperties } from '../../src/lib/types/styles.js'

// Simulating $theme (normally auto-generated)
const $theme = {
  paper: {
    bright: { var: 'var(--paper-bright)', name: '--paper-bright' },
    tinted: { var: 'var(--paper-tinted)', name: '--paper-tinted' },
  },
  ink: {
    bright: { var: 'var(--ink-bright)', name: '--ink-bright' },
    faded: { var: 'var(--ink-faded)', name: '--ink-faded' },
  },
}

// ============================================
// STRICT MODE: Use `satisfies` to catch typos
// ============================================

// This catches typos at compile time!
const buttonBase = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '12px 24px',
  border: 'none',
  cursor: 'pointer',
  // backgroundColr: 'red',  // ❌ Uncomment to see: "Did you mean 'backgroundColor'?"
} satisfies StrictCSSProperties

// ============================================
// FLEXIBLE MODE: Mixins with autocompletion
// ============================================

const flexCenter = defineMixin({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const cardBase = defineMixin({
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
})

// ============================================
// Test: Full stylesheet with types
// ============================================

export default defineStyles({
  // Test: Basic CSS properties (should autocomplete)
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: $theme.paper.bright, // CSS variable ref
    color: $theme.ink.bright,
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: 1.5,
    transition: 'all 0.2s ease',

    // Test: Pseudo-classes (should autocomplete :hover, :focus, etc.)
    ':hover': {
      opacity: 0.9,
      transform: 'translateY(-1px)',
    },

    ':focus': {
      outline: 'none',
      boxShadow: '0 0 0 3px rgba(66, 133, 244, 0.3)',
    },

    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
      pointerEvents: 'none',
    },

    ':active': {
      transform: 'translateY(0)',
    },

    // Test: Pseudo-elements
    '::before': {
      content: '""',
      position: 'absolute',
    },

    // Test: Theme variants
    '@dark': {
      backgroundColor: $theme.paper.tinted,
      color: $theme.ink.bright,
    },

    // Test: Media queries
    '@media (max-width: 768px)': {
      padding: '10px 16px',
      fontSize: '13px',
    },

    // Test: Nested class (esm-styles convention)
    primary: {
      backgroundColor: 'blue',
      color: 'white',
    },

    // Test: Descendant selector
    __icon: {
      width: '20px',
      height: '20px',
      marginRight: '8px',
    },

    // Test: Child combinator
    '> span': {
      marginLeft: '4px',
    },
  },

  // Test: Card with mixins
  card: {
    ...cardBase,
    ...flexCenter,
    flexDirection: 'column',
    padding: '24px',
    backgroundColor: $theme.paper.bright,

    '@dark': {
      backgroundColor: $theme.paper.tinted,
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    },

    '@media (max-width: 768px)': {
      padding: '16px',
    },

    __title: {
      fontSize: '20px',
      fontWeight: 600,
      color: $theme.ink.bright,
      marginBottom: '12px',
    },

    __content: {
      fontSize: '14px',
      color: $theme.ink.faded,
      lineHeight: 1.6,
    },
  },

  // Test: Multiple selectors
  'h1, h2, h3': {
    margin: '0 0 1rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },

  // Test: Attribute selector
  'input[type="text"]': {
    padding: '8px 12px',
    border: '1px solid #ccc',
    borderRadius: '4px',

    ':focus': {
      borderColor: 'blue',
      outline: 'none',
    },
  },

  // ============================================
  // Uncomment to test error detection:
  // ============================================

  // errorTest: {
  //   backgroundColr: 'red',    // ❌ Should show error (typo)
  //   dipslay: 'flex',          // ❌ Should show error (typo)
  //   colour: 'blue',           // ❌ Should show error (British spelling)
  // },
})

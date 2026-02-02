/**
 * CLEAN SYNTAX EXAMPLE
 *
 * No imports needed! $theme is auto-injected by esbuild.
 *
 * For TypeScript support, add to your tsconfig.json:
 * {
 *   "include": ["source/globals.d.ts", "source/**\/*.styles.ts"]
 * }
 */

// Just export your styles - $theme is globally available!
export const button = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '12px 24px',
  border: 'none',
  borderRadius: '8px',
  backgroundColor: $theme.paper.bright,
  color: $theme.ink.bright,
  cursor: 'pointer',
  fontWeight: 500,
  transition: 'all 0.2s ease',

  ':hover': {
    opacity: 0.9,
    transform: 'translateY(-1px)',
  },

  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  '@dark': {
    backgroundColor: $theme.paper.tinted,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },

  '@media (max-width: 768px)': {
    padding: '10px 16px',
    fontSize: '13px',
  },

  // Variants
  primary: {
    backgroundColor: 'blue',
    color: 'white',
  },

  secondary: {
    backgroundColor: 'transparent',
    border: '1px solid currentColor',
  },

  // Nested elements
  __icon: {
    width: '20px',
    height: '20px',
    marginRight: '8px',
  },
}

export const iconButton = {
  ...button,
  padding: '12px',
  borderRadius: '50%',

  __icon: {
    margin: 0,
  },
}

export const global = {
  '@property --content-gap': {
    syntax: '<length>',
    inherits: true,
    initialValue: '1rem',
  },

  'h1, h2, h3': {
    fontWeight: 650,
    letterSpacing: '-0.01em',
  },

  body: {
    margin: 0,
    fontFamily: 'Charter, Georgia, serif',
    backgroundColor: $theme.paper.bright,
    color: $theme.ink.strong,
  },

  a: {
    color: 'inherit',
  },

  img: {
    display: 'block',
    maxWidth: '100%',
  },
} satisfies GlobalStyle

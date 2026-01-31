import $theme from '@/$theme.mjs'

export const app = {
  display: 'flex',
  flexDirection: 'row',
  minHeight: '100vh',

  'main, aside': {
    display: 'flex',
  },

  '@media screen and (prefers-color-scheme: light)': {
    backgroundColor: $theme.paper.toilet,
  },

  '@media (max-width: 499px)': {
    minHeight: '99dvh',

    '@media screen and (prefers-color-scheme: light)': {
      backgroundColor: 'white',
    },

    '@media screen and (prefers-color-scheme: dark)': {
      'main, aside': {
        display: 'grid',
      },
      backgroundColor: 'black',
    },
  },

  p: {
    marginBlock: 0,
    '@media (max-width: 499px)': {
      marginBlock: '1em',

      '@media screen and (prefers-color-scheme: dark)': {
        marginInline: 'auto',
      },
    },
  },
}

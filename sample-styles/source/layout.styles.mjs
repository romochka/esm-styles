import { app } from '@/layout/app.styles.mjs'

export default {
  main: {
    fontSize: '16px',

    xx: {
      fontSize: '14px',
    },

    '@twilight': {
      borderColor: 'black',
    },

    '@light': {
      borderColor: 'white',
      fontWeight: 500,
    },
  },

  aside: {
    color: 'purple',

    '@twilight': {
      borderColor: 'maroon',
    },

    '@light': {
      borderColor: 'white',
    },

    '@phone': {
      color: 'pink',
    },
    '@tablet': {
      color: 'yellow',
    },
    '@min-notebook': {
      color: 'silver',
    },
  },

  'main, aside': {
    padding: 0,
    '@phone': {
      padding: '10px',
    },
    '@tablet': {
      padding: '20px',
    },
    '@min-notebook': {
      padding: '30px',
    },
  },

  app,
}

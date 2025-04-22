import { app } from './layout/app.styles.mjs'

export default {
  body: {
    'main, aside': {
      'input, textarea, button': {
        outline: 'none',
      },
    },
    'div#app': app,
  },
}

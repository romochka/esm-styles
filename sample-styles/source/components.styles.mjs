import $theme from './$theme.mjs'

export default {
  button: {
    backgroundColor: $theme.paper.bright,
    color: 'white',
    padding: '10px 20px',
    borderRadius: '9px',

    primary: {
      backgroundColor: 'blue',
      color: 'yellow',
    },

    secondary: {
      backgroundColor: 'orange',
    },

    __icon: {
      width: '20px',
      height: '20px',
    },

    svg: {
      width: '20px',
      height: '20px',
    },

    'svg.icon': {
      width: '20px',
      height: '20px',
    },

    '+ p': {
      color: 'green',
    },

    '~ p': {
      color: 'purple',
    },

    ':has(.icon)': {
      borderRadius: '50%',

      '::after': {
        content: 'x',
      },

      '--moz-border-radius': '50%',
    },
  },
}

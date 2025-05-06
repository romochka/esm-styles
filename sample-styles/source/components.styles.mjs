import $theme from './$theme.mjs'

export default {
  '*': {
    boxSizing: 'border-box',
  },
  'div.bgimage': {
    backgroundImage:
      'url("data:image/svg+xml;utf8,<svg width="7" height="7" viewBox="0 0 7 7" xmlns="http://www.w3.org/2000/svg"><circle cx="3.5" cy="3.5" r="3.5" fill="red"/></svg>")',
  },
  'div > *': {
    boxSizing: 'padding-box',
    fontSize: '16px',
  },
  svg: {
    circle: { fill: 'red' },
  },
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

    '@dark': {
      backgroundColor: $theme.paper.tinted,
    },
  },

  player: {
    backgroundColor: $theme.paper.bright,
    color: 'white',
    padding: '10px 20px',
    borderRadius: '9px',

    '@dark': {
      backgroundColor: $theme.paper.tinted,
    },
  },
}

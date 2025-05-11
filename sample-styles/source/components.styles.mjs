import $theme from './$theme.mjs'

export default {
  // doc tests

  a: {
    'div#main': {
      fontFamily: 'sans-serif',
    },
  },

  card: {
    display: 'flex',

    '@media (max-width: 768px)': {
      flexDirection: 'column',

      '@media (orientation: portrait)': {
        padding: '10px',
      },
    },
  },

  'button, .btn': {
    padding: '10px 20px',
  },

  'input[type="text"], input[type="email"]': {
    borderRadius: '4px',
  },
  modal: {
    position: 'relative',

    __close: {
      position: 'absolute',
      top: '10px',
      right: '10px',
    },
  },
  'doc-tests': {
    p: {
      fontSize: '16px',
      color: 'black',

      a: {
        color: 'blue',
      },

      strong: {
        fontWeight: 'bold',
      },

      _highlight: {
        backgroundColor: 'yellow',
      },
    },

    div: {
      highlighted: {
        // highlighted is not a tag
        border: '1px solid red',
      },
      p: {
        // p is a tag
        fontSize: '16px',
      },
      _video: {
        // video is a tag, but the class is meant
        aspectRatio: 1.77,
      },
    },
  },

  //

  '*': {
    boxSizing: 'border-box',
  },
  'div.should-handle-underscore': {
    _video: {
      // video is a tag, but the class of parent div is meant
      aspectRatio: 1.77,
    },
  },
  'div.should-use-var': {
    color: $theme.paper.bright,
    border: `1px solid ${$theme.paper.tinted.var}`, // should be replaced with var(--paper-bright)
  },
  'div.should-keep-text': {
    content: 'attr(data-replicated-value) " "',
  },
  'div.should-keep-keywords': {
    content: 'normal',
  },
  'div.should-wrap-in-quotes': {
    content: ' ',
  },
  'div.should-handle-values-with-spaces': {
    content: '"👋 " / "waving hand"',
  },
  'div.should-convert-to-css-unicode-format': {
    content: '\u00a0',
  },
  'div.bgimage': {
    backgroundImage:
      'url(\'data:image/svg+xml;utf8,<svg width="7" height="7" viewBox="0 0 7 7" xmlns="http://www.w3.org/2000/svg"><circle cx="3.5" cy="3.5" r="3.5" fill="red"/></svg>\')',
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

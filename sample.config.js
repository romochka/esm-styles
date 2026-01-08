const breakpoints = {
  phone: 499,
  tablet: 1024,
}

export default {
  basePath: './sample-styles', // relative to build command call location
  sourcePath: 'source', // prefixed with basePath
  outputPath: 'css', // prefixed with basePath
  sourceFilesSuffix: '.styles.mjs',

  // input

  // old parameter:
  // layers: ['defaults', 'components', 'layout'],

  // new parameter:
  floors: [
    { source: 'dummy', outputPath: 'alt', minify: true }, // put generated css in basePath/alt/dummy.css
    { source: 'defaults', layer: 'defaults' },
    { source: 'components', layer: 'components' },
    { source: 'layout', layer: 'layout' }, // wrapped in layer 'layout'
    { source: 'test-nolayer' }, // not wrapped in any layer
    { source: 'test-layout', layer: 'special-layout' }, // also wrapped in layer 'layout'
  ],

  // output

  mainCssFile: 'styles.css',

  importFloors: ['defaults', 'components', 'layout'],

  globalVariables: 'global',

  globalRootSelector: ':root',

  // put timestamp.mjs file in [basePath]/source (if not specified, timestamp.mjs will be put in basePath)
  // ass ".ts" extension to the file (if not specified, ".mjs" will be used)
  timestamp: { outputPath: 'source', extension: 'ts' },

  // media

  media: {
    device: ['phone', 'tablet', 'notebook'], // "media type": ["set of variables 1", ...]
    theme: ['light', 'twilight', 'dark'],
  },

  mediaSelectors: {
    theme: {
      light: [
        {
          selector: '.auto',
          mediaQuery: 'screen and (prefers-color-scheme: light)',
          prefix: 'auto',
        },
        {
          selector: '.light',
        },
      ],
      twilight: [
        {
          selector: '.twilight',
        },
      ],
      dark: [
        {
          selector: '.auto',
          mediaQuery: 'screen and (prefers-color-scheme: dark)',
          prefix: 'auto',
        },
        {
          selector: '.dark',
        },
      ],
    },
    device: {
      phone: [
        {
          mediaQuery: `screen and (max-width: ${breakpoints.phone}px)`,
        },
      ],
      tablet: [
        {
          mediaQuery: `screen and (min-width: ${
            breakpoints.phone + 1
          }px) and (max-width: ${breakpoints.tablet}px)`,
        },
      ],
      notebook: [
        {
          mediaQuery: `screen and (min-width: ${breakpoints.tablet + 1}px)`,
        },
      ],
    },
  },

  mediaQueries: {
    'small-phone': `(max-width: ${breakpoints.phone}px)`,
    'min-tablet': `(min-width: ${breakpoints.phone + 1}px)`,
    'max-tablet': `(max-width: ${breakpoints.tablet}px)`,
    'min-notebook': `(min-width: ${breakpoints.tablet + 1}px)`,
  },
}

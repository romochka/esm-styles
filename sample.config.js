export default {
  basePath: './sample-styles', // relative to build command call location
  sourcePath: 'source', // prefixed with basePath
  outputPath: 'css', // prefixed with basePath
  sourceFilesSuffix: '.styles.mjs',

  // input

  layers: ['defaults', 'components', 'layout'],

  // output

  mainCssFile: 'styles.css',

  globalVariables: 'global',

  // media

  media: {
    device: ['phone', 'tablet', 'notebook'], // "media type": ["set of variables 1", ...]
    theme: ['light', 'twilight', 'dark'],
  },

  mediaSelectors: {
    theme: {
      light: [
        {
          selector: ':root.auto',
          mediaQuery: 'screen and (prefers-color-scheme: light)',
          prefix: 'auto',
        },
        {
          selector: ':root.light',
        },
      ],
      twilight: [
        {
          selector: ':root.twilight',
        },
      ],
      dark: [
        {
          selector: ':root.auto',
          mediaQuery: 'screen and (prefers-color-scheme: dark)',
          prefix: 'auto',
        },
        {
          selector: ':root.dark',
        },
      ],
    },
    device: {
      phone: [
        {
          selector: ':root',
          mediaQuery: 'screen and (max-width: 499px)',
        },
      ],
      tablet: [
        {
          selector: ':root',
          mediaQuery: 'screen and (min-width: 500px) and (max-width: 839px)',
        },
      ],
      notebook: [
        {
          selector: ':root',
          mediaQuery: 'screen and (min-width: 840px)',
        },
      ],
    },
  },
}

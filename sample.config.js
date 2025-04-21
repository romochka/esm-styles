export default {
  basePath: './sample-styles', // relative to build command call location
  sourcePath: 'source', // prefixed with basePath
  outputPath: 'css', // prefixed with basePath
  sourceFilesSuffix: '.styles.mjs',

  // input

  layers: ['defaults', 'components', 'layout'],

  // output

  mainCssFile: 'styles.css',
}

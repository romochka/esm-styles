## Task 2

Create a CLI tool that builds the styles from the files as specified in the config file.

How should it work:

After installing the published package, the `esm-styles` should provide the CLI `build` command that optionally accepts config file name.

Build command should build the styles from the JS files as specified in the config file.

## Config file

Default config file name is `esm-styles.config.js`.

### path and file parameters

**`basePath`** - relative to build command call location, for example `../packages/your-package/src/styles`, if you want to build styles in your monorepo project

**`sourcePath`** - prefixed with basePath - path to the source files

**`outputPath`** - prefixed with basePath - path for the output css files

**`sourceFilesSuffix`** - default: `.styles.mjs`

Suffix needed to distinguish the styles files from the other files in the source path. (Needed for future implementations.)

I prefer to use `.mjs` extension by default to make sure that NodeJS won't treat the files as CommonJS modules in any users' environments.

### input parameters

**`layers`** - array of file names  
 these files should be in the `sourcePath` and will be used as entry points for the styles. For the sample config the needed files are (using the paths in the [sample.config.js](./sample.config.js)):

- `./sample-styles/source/defaults.styles.mjs`
- `./sample-styles/source/components.styles.mjs`
- `./sample-styles/source/layout.styles.mjs`

### output parameters

**`mainCssFile`** - Main CSS file name.

The main CSS file is the index file that contains imports of all the other generated CSS files.

```css
@layer defaults, components, layout;
@import 'defaults.css';
@import 'components.css';
@import 'layout.css';
```

## Build process

The main function should open each of the layers files and import default exports as an object, in this case the other imported objects in the layer file used inside default export will be evaluated and included in the resulting object automatically.

Then the function should convert the resulting object into a CSS string using the getCss function existing in the package [./src/lib/index.ts](./src/lib/index.ts).

The resulting CSS string should be wrapped in the @layer directive and written to the output file:

```css
@layer defaults {
  /* full css string */
  ...;
}
```

After all layers are processed, the main function should create the main CSS file with layer order directive and imports of all the other CSS files as described above, and write it to the output path.

_Note_: Do not import css files as layers in the main CSS file, because of NextJS bug, that is why we must wrap each CSS file in the @layer directive instead of importing a file as a layer.

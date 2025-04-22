# Task 3 (completed)

Update style compiler to support global and media-dependent css variable sets.

## Usage of variable sets

```html
<!DOCTYPE html>
<html class="auto">
  ...
</html>
```

and

```html
<html class="light">
  ...
</html>
```

the goal is to allow select needed variable sets by class name and/or by media query.

## Config file

### new parameters

**`globalRootSelector`** - root selector for variables.

```js
globalRootSelector: ':root',
```

**`globalVariables`** - file name of the file that default-exports a js object of css variables. Uses basePath, sourcePath and sourceFilesSuffix params.

```js
globalVariables: 'global',
```

means that the file `global.styles.mjs` is present in the `basePath/sourcePath` directory, and the object default-exported from this file should be converted into css wrapped with `globalRootSelector`, stored in the `basePath/outputPath` directory with name `global.css` and imported into the main css file.

Sample [global.styles.mjs](./sample-styles/source/global.styles.mjs) must be converted to `global.css`:

```css
:root {
  --sans: '"Helvetica Neue", Helvetica, Arial, sans-serif';
  --serif: 'Georgia, serif';
  --mono: 'Monaco, monospace';
}
```

and imported into the main css file:

```css
...
@import "global.css";
...
```

**`media`** - list of available media types and their sets of variables.  
Each key is a media type name, each value is a set of names of source files that default-export js objects for css variables.

```js
media: {
  device: ['phone', 'tablet', 'notebook'],
  theme: ['light', 'twilight', 'dark'],
}
```

this means that the following files must be present in the `basePath/sourcePath` directory:

- `phone.styles.mjs`
- `tablet.styles.mjs`
- `notebook.styles.mjs`
- `light.styles.mjs`
- `twilight.styles.mjs`
- `dark.styles.mjs`

Each of these files must be converted to css variables files and imported into the main css file by rules described in `mediaSelectors` parameter.

**`mediaSelectors`** - configuration of media types variable selectors and media queries for import.

```js
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
    ...
  },
  ...
}
```

This means that for the media of `theme` type we have following rules for variable sets:

_`light` set_  
each object in `mediaSelectors.theme.light` array must be used to produce a single css file this way:

- css variables must be wrapped with selector `globalRootSelector` plus selector from `selector` property, if exists;
- name of the css file must be `light.theme.css` (`{variableSet}.{mediaType}.css`);
- if `prefix` property is present, this prefix must be added to the beginning of the file name;
- if `mediaQuery` property is present, this media query must be added to the end of the import statement.

this means that the light set must be present in two files:

`auto.light.theme.css`

```css
:root.auto {
  --color-paper-bright: #ffffff;
  ...;
}
```

`light.theme.css`

```css
:root.light {
  --color-paper-bright: #ffffff;
  ...;
}
```

and the main css file must contain two import statements:

```css
@import 'light.theme.css';
@import 'auto.light.theme.css' screen and (prefers-color-scheme: light);
```

The twilight theme has only one media selector object without media query and prefix, so there must be only one file:

`twilight.theme.css`

```css
:root.twilight {
  ...;
}
```

and the main css file must contain one import statement:

```css
@import 'twilight.theme.css';
```

The same goes for other themes and other media types, check [sample.config.js](./sample.config.js) for more details.

## Build process

The conversion from js object to css variables string should be done as described here: [JS to CSS variables translation](./doc/css-variables.md).

### The inheritance of variables

Each media-dependent variables must inherit missing variables from the previous variable set in order of listing in the `media.{mediaType}` array.

**`theme: ['light', 'twilight', 'dark']`**

example: the source file [dark.styles.mjs](./sample-styles/source/dark.styles.mjs) does not have `accent` variable, so it should be inherited from the previous variable set in the `media.theme` array, which is [twilight.styles.mjs](./sample-styles/source/twilight.styles.mjs), which in turn inherits it from [light.styles.mjs](./sample-styles/source/light.styles.mjs):

**light.theme.css**

```css
:root.light {
  --color-paper-bright: #ffffff;
  --color-paper-tinted: #f0f0f0;
  --color-ink-bright: #000000;
  --color-ink-faded: #333333;
  --color-ink-accent: #ff0000;
}
```

**dark.theme.css**

```css
:root.dark {
  --color-paper-bright: #000000;
  --color-paper-tinted: #323232;
  --color-ink-bright: #ffffff;
  --color-ink-faded: #b3b3b3;
  --color-ink-accent: #ff0000;
}
```

The inheritance must be done from left to right, e.g. if we introduce new variables in the `twilight` set, they will appear in the `dark` set if they are missing there, but not in the `light` set.

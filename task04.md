# Task 4

Update style compiler to support named media queries and selectors.

## Config file

### new parameters

**`mediaQueries`** - list of named media queries.  
Contains shorthands for media queries to use in source styles:

(config: [./sample.config.js](./sample.config.js))

`source.styles.mjs`

```js
{
  main: {
    display: 'flex',
    "@max-tablet": {
      flexDirection: 'column',
    },
    "@min-notebook": {
      display: 'grid',
    },
  },
}
```

translates to:

```css
main {
  display: flex;
}
@media screen and (max-width: 1024px) {
  main {
    flex-direction: column;
  }
}
@media screen and (min-width: 1025px) {
  main {
    display: grid;
  }
}
```

### changes in existing parameters

In addition to named media queries listed in the new `mediaQueries` parameter, the named media queries must be deducted from the existing `mediaSelectors` parameter: for each variant of each media type that has a mediaQuery property AND does not have a selector property, the same rules apply:

`sample.config.js` part:

```js
mediaSelectors: {
  theme: { // media type
    light: [ // variants
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
  },
  device: {
    phone: [
      {
        mediaQuery: `screen and (max-width: 499px)`,
      },
    ],
  },
}
```

means that the following named media queries also can be used in the source styles:

`source.styles.mjs`

```js
{
  p: {
    marginInline: 0,
    "@phone": {
      marginInline: "16px"
    }
  }
}
```

translates to:

```css
p {
  margin-inline: 0;
}
@media screen and (max-width: 499px) {
  p {
    margin-inline: 16px;
  }
}
```

For entries in `mediaSelectors` that have a `selector` property, the selector can be used in the styles as "@selector-name":

`source.styles.mjs`

```js
{
  p: {
  "@twilight": {
    opacity: 0.75
  }
}
```

which translates to:

```css
:root.twilight p {
  opacity: 0.75;
}
```

For entries in `mediaSelectors` that have both `selector` and `mediaQuery` properties, combination of media query and media selector is generated:

```js
{
  p: {
  "@light": {
    fontWeight: 500
  }
}
```

translates to:

```css
/* this deducted from { selector: '.light } entry */
:root.light p {
  font-weight: 500;
}

/* this deducted from { selector: '.auto', mediaQuery: 'screen and (prefers-color-scheme: light)', ... } entry */
@media screen and (prefers-color-scheme: light) {
  :root.auto p {
    font-weight: 500;
  }
}
```

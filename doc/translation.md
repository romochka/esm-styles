# JS to CSS translations

JS object are translated to CSS this way:

## T1

JS object keys that contain another object translate to CSS selectors, while keys pointing to an end value (like string or number), transalte to CSS properties:

`source.styles.js`

```js
{
  p: {
    fontSize: '16px',
  }
}
```

`output.css`

```css
p {
  font-size: 16px;
}
```

Key targeted to properties are converted automatically from `camelCase` to `kebab-case`.

## T2

Nested js objects translate to flat CSS:

`source.styles.js`

```js
{
  p: {
    fontSize: '16px',

    a: {
      color: 'red',
    }
  }
}

```

`output.css`

```css
p {
  font-size: 16px;
}

p a {
  color: red;
}
```

`p` and `a` are recognized as standard HTML tag names.

Note: keys named as standard HTML tag that contain primitive values generate invalid CSS:

```js
{
  p: 'red',
}
```

goes to

```css
: {
  p: red;
}
```

## T3

JS object keys with non-primitive values that were not recognized as standard HTML tag names convert to class selector:

`source.styles.js`

```js
{
  sticker: {
    backgroundColor: 'yellow',
  },

  p: {
    fontSize: '16px',

    warning: {
      color: 'red',
    }
  }
}
```

`output.css`

```css
.sticker {
  background-color: yellow;
}

p {
  font-size: 16px;
}

p.warning {
  color: red;
}
```

## T4

JS object keys can contain pseudo-classes, vendor prefixes, ids and attributes:

`source.styles.js`

```js
{
  a: {
    color: 'blue',

    ':hover': {
      color: 'red',
    }
  },

  ul: {
    '-ms-overflow-style': 'none',
    scrollbarWidth: 'none',
    '::-webkit-scrollbar': {
      display: 'none',
    },
  },

  input: {
    '#id1': { font: `normal 16px/1.5 'Helvetica Neue', sans-serif` },
    '[type=text]': {
      '::placeholder': {
        color: 'red',
      },
    },
  }
}
```

`output.css`

```css
a {
  color: blue;
}

a:hover {
  color: red;
}

ul {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

ul::-webkit-scrollbar {
  display: none;
}

input#id1 {
  font: normal 16px/1.5 'Helvetica Neue', sans-serif;
}

input[type='text']::placeholder {
  color: red;
}
```

## T5

Workaround when class name equals to tag name: put underscore before name.

`source.styles.js`

```js
{
  div: {
    video: {
      width: '100%',
      height: '100%',
    },
    _video: {
      padding: '10px',
    }
  }
}
```

`output.css`

```css
div video {
  width: 100%;
  height: 100%;
}

div.video {
  padding: 10px;
}
```

(Generally, you should avoid using tag names as class names.)

## T6

Double underscore is used as shorthand to target descendant of any level with class name:

`source.styles.js`

```js
{
  div: {
    fontSize: '16px',

    video: {
      width: '100%',
      height: '100%',
    },

    _video: {
      borderRadius: '10px',
    },

    __video: {
      fontStyle: 'italic',
    }
  }
}
```

`output.css`

```css
div {
  font-size: 16px;
}

div video {
  width: 100%;
  height: 100%;
}

div.video {
  border-radius: 10px;
}

div .video {
  font-style: italic;
}
```

Double underscore always suggests that the key is a class name, not a tag name.

## T7

Key can be a complex selector:

`source.styles.js`

```js
{
  ul: {
    '> li:not(:last-child) > img': {
      filter: 'grayscale(100%)',
    },
  },
}
```

`output.css`

```css
ul > li:not(:last-child) > img {
  filter: grayscale(100%);
}
```

## T8

To use style for multiple selectors, comma can be used:

`source.styles.js`

```js
{
  body: {
    'main, aside': {
      'input, textarea, button': {
        outline: 'none',
      },
    },
  }
}
```

`output.css`

```css
body main input,
body main textarea,
body main button,
body aside input,
body aside textarea,
body aside button {
  outline: none;
}
```

More complex and nested expressions are supported:

`source.styles.js`

```js
{
  body: {
  'main > p, aside > blockquote': {
    fontWeight: 700,
      ':hover': {
        color: 'red',
      },
    },
  },
}
```

`output.css`

```css
body main > p,
body aside > blockquote {
  font-weight: 700;
}

body main > p:hover,
body aside > blockquote:hover {
  color: red;
}
```

## T9

Content: if special character needed, use js unicode notation. It will be translated to CSS-compatible unicode (same goes for emoji):

`source.styles.js`

```js
{
  span: {
    '::before': {
      content: '👀',
    },
    '::after': {
      content: '\u00a0', // non-breaking space
    },
  },
}
```

`output.css`

```css
span::before {
  content: '\00d83d\00dc40';
}

span::after {
  content: '\0000a0';
}
```

## T10

Media queries:

`source.styles.js`

```js
{
  p: {
    fontSize: '1rem',

    '@media screen and (max-width: 768px)': {
      fontSize: `${14 / 16}rem`,
    }
  },

  ul: {
    marginBlock: '1em',

    '> li': {
      fontSize: '16px',

      '@media screen and (max-width: 768px)': {
        fontSize: '14px',
      },
    },
  },
}
```

`output.css`

```css
p {
  font-size: 1rem;
}

ul {
  margin-block: 1em;
}

ul > li {
  font-size: 16px;
}

@media screen and (max-width: 768px) {
  p {
    font-size: 0.875rem;
  }
  ul > li {
    font-size: 14px;
  }
}
```

Media query parts are extracted from nested keys and collected in the end of the CSS file.

## T11

Nested media queries also supported:

`source.styles.js`

```js
{
  p: {
    fontSize: '1rem',

    '@media screen and (max-width: 768px)': {
      fontSize: `${14 / 16}rem`,

      '@media screen and (orientation: portrait)': {
        fontSize: `${12 / 16}rem`,
      },
    },
  },
}
```

`output.css`

```css
@media screen and (max-width: 768px) {
  p {
    font-size: 0.875rem;
  }
  @media screen and (orientation: portrait) {
    p {
      font-size: 0.75rem;
    }
  }
}
```

## T12

Named media queries.
Named media queries are defined in `config.js` and should be used as `@media-name`:

`source.styles.js`

```js
{
  img: {
    width: '100%',
    '@dark': {
      filter: 'brightness(0.8) saturate(0.8)',
    },
  },
  div: {
    fontFamily: 'var(--sans-serif)',
    '@min-tablet': {
      fontSize: '14px',
    },
    '@phone': {
      fontSize: '12px',
    },
  },
}

```

`output.css`

```css
img {
  width: 100%;
}

div {
  font-family: var(--sans-serif);
}

@media (min-width: 500px) {
  div {
    font-size: 14px;
  }
}

@media (max-width: 499px) {
  div {
    font-size: 12px;
  }
}

:root.dark img {
  filter: brightness(0.8) saturate(0.8);
}

@media screen and (prefers-color-scheme: dark) {
  :root.auto img {
    filter: brightness(0.8) saturate(0.8);
  }
}
```

Note: for the name `@dark` is also configured in `config.js` as "media prefix" to include same styles for both auto- and user-selected dark mode.

Unfortunately, for now, there is a bug which won't allow to use media prefixes inside named media queries.

This doesn't work:

`source.styles.js`

```js
{
  div: {
    '@phone': {
      fontWeight: 300,

      '@dark': {
        fontSize: '12px',
      },
    },
  },
}
```

`output.css`

```css
@media (max-width: 499px) {
  div {
    font-weight: 300;
  }
}

@media screen and (prefers-color-scheme: dark) {
}
```

But this works as expected:

`source.styles.js`

```js
{
  div: {
    '@dark': {
      fontSize: '12px',

      '@phone': {
        fontWeight: 300,
      },
    },
  },
}

```

`output.css`

```css
:root.dark div {
  font-size: 12px;
}

@media (max-width: 499px) {
  :root.dark div {
    font-weight: 300;
  }
}

@media screen and (prefers-color-scheme: dark) {
  :root.auto div {
    font-size: 12px;
  }
  @media (max-width: 499px) {
    :root.auto div {
      font-weight: 300;
    }
  }
}
```

## T13

Layers are supported. Layer keys' values are collected through the nested keys and grouped in the end of the file.

`source.styles.js`

```js
{
  div: {
    thin: {
      fontWeight: 200,
      '@layer a': { fontWeight: 300 },
    },
  },
  blockquote: {
    color: 'red',
    '@layer a': { fontWeight: 300 },
  },
}
```

`output.css`

```css
div.thin {
  font-weight: 200;
}

blockquote {
  color: red;
}

@layer a {
  div.thin {
    font-weight: 300;
  }

  blockquote {
    font-weight: 300;
  }
}
```

Also is possible to define layers order:

`source.styles.js`

```js
{
  '@layer a, b, c': '',
}
```

`output.css`

```css
@layer a, b, c;
```

This key/value, if nested deeply, will be extracted and put in the beginning of the CSS file.

`source.styles.js`

```js
  '@layer x, y, z': '',

  a: {
    color: 'blue',

    ':hover': {
      color: 'red',
      '@layer a, b, c': '',
    },

    '@layer c, b, a': '',
  },

```

`output.css`

```css
@layer x, y, z;
@layer a, b, c;
@layer c, b, a;

a {
  color: blue;
}

a:hover {
  color: red;
}
```

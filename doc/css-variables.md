```js
{
  colors: {
    paper: {
      normal: '#212121',
      tinted: '#323232',
      bright: '#000000',
    }
  }
}
```

The function getCssVariables should accept a media prefix string and return a pretty formatted string of css variables:

```js
const mediaPrefix = 'dark'
const cssVariables = getCssVariables(mediaPrefix)
```

```css
:root.dark {
  --colors-paper-normal: #212121;
  --colors-paper-tinted: #323232;
  --colors-paper-bright: #000000;
}
```

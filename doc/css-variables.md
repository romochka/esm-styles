# JS to CSS variables translation

Source object:

```js
{
  colors: {
    paper: {
      normal: '#212121',
      tinted: '#323232',
      bright: '#000000',
    },
    ink: {
      normal: '#cccccc',
      tinted: '#999999',
      bright: { white: '#ffffff', yellow: '#ffff00' },
    },
  },
}
```

Output CSS:

```css
--colors-paper-normal: #212121;
--colors-paper-tinted: #323232;
--colors-paper-bright: #000000;
--colors-ink-normal: #cccccc;
--colors-ink-tinted: #999999;
--colors-ink-bright-white: #ffffff;
--colors-ink-bright-yellow: #ffff00;
```

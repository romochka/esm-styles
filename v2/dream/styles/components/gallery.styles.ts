export const Gallery = {
  figure: {
    margin: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.5rem',

    'img, figcaption': {
      margin: 0,
    },

    img: {
      aspectRatio: '1',
      objectFit: 'cover',
      borderRadius: $device.radius.sm,

      '@supports not (aspect-ratio: 1)': {
        height: '8rem',
      },
    },

    figcaption: {
      gridColumn: '1 / -1',
      fontSize: '0.8rem',
      color: $theme.ink.mild,
    },

    '@mobile': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
} satisfies StyleOf<Markup.Gallery>

export const Byline = {
  address: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    fontStyle: 'normal',
    fontSize: '0.85rem',

    img: {
      width: '2rem',
      height: '2rem',
      borderRadius: '50%',
    },

    b: {
      fontWeight: 600,
    },

    time: {
      color: $theme.ink.mild,
    },
  },
} satisfies StyleOf<Markup.Byline>

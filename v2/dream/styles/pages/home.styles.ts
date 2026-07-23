export const HomePage = {
  main: {
    maxWidth: '64rem',
    margin: '0 auto',
    padding: '2rem',

    h2: {
      fontSize: '1.4rem',
      letterSpacing: '0.02em',
      textTransform: 'uppercase',

      '::after': {
        content: '',
        display: 'block',
        width: '3rem',
        borderBottom: `2px solid ${$theme.accent}`,
        marginTop: '0.4rem',
      },
    },

    section: {
      feed: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))',
        gap: '2rem',
        containerType: 'inline-size',

        '@container (min-width: 48rem)': {
          gap: '3rem',
        },

        '@mobile': {
          gridTemplateColumns: '1fr',
        },
      },
    },
  },
} satisfies StyleOf<Markup.HomePage>

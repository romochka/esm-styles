export const HomePage = {
  main: {
    maxWidth: '64rem',
    margin: '0 auto',
    padding: '2rem',

    h2: {
      fontSize: '1.4rem',
      letterSpacing: '0.02em',
      textTransform: 'uppercase',
    },

    section: {
      feed: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))',
        gap: '2rem',

        '@mobile': {
          gridTemplateColumns: '1fr',
        },
      },
    },
  },
} satisfies StyleOf<Markup.HomePage>

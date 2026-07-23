export const StoryPage = {
  main: {
    maxWidth: '42rem',
    margin: '0 auto',
    padding: '2rem',

    section: {
      prose: {
        p: { lineHeight: 1.6 },
        h2: { fontSize: '1.3rem' },
        a: { color: $theme.accent },
        blockquote: {
          borderLeft: `3px solid ${$theme.ink.faint}`,
          paddingLeft: '1rem',
          color: $theme.ink.mild,
        },
      },
    },

    Gallery: {
      marginTop: '3rem',
    },

    nav: {
      related: {
        marginTop: '3rem',
        paddingTop: '2rem',
        borderTop: `1px solid ${$theme.ink.faint}`,

        h3: {
          fontSize: '1rem',
          color: $theme.ink.mild,
        },

        Story: {
          marginTop: '1.5rem',
        },
      },
    },
  },
} satisfies StyleOf<Markup.StoryPage>

export const StoryPage = {
  main: {
    maxWidth: '42rem',
    margin: '0 auto',
    padding: '2rem',

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

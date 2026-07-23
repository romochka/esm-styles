export const ArchivePage = {
  main: {
    maxWidth: '42rem',
    margin: '0 auto',
    padding: '2rem',

    section: {
      h3: {
        color: $theme.ink.mild,
        borderBottom: `1px solid ${$theme.ink.faint}`,
        paddingBottom: '0.5rem',
      },

      ul: {
        listStyle: 'none',
        margin: 0,
        padding: 0,

        li: {
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.4rem 0',

          a: {
            textDecoration: 'none',

            ':hover': {
              color: $theme.accent,
            },
          },

          time: {
            color: $theme.ink.mild,
            fontSize: '0.85rem',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
  },
} satisfies StyleOf<Markup.ArchivePage>

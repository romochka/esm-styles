export const Layout = {
  body: {
    display: 'grid',
    gridTemplateRows: 'auto 1fr auto',
    minHeight: '100vh',

    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
      padding: '1rem 2rem',
      borderBottom: `1px solid ${$theme.ink.faint}`,

      a: {
        logo: {
          fontSize: '1.4rem',
          fontWeight: 700,
          textDecoration: 'none',
        },
      },

      Nav: {
        marginLeft: 'auto',
      },
    },

    footer: {
      padding: '2rem',
      color: $theme.ink.mild,
      fontSize: '0.8rem',
      textAlign: 'center',
    },
  },
} satisfies StyleOf<Markup.Layout>

export const Nav = {
  nav: {
    button: {
      display: 'none',
    },

    ul: {
      display: 'flex',
      gap: '1.5rem',
      listStyle: 'none',
      margin: 0,
      padding: 0,

      li: {
        a: {
          textDecoration: 'none',
          color: $theme.ink.mild,

          ':hover': {
            color: $theme.ink.strong,
          },

          active: {
            color: $theme.ink.strong,
            borderBottom: `2px solid ${$theme.accent}`,
          },
        },
      },
    },

    '@mobile': {
      button: {
        display: 'block',
        background: 'none',
        border: 'none',
        fontSize: '1.4rem',
      },

      ul: {
        display: 'none',
      },

      open: {
        ul: {
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        },
      },
    },
  },
} satisfies StyleOf<Markup.Nav>

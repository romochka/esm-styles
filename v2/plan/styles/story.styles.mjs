export const Story = {
  article: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',

    header: {
      h1: {
        fontSize: '2rem',
      },
      p: {
        fontStyle: 'italic',
      },
    },

    main: {
      img: {
        width: '100%',
        height: 'auto',
        objectFit: 'cover',
      },
    },

    footer: {
      fontSize: '0.8rem',

      a: {
        textDecoration: 'none',
        color: 'blue',
      },
    },
  },
}

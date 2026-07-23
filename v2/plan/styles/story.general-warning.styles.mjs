// style with general warning

export const Story = {
  // object name highlighted in yellow because footer style is missing
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
  },
}
